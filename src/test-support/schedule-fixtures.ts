import type { GrandPrix } from '@/domain/models/grand-prix';
import type { ReminderSettings } from '@/domain/models/reminder-settings';
import { DEFAULT_REMINDER_SETTINGS } from '@/domain/models/reminder-settings';
import type { Session, SessionType } from '@/domain/models/session';

let sessionCounter = 0;

export function makeSession(overrides: Partial<Session> & { type: SessionType }): Session {
  sessionCounter += 1;
  return {
    id: overrides.id ?? `session-${sessionCounter}`,
    grandPrixId: overrides.grandPrixId ?? '2026-01',
    type: overrides.type,
    name: overrides.name ?? overrides.type,
    startAt: overrides.startAt ?? '2026-03-08T04:00:00.000Z',
    endAt: overrides.endAt ?? null,
    timezone: overrides.timezone ?? 'Australia/Melbourne',
    scheduledLaps: overrides.scheduledLaps ?? null,
    isCancelled: overrides.isCancelled ?? false,
  };
}

export function makeGrandPrix(overrides: Partial<GrandPrix> = {}): GrandPrix {
  return {
    id: overrides.id ?? '2026-01',
    seasonYear: overrides.seasonYear ?? 2026,
    round: overrides.round ?? 1,
    name: overrides.name ?? 'Australian Grand Prix',
    officialName: overrides.officialName ?? null,
    country: overrides.country ?? 'Australia',
    countryCode: overrides.countryCode ?? 'AU',
    city: overrides.city ?? 'Melbourne',
    circuitId: overrides.circuitId ?? 'circuit-albert-park',
    startAt: overrides.startAt ?? '2026-03-06T01:30:00.000Z',
    endAt: overrides.endAt ?? '2026-03-08T04:00:00.000Z',
    isCancelled: overrides.isCancelled ?? false,
    sprintWeekend: overrides.sprintWeekend ?? false,
  };
}

export function makeReminderSettings(overrides: Partial<ReminderSettings> = {}): ReminderSettings {
  return {
    ...DEFAULT_REMINDER_SETTINGS,
    notificationsEnabled: true,
    ...overrides,
    sessions: { ...DEFAULT_REMINDER_SETTINGS.sessions, ...overrides.sessions },
  };
}
