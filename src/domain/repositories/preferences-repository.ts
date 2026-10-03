import type { ReminderSettings } from '@/domain/models/reminder-settings';
import type { UserPreferences } from '@/domain/models/user-preferences';

export interface PreferencesRepository {
  loadUserPreferences(): Promise<UserPreferences>;
  saveUserPreferences(preferences: UserPreferences): Promise<void>;
  loadReminderSettings(): Promise<ReminderSettings>;
  saveReminderSettings(settings: ReminderSettings): Promise<void>;
}
