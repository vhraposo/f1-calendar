import { readJson, StorageKeys, writeJson } from '@/core/persistence/key-value-store';
import { DEFAULT_REMINDER_SETTINGS, type ReminderSettings } from '@/domain/models/reminder-settings';
import { DEFAULT_USER_PREFERENCES, type UserPreferences } from '@/domain/models/user-preferences';
import type { PreferencesRepository } from '@/domain/repositories/preferences-repository';

export class KeyValuePreferencesRepository implements PreferencesRepository {
  async loadUserPreferences(): Promise<UserPreferences> {
    const stored = await readJson<Partial<UserPreferences>>(StorageKeys.userPreferences);
    return { ...DEFAULT_USER_PREFERENCES, ...stored };
  }

  async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    await writeJson(StorageKeys.userPreferences, preferences);
  }

  async loadReminderSettings(): Promise<ReminderSettings> {
    const stored = await readJson<Partial<ReminderSettings>>(StorageKeys.reminderSettings);
    if (!stored) {
      return DEFAULT_REMINDER_SETTINGS;
    }
    return {
      ...DEFAULT_REMINDER_SETTINGS,
      ...stored,
      sessions: { ...DEFAULT_REMINDER_SETTINGS.sessions, ...stored.sessions },
    };
  }

  async saveReminderSettings(settings: ReminderSettings): Promise<void> {
    await writeJson(StorageKeys.reminderSettings, settings);
  }
}
