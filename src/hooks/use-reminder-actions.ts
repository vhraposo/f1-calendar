import { useCallback } from 'react';
import type { ReminderSettings } from '@/domain/models/reminder-settings';
import type { SessionType } from '@/domain/models/session';
import { reconcileSessionReminders } from '@/notifications/reminder-reconciliation';
import { useCountryCode } from '@/hooks/use-country-code';
import { usePreferences } from '@/providers/preferences-provider';
import { useServices } from '@/providers/services-provider';
import { useTranslation } from '@/providers/i18n-provider';

export interface ReminderActions {
  applyReminderSettings: (next: ReminderSettings) => Promise<void>;
  toggleSessionTypeReminder: (type: SessionType) => Promise<void>;
  toggleSessionTypeAlarm: (type: SessionType) => Promise<void>;
  setLeadEnabled: (type: SessionType, leadMinutes: number, enabled: boolean) => Promise<void>;
}

export function useReminderActions(): ReminderActions {
  const services = useServices();
  const { reminderSettings, updateReminderSettings } = usePreferences();
  const { language } = useTranslation();
  const countryCode = useCountryCode();

  const applyReminderSettings = useCallback(
    async (next: ReminderSettings) => {
      await updateReminderSettings(next);
      await reconcileSessionReminders({ services, settings: next, countryCode, language });
    },
    [countryCode, language, services, updateReminderSettings],
  );

  const toggleSessionTypeReminder = useCallback(
    async (type: SessionType) => {
      const preference = reminderSettings.sessions[type];
      await applyReminderSettings({
        ...reminderSettings,
        sessions: {
          ...reminderSettings.sessions,
          [type]: { ...preference, enabled: !preference.enabled },
        },
      });
    },
    [applyReminderSettings, reminderSettings],
  );

  const toggleSessionTypeAlarm = useCallback(
    async (type: SessionType) => {
      const preference = reminderSettings.sessions[type];
      await applyReminderSettings({
        ...reminderSettings,
        sessions: {
          ...reminderSettings.sessions,
          [type]: { ...preference, alarmEnabled: !preference.alarmEnabled },
        },
      });
    },
    [applyReminderSettings, reminderSettings],
  );

  const setLeadEnabled = useCallback(
    async (type: SessionType, leadMinutes: number, enabled: boolean) => {
      const preference = reminderSettings.sessions[type];
      const leads = enabled
        ? ([...new Set([...preference.leads, leadMinutes])] as ReminderSettings['sessions'][SessionType]['leads'])
        : (preference.leads.filter((lead) => lead !== leadMinutes) as ReminderSettings['sessions'][SessionType]['leads']);
      await applyReminderSettings({
        ...reminderSettings,
        sessions: {
          ...reminderSettings.sessions,
          [type]: { ...preference, leads },
        },
      });
    },
    [applyReminderSettings, reminderSettings],
  );

  return { applyReminderSettings, toggleSessionTypeReminder, toggleSessionTypeAlarm, setLeadEnabled };
}
