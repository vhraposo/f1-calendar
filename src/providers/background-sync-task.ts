import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { getDeviceLanguageTags, getDeviceRegionCode } from '@/core/localization/device-locale';
import { resolveLanguage } from '@/i18n';
import { reconcileSessionReminders } from '@/notifications/reminder-reconciliation';
import { createAppServices } from '@/providers/create-app-services';

export const BACKGROUND_SYNC_TASK = 'f1calendar-background-sync';

TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    const services = createAppServices();
    await services.syncService.ensureBroadcastSeed();
    const results = await services.syncService.syncUpcomingSeasons();
    if (results.every((result) => result.status === 'failed')) {
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
    const [preferences, reminderSettings] = await Promise.all([
      services.preferencesRepository.loadUserPreferences(),
      services.preferencesRepository.loadReminderSettings(),
    ]);
    await reconcileSessionReminders({
      services,
      settings: reminderSettings,
      countryCode: preferences.countryCode ?? getDeviceRegionCode(),
      language: resolveLanguage(preferences.language, getDeviceLanguageTags()),
    });
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export async function registerBackgroundSync(): Promise<void> {
  try {
    const status = await BackgroundTask.getStatusAsync();
    if (status === BackgroundTask.BackgroundTaskStatus.Restricted) {
      return;
    }
    const registered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    if (!registered) {
      await BackgroundTask.registerTaskAsync(BACKGROUND_SYNC_TASK, { minimumInterval: 6 * 60 });
    }
  } catch {
    // Background execution is best-effort; the app remains fully usable without it.
  }
}
