import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const SESSION_REMINDERS_CHANNEL_ID = 'session-reminders';
export const RACE_ALARMS_CHANNEL_ID = 'race-alarms';

export async function ensureSessionReminderChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  await Notifications.setNotificationChannelAsync(SESSION_REMINDERS_CHANNEL_ID, {
    name: 'Session reminders',
    description: 'Reminders before Formula 1 sessions',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 200, 120, 200],
    lightColor: '#E10600',
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

export async function ensureRaceAlarmChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  await Notifications.setNotificationChannelAsync(RACE_ALARMS_CHANNEL_ID, {
    name: 'Race alarms',
    description: 'Alarm-style alerts when a Formula 1 session is about to start',
    importance: Notifications.AndroidImportance.MAX,
    bypassDnd: true,
    vibrationPattern: [0, 600, 300, 600, 300, 600],
    lightColor: '#E10600',
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    enableVibrate: true,
    enableLights: true,
  });
}
