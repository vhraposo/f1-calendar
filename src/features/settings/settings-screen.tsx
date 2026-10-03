import { useCallback, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppButton } from '@/components/app-button';
import { AppDivider, AppSection, AppSwitch } from '@/components/app-primitives';
import { AppScreen } from '@/components/app-screen';
import { AppSheet } from '@/components/app-sheet';
import { AppText } from '@/components/app-text';
import { ListRow } from '@/components/list-row';
import { SegmentedControl } from '@/components/segmented-control';
import { APP_CONFIG } from '@/core/config/app-config';
import { countryNameForCode } from '@/core/localization/country-codes';
import { AppIcon } from '@/design-system/icons';
import { colors } from '@/design-system/tokens';
import { REMINDABLE_SESSION_TYPES, type SessionType } from '@/domain/models/session';
import { sessionTypeName } from '@/i18n/session-labels';
import { ReminderControls } from '@/features/session/components/reminder-controls';
import { useReminderActions } from '@/hooks/use-reminder-actions';
import { useAsyncData } from '@/hooks/use-async-data';
import type { AppLanguage } from '@/domain/models/user-preferences';
import { usePreferences } from '@/providers/preferences-provider';
import { useServices } from '@/providers/services-provider';
import { useSync } from '@/providers/sync-provider';
import { useTranslation } from '@/providers/i18n-provider';

interface CountryOption {
  code: string;
  name: string;
}

