import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  DEFAULT_REMINDER_SETTINGS,
  type ReminderSettings,
} from '@/domain/models/reminder-settings';
import { DEFAULT_USER_PREFERENCES, type UserPreferences } from '@/domain/models/user-preferences';
import { useServices } from '@/providers/services-provider';

export interface PreferencesContextValue {
  preferences: UserPreferences;
  reminderSettings: ReminderSettings;
  isLoaded: boolean;
  updatePreferences: (partial: Partial<UserPreferences>) => Promise<void>;
  updateReminderSettings: (next: ReminderSettings) => Promise<void>;
  reload: () => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const services = useServices();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(DEFAULT_REMINDER_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [reloadVersion, setReloadVersion] = useState(0);

  const reload = useCallback(async () => {
    setReloadVersion((current) => current + 1);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const [storedPreferences, storedSettings] = await Promise.all([
        services.preferencesRepository.loadUserPreferences(),
        services.preferencesRepository.loadReminderSettings(),
      ]);
      if (active) {
        setPreferences(storedPreferences);
        setReminderSettings(storedSettings);
        setIsLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [reloadVersion, services.preferencesRepository]);

  const updatePreferences = useCallback(
    async (partial: Partial<UserPreferences>) => {
      const next = { ...preferences, ...partial };
      setPreferences(next);
      await services.preferencesRepository.saveUserPreferences(next);
    },
    [preferences, services.preferencesRepository],
  );

  const updateReminderSettings = useCallback(
    async (next: ReminderSettings) => {
      setReminderSettings(next);
      await services.preferencesRepository.saveReminderSettings(next);
    },
    [services.preferencesRepository],
  );

  const value = useMemo(
    () => ({ preferences, reminderSettings, isLoaded, updatePreferences, updateReminderSettings, reload }),
    [preferences, reminderSettings, isLoaded, updatePreferences, updateReminderSettings, reload],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context;
}
