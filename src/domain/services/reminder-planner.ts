import { APP_CONFIG } from '@/core/config/app-config';
import type { ReminderSettings } from '@/domain/models/reminder-settings';
import type { Session } from '@/domain/models/session';
import { getNominalSessionEnd } from '@/domain/services/session-duration';

export type PlannedReminderKind = 'notification' | 'alarm';

export interface PlannedReminder {
  id: string;
  kind: PlannedReminderKind;
  sessionId: string;
  grandPrixId: string;
  sessionType: Session['type'];
  leadMinutes: number;
  triggerAt: string;
  sessionStartAt: string;
}

export function buildNotificationReminderId(sessionId: string, leadMinutes: number): string {
  return `${sessionId}-${leadMinutes}m`;
}

export function buildAlarmReminderId(sessionId: string, leadMinutes: number): string {
  return `${sessionId}-alarm-${leadMinutes}m`;
}

interface PlanSessionRemindersInput {
  sessions: Session[];
  settings: ReminderSettings;
  now: number;
  horizonDays?: number;
  maxReminders?: number;
}

export function planSessionReminders(input: PlanSessionRemindersInput): PlannedReminder[] {
  const horizonDays = input.horizonDays ?? APP_CONFIG.reminderHorizonDays;
  const maxReminders = input.maxReminders ?? APP_CONFIG.maxScheduledReminders;
  const horizonMs = horizonDays * 24 * 60 * 60 * 1000;
  const minimumTriggerTime = input.now + 30_000;
  const planned: PlannedReminder[] = [];
  const seen = new Set<string>();

  const push = (reminder: PlannedReminder) => {
    if (seen.has(reminder.id)) {
      return;
    }
    seen.add(reminder.id);
    planned.push(reminder);
  };

  for (const session of input.sessions) {
    if (session.isCancelled) {
      continue;
    }
    const preference = input.settings.sessions[session.type];
    if (!preference) {
      continue;
    }
    const sessionStart = new Date(session.startAt).getTime();
    const sessionEnd = new Date(getNominalSessionEnd(session)).getTime();
    if (sessionEnd <= input.now || sessionStart - input.now > horizonMs) {
      continue;
    }

    if (input.settings.notificationsEnabled && preference.enabled) {
      for (const lead of preference.leads) {
        const triggerAt = sessionStart - lead * 60_000;
        if (triggerAt < minimumTriggerTime) {
          continue;
        }
        push({
          id: buildNotificationReminderId(session.id, lead),
          kind: 'notification',
          sessionId: session.id,
          grandPrixId: session.grandPrixId,
          sessionType: session.type,
          leadMinutes: lead,
          triggerAt: new Date(triggerAt).toISOString(),
          sessionStartAt: session.startAt,
        });
      }
    }

    if (input.settings.alarmsEnabled && preference.alarmEnabled) {
      const triggerAt = sessionStart - preference.alarmLeadMinutes * 60_000;
      if (triggerAt >= minimumTriggerTime) {
        push({
          id: buildAlarmReminderId(session.id, preference.alarmLeadMinutes),
          kind: 'alarm',
          sessionId: session.id,
          grandPrixId: session.grandPrixId,
          sessionType: session.type,
          leadMinutes: preference.alarmLeadMinutes,
          triggerAt: new Date(triggerAt).toISOString(),
          sessionStartAt: session.startAt,
        });
      }
    }
  }

  return planned
    .sort((a, b) => new Date(a.triggerAt).getTime() - new Date(b.triggerAt).getTime())
    .slice(0, maxReminders);
}