export function SettingsScreen() {
  const services = useServices();
  const { preferences, reminderSettings, updatePreferences } = usePreferences();
  const { applyReminderSettings, toggleSessionTypeReminder, toggleSessionTypeAlarm, setLeadEnabled } =
    useReminderActions();
  const { t, language } = useTranslation();
  const { lastSyncedAt, isSyncing, refresh } = useSync();
  const [countrySheetVisible, setCountrySheetVisible] = useState(false);
  const [permissionNote, setPermissionNote] = useState<string | null>(null);

  const { data: countries } = useAsyncData(async () => {
    const broadcasts = await services.broadcastRepository.listAll();
    const codes = [...new Set(broadcasts.map((entry) => entry.countryCode.toUpperCase()))];
    const options: CountryOption[] = codes.map((code) => ({
      code,
      name: countryNameForCode(code) ?? code,
    }));
    return options.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const selectedCountryName = useMemo(() => {
    if (!preferences.countryCode) {
      return t('settings.country.auto');
    }
    return countryNameForCode(preferences.countryCode) ?? preferences.countryCode;
  }, [preferences.countryCode, t]);

  const handleLanguageChange = useCallback(
    (next: AppLanguage) => {
      void updatePreferences({ language: next });
    },
    [updatePreferences],
  );

  const handleNotificationsToggle = useCallback(
    async (value: boolean) => {
      setPermissionNote(null);
      if (value) {
        const status = await services.notificationScheduler.requestPermission();
        if (status !== 'granted') {
          setPermissionNote(t('errors.notificationPermission'));
          return;
        }
      }
      await applyReminderSettings({ ...reminderSettings, notificationsEnabled: value });
    },
    [applyReminderSettings, reminderSettings, services.notificationScheduler, t],
  );

  const handleAlarmsToggle = useCallback(
    async (value: boolean) => {
      setPermissionNote(null);
      if (value) {
        const status = await services.alarmScheduler.requestPermission();
        if (status !== 'granted') {
          setPermissionNote(t('errors.alarmPermission'));
          return;
        }
      }
      await applyReminderSettings({ ...reminderSettings, alarmsEnabled: value });
    },
    [applyReminderSettings, reminderSettings, services.alarmScheduler, t],
  );

  const handleCalendarToggle = useCallback(
    async (value: boolean) => {
      setPermissionNote(null);
      if (value) {
        const status = await services.calendarIntegration.requestPermission();
        if (status !== 'granted') {
          setPermissionNote(t('errors.calendarPermission'));
          return;
        }
      }
      await updatePreferences({ calendarIntegrationEnabled: value });
    },
    [services.calendarIntegration, t, updatePreferences],
  );

  return (
    <AppScreen scroll>
      <View className="gap-xl">
        <AppText variant="label" tone="accent">
          {t('settings.title')}
        </AppText>

        {permissionNote ? (
          <View className="rounded-md border border-warning/40 bg-warning/10 p-md">
            <AppText variant="caption" tone="warning">
              {permissionNote}
            </AppText>
          </View>
        ) : null}

        <AppSection title={t('settings.language')}>
          <SegmentedControl<AppLanguage>
            value={preferences.language}
            onChange={handleLanguageChange}
            accessibilityLabel={t('settings.language')}
            options={[
              { value: 'system', label: t('common.system') },
              { value: 'pt-BR', label: 'PT' },
              { value: 'en', label: 'EN' },
            ]}
          />
        </AppSection>

        <AppSection title={t('settings.country')}>
          <ListRow
            title={selectedCountryName}
            subtitle={t('onboarding.countryHint')}
            icon="globe"
            onPress={() => setCountrySheetVisible(true)}
            accessibilityLabel={t('settings.country')}
          />
        </AppSection>

        <AppSection title={t('reminders.notifications')}>
          <View className="gap-md rounded-lg border border-border bg-surface p-lg">
            <View className="flex-row items-center justify-between">
              <AppText variant="bodyStrong">{t('settings.notifications')}</AppText>
              <AppSwitch
                value={reminderSettings.notificationsEnabled}
                onValueChange={(value) => void handleNotificationsToggle(value)}
                accessibilityLabel={t('settings.notifications')}
              />
            </View>
            <AppDivider />
            <View className="flex-row items-center justify-between">
              <View className="flex-1 gap-xs pr-md">
                <AppText variant="bodyStrong">{t('settings.alarms')}</AppText>
                <AppText variant="caption" tone="muted">
                  {t('settings.alarmHint')}
                </AppText>
              </View>
              <AppSwitch
                value={reminderSettings.alarmsEnabled}
                onValueChange={(value) => void handleAlarmsToggle(value)}
                accessibilityLabel={t('settings.alarms')}
              />
            </View>
            {reminderSettings.alarmsEnabled && services.alarmScheduler.getCapabilities().platform === 'android' ? (
              <AppButton
                label={t('settings.exactAlarmAccess')}
                variant="ghost"
                size="sm"
                icon="alarm"
                onPress={() => void services.alarmScheduler.openSystemAlarmSettings()}
              />
            ) : null}
          </View>
        </AppSection>

        <AppSection title={t('settings.sessionTypes')}>
          <View className="gap-md">
            {REMINDABLE_SESSION_TYPES.map((type: SessionType) => {
              const preference = reminderSettings.sessions[type];
              return (
                <View key={type} className="gap-sm">
                  <AppText variant="caption" tone="secondary">
                    {sessionTypeName(type, language)}
                  </AppText>
                  <ReminderControls
                    sessionType={type}
                    notificationsEnabled={reminderSettings.notificationsEnabled}
                    alarmsEnabled={reminderSettings.alarmsEnabled}
                    reminderEnabled={preference.enabled}
                    alarmEnabled={preference.alarmEnabled}
                    leads={preference.leads}
                    onToggleReminder={() => void toggleSessionTypeReminder(type)}
                    onToggleAlarm={() => void toggleSessionTypeAlarm(type)}
                    onToggleLead={(lead, enabled) => void setLeadEnabled(type, lead, enabled)}
                  />
                </View>
              );
            })}
          </View>
        </AppSection>

        <AppSection title={t('settings.calendarIntegration')}>
          <View className="rounded-lg border border-border bg-surface p-lg">
            <View className="flex-row items-center justify-between">
              <AppText variant="bodyStrong">{t('settings.calendarIntegration')}</AppText>
              <AppSwitch
                value={preferences.calendarIntegrationEnabled}
                onValueChange={(value) => void handleCalendarToggle(value)}
                accessibilityLabel={t('settings.calendarIntegration')}
              />
            </View>
          </View>
        </AppSection>

        <AppSection title={t('settings.about')}>
          <View className="gap-md rounded-lg border border-border bg-surface p-lg">
            <View className="flex-row items-center justify-between">
              <AppText variant="caption" tone="secondary">
                {t('settings.lastSync')}
              </AppText>
              <AppText variant="caption">
                {lastSyncedAt ?? t('settings.neverSynced')}
              </AppText>
            </View>
            <AppButton
              label={t('settings.refreshData')}
              variant="secondary"
              icon="refresh"
              loading={isSyncing}
              onPress={() => void refresh()}
            />
            <AppDivider />
            <AppText variant="bodyStrong">{t('settings.dataSources')}</AppText>
            <AppText variant="caption" tone="secondary">
              {t('settings.dataSourcesBody')}
            </AppText>
            <AppDivider />
            <AppText variant="bodyStrong">{t('settings.privacy')}</AppText>
            <AppText variant="caption" tone="secondary">
              {t('settings.privacyBody')}
            </AppText>
            <AppDivider />
            <AppText variant="caption" tone="muted">
              {t('settings.version', { version: APP_CONFIG.appVersion })}
            </AppText>
          </View>
        </AppSection>
      </View>

      <AppSheet
        visible={countrySheetVisible}
        title={t('onboarding.chooseCountry')}
        onClose={() => setCountrySheetVisible(false)}
        closeAccessibilityLabel={t('common.close')}
      >
        <ScrollView className="max-h-96">
          <ListRow
            title={t('settings.country.auto')}
            icon="globe"
            onPress={() => {
              void updatePreferences({ countryCode: null });
              setCountrySheetVisible(false);
            }}
          />
          {(countries ?? []).map((country) => (
            <View key={country.code}>
              <AppDivider />
              <ListRow
                title={country.name}
                trailing={
                  preferences.countryCode === country.code ? (
                    <AppIcon name="check" size={18} color={colors.accent} />
                  ) : undefined
                }
                onPress={() => {
                  void updatePreferences({ countryCode: country.code });
                  setCountrySheetVisible(false);
                }}
              />
            </View>
          ))}
        </ScrollView>
      </AppSheet>
    </AppScreen>
  );
}
