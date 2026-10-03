import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { NotificationContentInput } from 'expo-notifications';
import type { PlannedReminder, PlannedReminderKind } from '@/domain/services/reminder-planner';
import {
  ensureRaceAlarmChannel,
  ensureSessionReminderChannel,
  RACE_ALARMS_CHANNEL_ID,
  SESSION_REMINDERS_CHANNEL_ID,
} from '@/notifications/notification-channels';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface ReconcileResult {
  scheduled: number;
  cancelled: number;
  kept: number;
}

export type ReminderContentBuilder = (reminder: PlannedReminder) => NotificationContentInput;

export class SessionNotificationScheduler {
  constructor(private readonly kind: PlannedReminderKind) {}

  private get channelId(): string {
    return this.kind === 'alarm' ? RACE_ALARMS_CHANNEL_ID : SESSION_REMINDERS_CHANNEL_ID;
  }

  async ensureChannels(): Promise<void> {
    if (this.kind === 'alarm') {
      await ensureRaceAlarmChannel();
    } else {
      await ensureSessionReminderChannel();
    }
  }

  async getPermissionStatus(): Promise<PermissionStatus> {
    const permissions = await Notifications.getPermissionsAsync();
    if (permissions.granted) {
      return 'granted';
    }
    if (permissions.canAskAgain) {
      return 'undetermined';
    }
    return 'denied';
  }

  async requestPermission(): Promise<PermissionStatus> {
    await this.ensureChannels();
    const current = await this.getPermissionStatus();
    if (current === 'granted') {
      return 'granted';
    }
    const requested = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true },
    });
    if (requested.granted) {
      return 'granted';
    }
    return requested.canAskAgain ? 'undetermined' : 'denied';
  }

  async reconcile(planned: PlannedReminder[], buildContent: ReminderContentBuilder): Promise<ReconcileResult> {
    const permission = await this.getPermissionStatus();
    if (permission !== 'granted') {
      return { scheduled: 0, cancelled: 0, kept: 0 };
    }

    const scheduledRequests = await Notifications.getAllScheduledNotificationsAsync();
    const ourRequests = scheduledRequests.filter(
      (request) => request.content.data?.kind === this.kind,
    );
    const plannedIds = new Set(planned.map((reminder) => reminder.id));
    const existingIds = new Set(
      ourRequests
        .map((request) => request.content.data?.reminderId)
        .filter((id): id is string => typeof id === 'string'),
    );

    let cancelled = 0;
    for (const request of ourRequests) {
      const reminderId = request.content.data?.reminderId;
      if (typeof reminderId !== 'string' || !plannedIds.has(reminderId)) {
        await Notifications.cancelScheduledNotificationAsync(request.identifier);
        cancelled += 1;
      }
    }

    let scheduled = 0;
    let kept = 0;
    const now = Date.now();
    for (const reminder of planned) {
      if (existingIds.has(reminder.id)) {
        kept += 1;
        continue;
      }
      const triggerDate = new Date(reminder.triggerAt);
      if (triggerDate.getTime() < now + 30_000) {
        continue;
      }
      await Notifications.scheduleNotificationAsync({
        content: buildContent(reminder),
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
          channelId: Platform.OS === 'android' ? this.channelId : undefined,
        },
      });
      scheduled += 1;
    }

    return { scheduled, cancelled, kept };
  }

  async cancelReminder(reminderId: string): Promise<void> {
    const scheduledRequests = await Notifications.getAllScheduledNotificationsAsync();
    for (const request of scheduledRequests) {
      if (request.content.data?.kind === this.kind && request.content.data?.reminderId === reminderId) {
        await Notifications.cancelScheduledNotificationAsync(request.identifier);
      }
    }
  }

  async cancelAll(): Promise<void> {
    const scheduledRequests = await Notifications.getAllScheduledNotificationsAsync();
    for (const request of scheduledRequests) {
      if (request.content.data?.kind === this.kind) {
        await Notifications.cancelScheduledNotificationAsync(request.identifier);
      }
    }
  }

  async listScheduledReminderIds(): Promise<string[]> {
    const scheduledRequests = await Notifications.getAllScheduledNotificationsAsync();
    return scheduledRequests
      .filter((request) => request.content.data?.kind === this.kind)
      .map((request) => request.content.data?.reminderId)
      .filter((id): id is string => typeof id === 'string');
  }
}
