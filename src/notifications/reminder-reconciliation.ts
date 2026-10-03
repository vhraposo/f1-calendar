import { getDeviceTimeZone } from '@/core/time/instant';
import { APP_CONFIG } from '@/core/config/app-config';
import type { GrandPrix } from '@/domain/models/grand-prix';
import type { ReminderSettings } from '@/domain/models/reminder-settings';
import type { Session } from '@/domain/models/session';
import { selectBroadcasters } from '@/domain/services/broadcast-directory';
import { planSessionReminders } from '@/domain/services/reminder-planner';
import type { ResolvedLanguage } from '@/i18n';
import { translate } from '@/i18n';
import type { ReconcileResult } from '@/notifications/session-notification-scheduler';
import { buildSessionNotificationContent } from '@/notifications/session-notification-content';
import type { AppServices } from '@/providers/create-app-services';

export interface ReconcileRemindersInput {
  services: AppServices;
  settings: ReminderSettings;
  countryCode: string | null;
  language: ResolvedLanguage;
  deviceTimeZone?: string;
  now?: number;
}

export interface ReconcileRemindersResult {
  planned: number;
  notifications: ReconcileResult;
  alarms: ReconcileResult;
}

export async function reconcileSessionReminders(
  input: ReconcileRemindersInput,
): Promise<ReconcileRemindersResult> {
  const now = input.now ?? Date.now();
  const deviceTimeZone = input.deviceTimeZone ?? getDeviceTimeZone();
  const { services, settings } = input;

  if (!settings.notificationsEnabled) {
    await services.notificationScheduler.cancelAll();
  }
  if (!settings.alarmsEnabled) {
    await services.alarmScheduler.cancelAll();
  }
  if (!settings.notificationsEnabled && !settings.alarmsEnabled) {
    return {
      planned: 0,
      notifications: { scheduled: 0, cancelled: 0, kept: 0 },
      alarms: { scheduled: 0, cancelled: 0, kept: 0 },
    };
  }

  const sessions = await services.scheduleRepository.listUpcomingSessions(
    new Date(now).toISOString(),
    300,
  );
  const planned = planSessionReminders({
    sessions,
    settings,
    now,
    horizonDays: APP_CONFIG.reminderHorizonDays,
    maxReminders: APP_CONFIG.maxScheduledReminders,
  });

  const grandPrixById = new Map<string, GrandPrix>();
  for (const reminder of planned) {
    if (!grandPrixById.has(reminder.grandPrixId)) {
      const grandPrix = await services.scheduleRepository.getGrandPrix(reminder.grandPrixId);
      if (grandPrix) {
        grandPrixById.set(reminder.grandPrixId, grandPrix);
      }
    }
  }

  const sessionById = new Map<string, Session>(sessions.map((session) => [session.id, session]));
  const broadcasts = input.countryCode
    ? await services.broadcastRepository.listByCountry(input.countryCode)
    : [];

  const buildContent = (reminder: (typeof planned)[number]) => {
    const session = sessionById.get(reminder.sessionId);
    const grandPrix = grandPrixById.get(reminder.grandPrixId);
    if (!session || !grandPrix) {
      return {
        title: translate(input.language, 'app.name'),
        body: '',
        data: { reminderId: reminder.id, kind: reminder.kind },
      };
    }
    const broadcaster =
      selectBroadcasters(broadcasts, {
        countryCode: input.countryCode ?? '',
        seasonYear: grandPrix.seasonYear,
        sessionType: session.type,
        now,
      })[0]?.broadcaster ?? null;
    return buildSessionNotificationContent({
      reminder,
      session,
      grandPrix,
      language: input.language,
      deviceTimeZone,
      broadcaster,
    });
  };

  const notificationReminders = planned.filter((reminder) => reminder.kind === 'notification');
  const alarmReminders = planned.filter((reminder) => reminder.kind === 'alarm');

  const notifications = settings.notificationsEnabled
    ? await services.notificationScheduler.reconcile(notificationReminders, buildContent)
    : { scheduled: 0, cancelled: 0, kept: 0 };

  const alarms = settings.alarmsEnabled
    ? await services.alarmScheduler.reconcile(alarmReminders, buildContent)
    : { scheduled: 0, cancelled: 0, kept: 0 };

  return { planned: planned.length, notifications, alarms };
}
