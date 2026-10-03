import { makeReminderSettings, makeSession } from '@/test-support/schedule-fixtures';
import {
  buildAlarmReminderId,
  buildNotificationReminderId,
  planSessionReminders,
} from '@/domain/services/reminder-planner';

describe('reminder planner', () => {
  const now = Date.parse('2026-03-06T00:00:00.000Z');

  it('builds deterministic notification identifiers', () => {
    expect(buildNotificationReminderId('2026-24-race', 60)).toBe('2026-24-race-60m');
    expect(buildNotificationReminderId('2026-24-qualifying', 15)).toBe('2026-24-qualifying-15m');
    expect(buildAlarmReminderId('2026-24-race', 30)).toBe('2026-24-race-alarm-30m');
  });

  it('plans notification reminders from the session preference leads', () => {
    const race = makeSession({
      id: '2026-01-race',
      type: 'RACE',
      startAt: '2026-03-08T04:00:00.000Z',
    });
    const settings = makeReminderSettings({
      sessions: {
        ...makeReminderSettings().sessions,
        RACE: { enabled: true, leads: [1440, 60, 15], alarmEnabled: false, alarmLeadMinutes: 30 },
      },
    });
    const planned = planSessionReminders({ sessions: [race], settings, now });
    const ids = planned.map((reminder) => reminder.id);
    expect(ids).toEqual(['2026-01-race-1440m', '2026-01-race-60m', '2026-01-race-15m']);
  });

  it('plans alarms with their own identifiers', () => {
    const race = makeSession({
      id: '2026-01-race',
      type: 'RACE',
      startAt: '2026-03-08T04:00:00.000Z',
    });
    const base = makeReminderSettings();
    const settings = makeReminderSettings({
      alarmsEnabled: true,
      sessions: {
        ...base.sessions,
        RACE: { enabled: false, leads: [], alarmEnabled: true, alarmLeadMinutes: 30 },
      },
    });
    const planned = planSessionReminders({ sessions: [race], settings, now });
    expect(planned).toHaveLength(1);
    expect(planned[0].id).toBe('2026-01-race-alarm-30m');
    expect(planned[0].kind).toBe('alarm');
  });

  it('skips reminders whose trigger is already in the past', () => {
    const race = makeSession({
      id: '2026-01-race',
      type: 'RACE',
      startAt: '2026-03-08T04:00:00.000Z',
    });
    const base = makeReminderSettings();
    const settings = makeReminderSettings({
      sessions: {
        ...base.sessions,
        RACE: { enabled: true, leads: [1440, 60, 15], alarmEnabled: false, alarmLeadMinutes: 30 },
      },
    });
    const laterNow = Date.parse('2026-03-08T03:20:00.000Z');
    const planned = planSessionReminders({ sessions: [race], settings, now: laterNow });
    expect(planned.map((reminder) => reminder.id)).toEqual(['2026-01-race-15m']);
  });

  it('excludes sessions outside the scheduling horizon', () => {
    const race = makeSession({
      id: '2026-24-race',
      type: 'RACE',
      startAt: '2026-12-06T13:00:00.000Z',
    });
    const settings = makeReminderSettings();
    const planned = planSessionReminders({ sessions: [race], settings, now });
    expect(planned).toHaveLength(0);
  });

  it('never plans reminders for cancelled sessions', () => {
    const race = makeSession({
      id: '2026-01-race',
      type: 'RACE',
      startAt: '2026-03-08T04:00:00.000Z',
      isCancelled: true,
    });
    const settings = makeReminderSettings();
    expect(planSessionReminders({ sessions: [race], settings, now })).toHaveLength(0);
  });

  it('returns nothing when notifications and alarms are disabled', () => {
    const race = makeSession({ id: '2026-01-race', type: 'RACE', startAt: '2026-03-08T04:00:00.000Z' });
    const settings = makeReminderSettings({ notificationsEnabled: false, alarmsEnabled: false });
    expect(planSessionReminders({ sessions: [race], settings, now })).toHaveLength(0);
  });

  it('deduplicates identical reminder identifiers', () => {
    const race = makeSession({ id: '2026-01-race', type: 'RACE', startAt: '2026-03-08T04:00:00.000Z' });
    const settings = makeReminderSettings();
    const planned = planSessionReminders({ sessions: [race, race], settings, now });
    const unique = new Set(planned.map((reminder) => reminder.id));
    expect(unique.size).toBe(planned.length);
  });

  it('caps the number of planned reminders keeping the nearest first', () => {
    const sessions = [1, 2, 3, 4].map((round) =>
      makeSession({
        id: `2026-0${round}-race`,
        type: 'RACE',
        grandPrixId: `2026-0${round}`,
        startAt: new Date(now + round * 86_400_000).toISOString(),
      }),
    );
    const settings = makeReminderSettings();
    const planned = planSessionReminders({ sessions, settings, now, maxReminders: 2 });
    expect(planned).toHaveLength(2);
    expect(planned[0].sessionId).toBe('2026-01-race');
  });
});
