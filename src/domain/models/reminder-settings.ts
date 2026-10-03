import type { SessionType } from '@/domain/models/session';

export type ReminderLeadMinutes = 1440 | 60 | 30 | 15;

export const REMINDER_LEAD_OPTIONS: ReminderLeadMinutes[] = [1440, 60, 30, 15];

export const REMINDER_LEAD_LABEL_KEYS = {
  1440: 'reminders.lead.day',
  60: 'reminders.lead.hour',
  30: 'reminders.lead.minutes30',
  15: 'reminders.lead.minutes15',
} as const;

export interface SessionReminderPreference {
  enabled: boolean;
  leads: ReminderLeadMinutes[];
  alarmEnabled: boolean;
  alarmLeadMinutes: ReminderLeadMinutes;
}

export type SessionReminderPreferences = Record<SessionType, SessionReminderPreference>;

export interface ReminderSettings {
  notificationsEnabled: boolean;
  alarmsEnabled: boolean;
  sessions: SessionReminderPreferences;
}

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  notificationsEnabled: false,
  alarmsEnabled: false,
  sessions: {
    PRACTICE_1: { enabled: false, leads: [60], alarmEnabled: false, alarmLeadMinutes: 15 },
    PRACTICE_2: { enabled: false, leads: [60], alarmEnabled: false, alarmLeadMinutes: 15 },
    PRACTICE_3: { enabled: false, leads: [60], alarmEnabled: false, alarmLeadMinutes: 15 },
    SPRINT_QUALIFYING: { enabled: true, leads: [60], alarmEnabled: false, alarmLeadMinutes: 15 },
    SPRINT: { enabled: true, leads: [60], alarmEnabled: false, alarmLeadMinutes: 15 },
    QUALIFYING: { enabled: true, leads: [60], alarmEnabled: false, alarmLeadMinutes: 15 },
    RACE: { enabled: true, leads: [1440, 60, 15], alarmEnabled: false, alarmLeadMinutes: 30 },
    OTHER: { enabled: false, leads: [60], alarmEnabled: false, alarmLeadMinutes: 15 },
  },
};
