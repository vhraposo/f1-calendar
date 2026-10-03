import { Platform } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import type { PlannedReminder } from '@/domain/services/reminder-planner';
import {
  SessionNotificationScheduler,
  type PermissionStatus,
  type ReconcileResult,
} from '@/notifications/session-notification-scheduler';

export interface AlarmCapabilities {
  platform: 'android' | 'ios' | 'other';
  exactAlarms: boolean;
  nativeSystemAlarm: boolean;
  supportsBypassDoNotDisturb: boolean;
  notes: string;
}

export interface AlarmScheduler {
  getCapabilities(): AlarmCapabilities;
  getPermissionStatus(): Promise<PermissionStatus>;
  requestPermission(): Promise<PermissionStatus>;
  reconcile(planned: PlannedReminder[], buildContent: Parameters<SessionNotificationScheduler['reconcile']>[1]): Promise<ReconcileResult>;
  cancelAll(): Promise<void>;
  listScheduledAlarmIds(): Promise<string[]>;
  openSystemAlarmSettings(): Promise<void>;
}

export function getAlarmCapabilities(): AlarmCapabilities {
  if (Platform.OS === 'android') {
    return {
      platform: 'android',
      exactAlarms: true,
      nativeSystemAlarm: false,
      supportsBypassDoNotDisturb: true,
      notes:
        'Alarms are delivered through Android notification channels with maximum importance and exact scheduling. Android 12+ requires the Alarms & reminders special access.',
    };
  }
  if (Platform.OS === 'ios') {
    return {
      platform: 'ios',
      exactAlarms: true,
      nativeSystemAlarm: false,
      supportsBypassDoNotDisturb: false,
      notes:
        'Alarms are delivered as time-sensitive notifications. AlarmKit (iOS 26+) requires a native module that is not bundled in this release.',
    };
  }
  return {
    platform: 'other',
    exactAlarms: false,
    nativeSystemAlarm: false,
    supportsBypassDoNotDisturb: false,
    notes: 'Alarms are not supported on this platform.',
  };
}

export class NotificationBackedAlarmScheduler implements AlarmScheduler {
  private readonly scheduler = new SessionNotificationScheduler('alarm');

  getCapabilities(): AlarmCapabilities {
    return getAlarmCapabilities();
  }

  getPermissionStatus(): Promise<PermissionStatus> {
    return this.scheduler.getPermissionStatus();
  }

  requestPermission(): Promise<PermissionStatus> {
    return this.scheduler.requestPermission();
  }

  reconcile(
    planned: PlannedReminder[],
    buildContent: Parameters<SessionNotificationScheduler['reconcile']>[1],
  ): Promise<ReconcileResult> {
    return this.scheduler.reconcile(planned, buildContent);
  }

  cancelAll(): Promise<void> {
    return this.scheduler.cancelAll();
  }

  listScheduledAlarmIds(): Promise<string[]> {
    return this.scheduler.listScheduledReminderIds();
  }

  async openSystemAlarmSettings(): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }
    try {
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.REQUEST_SCHEDULE_EXACT_ALARM,
      );
    } catch {
      await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.SETTINGS);
    }
  }
}
