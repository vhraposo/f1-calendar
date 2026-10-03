import * as Calendar from 'expo-calendar';
import type { ExpoCalendar, ExpoCalendarEvent } from 'expo-calendar';
import { addMinutes } from '@/core/time/instant';
import { CalendarPermissionDenied } from '@/core/errors/app-errors';
import type { Circuit } from '@/domain/models/circuit';
import type { GrandPrix } from '@/domain/models/grand-prix';
import type { Session } from '@/domain/models/session';
import type { CalendarLinkRepository } from '@/domain/repositories/calendar-link-repository';
import { getNominalSessionEnd } from '@/domain/services/session-duration';

export type CalendarPermissionStatus = 'granted' | 'denied' | 'undetermined';

export const APP_CALENDAR_TITLE = 'F1 Calendar';
const EVENT_MARKER_PREFIX = '[f1calendar:';

export interface SessionCalendarEventInput {
  session: Session;
  grandPrix: GrandPrix;
  circuit: Circuit | null;
  title: string;
}

function buildEventNotes(session: Session, grandPrix: GrandPrix): string {
  return `${grandPrix.name}\n${EVENT_MARKER_PREFIX}${session.id}]`;
}

export class DeviceCalendarIntegration {
  constructor(private readonly links: CalendarLinkRepository) {}

  async isAvailable(): Promise<boolean> {
    try {
      return await Calendar.isAvailableAsync();
    } catch {
      return false;
    }
  }

  async getPermissionStatus(): Promise<CalendarPermissionStatus> {
    const response = await Calendar.getCalendarPermissions(true);
    if (response.granted) {
      return 'granted';
    }
    return response.canAskAgain ? 'undetermined' : 'denied';
  }

  async requestPermission(): Promise<CalendarPermissionStatus> {
    const response = await Calendar.requestCalendarPermissions(true);
    if (response.granted) {
      return 'granted';
    }
    return response.canAskAgain ? 'undetermined' : 'denied';
  }

  async isSessionAdded(sessionId: string): Promise<boolean> {
    const link = await this.links.find(sessionId);
    return link !== null;
  }

  async addSession(input: SessionCalendarEventInput): Promise<'added' | 'already-added'> {
    const existing = await this.links.find(input.session.id);
    if (existing) {
      return 'already-added';
    }
    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      throw new CalendarPermissionDenied();
    }
    const calendar = await this.getOrCreateCalendar();
    const event = await calendar.createEvent({
      title: input.title,
      startDate: new Date(input.session.startAt),
      endDate: new Date(getNominalSessionEnd(input.session)),
      timeZone: input.session.timezone,
      notes: buildEventNotes(input.session, input.grandPrix),
      location: input.circuit ? `${input.circuit.name}, ${input.circuit.city}` : input.grandPrix.city,
      alarms: [{ relativeOffset: -10 }],
    });
    await this.links.save({
      sessionId: input.session.id,
      eventId: event.id,
      calendarId: calendar.id,
      createdAt: new Date().toISOString(),
    });
    return 'added';
  }

  async addWeekend(inputs: SessionCalendarEventInput[]): Promise<number> {
    let added = 0;
    for (const input of inputs) {
      const result = await this.addSession(input);
      if (result === 'added') {
        added += 1;
      }
    }
    return added;
  }

  async removeSession(sessionId: string, sessionStartAt: string): Promise<void> {
    const link = await this.links.find(sessionId);
    if (!link) {
      return;
    }
    try {
      const rangeStart = new Date(addMinutes(sessionStartAt, -60 * 24));
      const rangeEnd = new Date(addMinutes(sessionStartAt, 60 * 24));
      const events = await Calendar.listEvents([link.calendarId], rangeStart, rangeEnd);
      const event = events.find((candidate) => candidate.id === link.eventId);
      if (event) {
        await this.deleteEvent(event);
      }
    } catch {
      // The event may already be gone or unreadable with write-only permission.
    }
    await this.links.remove(sessionId);
  }

  private async deleteEvent(event: ExpoCalendarEvent): Promise<void> {
    await event.delete();
  }

  private async getOrCreateCalendar(): Promise<ExpoCalendar> {
    const calendars = await Calendar.getCalendars(Calendar.EntityTypes.EVENT);
    const existing = calendars.find(
      (calendar) => calendar.title === APP_CALENDAR_TITLE && calendar.allowsModifications,
    );
    if (existing) {
      return existing;
    }
    return Calendar.createCalendar({
      title: APP_CALENDAR_TITLE,
      name: APP_CALENDAR_TITLE,
      color: '#E10600',
      entityType: Calendar.EntityTypes.EVENT,
      ownerAccount: APP_CALENDAR_TITLE,
    });
  }
}
