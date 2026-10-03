import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton } from '@/components/app-button';
import { AppDivider } from '@/components/app-primitives';
import { AppScreen } from '@/components/app-screen';
import { AppText } from '@/components/app-text';
import { ListRow } from '@/components/list-row';
import { SegmentedControl } from '@/components/segmented-control';
import { countryNameForCode } from '@/core/localization/country-codes';
import { AppIcon } from '@/design-system/icons';
import { colors } from '@/design-system/tokens';
import type { AppLanguage } from '@/domain/models/user-preferences';
import { useReminderActions } from '@/hooks/use-reminder-actions';
import { usePreferences } from '@/providers/preferences-provider';
import { useServices } from '@/providers/services-provider';
import { useTranslation } from '@/providers/i18n-provider';

export function OnboardingScreen() {
  const router = useRouter();
  const services = useServices();
  const { preferences, reminderSettings, updatePreferences } = usePreferences();
  const { applyReminderSettings } = useReminderActions();
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [countries, setCountries] = useState<{ code: string; name: string }[]>([]);
  const [permissionNote, setPermissionNote] = useState<string | null>(null);

  useEffect(() => {
    if (step !== 2) {
      return;
    }
    let active = true;
    (async () => {
      const broadcasts = await services.broadcastRepository.listAll();
      const codes = [...new Set(broadcasts.map((entry) => entry.countryCode.toUpperCase()))];
      const options = codes
        .map((code) => ({ code, name: countryNameForCode(code) ?? code }))
        .sort((a, b) => a.name.localeCompare(b.name));
      if (active) {
        setCountries(options);
      }
    })();
    return () => {
      active = false;
    };
  }, [services.broadcastRepository, step]);

  const selectedCountryName = useMemo(() => {
    if (!preferences.countryCode) {
      return t('settings.country.auto');
    }
    return countryNameForCode(preferences.countryCode) ?? preferences.countryCode;
  }, [preferences.countryCode, t]);

  const finish = useCallback(async () => {
    await updatePreferences({ onboardingCompleted: true });
    router.replace('/');
  }, [router, updatePreferences]);

  const handleEnableNotifications = useCallback(async () => {
    setPermissionNote(null);
    const status = await services.notificationScheduler.requestPermission();
    if (status !== 'granted') {
      setPermissionNote(t('errors.notificationPermission'));
      return;
    }
    await applyReminderSettings({ ...reminderSettings, notificationsEnabled: true });
  }, [applyReminderSettings, reminderSettings, services.notificationScheduler, t]);

  const handleEnableAlarms = useCallback(async () => {
    setPermissionNote(null);
    const status = await services.alarmScheduler.requestPermission();
    if (status !== 'granted') {
      setPermissionNote(t('errors.alarmPermission'));
      return;
    }
    await applyReminderSettings({ ...reminderSettings, alarmsEnabled: true });
  }, [applyReminderSettings, reminderSettings, services.alarmScheduler, t]);

  if (step === 0) {
    return (
      <AppScreen contentClassName="justify-between py-2xl">
        <View className="flex-1 items-center justify-center gap-md">
          <AppIcon name="flag" size={48} color={colors.accent} />
          <AppText variant="headline">{t('onboarding.title')}</AppText>
          <AppText variant="body" tone="secondary" className="text-center">
            {t('onboarding.subtitle')}
          </AppText>
        </View>
        <AppButton label={t('onboarding.continue')} onPress={() => setStep(1)} />
      </AppScreen>
    );
  }

  if (step === 1) {
    return (
      <AppScreen contentClassName="justify-between py-2xl">
        <View className="gap-lg">
          <AppText variant="title">{t('onboarding.chooseLanguage')}</AppText>
          <SegmentedControl<AppLanguage>
            value={preferences.language}
            onChange={(language) => void updatePreferences({ language })}
            accessibilityLabel={t('onboarding.chooseLanguage')}
            options={[
              { value: 'system', label: t('common.system') },
              { value: 'pt-BR', label: 'PT' },
              { value: 'en', label: 'EN' },
            ]}
          />
        </View>
        <AppButton label={t('onboarding.continue')} onPress={() => setStep(2)} />
      </AppScreen>
    );
  }

  if (step === 2) {
    return (
      <AppScreen contentClassName="justify-between py-2xl">
        <View className="flex-1 gap-lg">
          <View className="gap-xs">
            <AppText variant="title">{t('onboarding.chooseCountry')}</AppText>
            <AppText variant="caption" tone="muted">
              {t('onboarding.countryHint')}
            </AppText>
          </View>
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <ListRow
              title={t('settings.country.auto')}
              icon="globe"
              trailing={
                !preferences.countryCode ? (
                  <AppIcon name="check" size={18} color={colors.accent} />
                ) : undefined
              }
              onPress={() => void updatePreferences({ countryCode: null })}
            />
            {countries.map((country) => (
              <View key={country.code}>
                <AppDivider />
                <ListRow
                  title={country.name}
                  trailing={
                    preferences.countryCode === country.code ? (
                      <AppIcon name="check" size={18} color={colors.accent} />
                    ) : undefined
                  }
                  onPress={() => void updatePreferences({ countryCode: country.code })}
                />
              </View>
            ))}
          </ScrollView>
          <AppText variant="caption" tone="secondary">
            {selectedCountryName}
          </AppText>
        </View>
        <AppButton label={t('onboarding.continue')} onPress={() => setStep(3)} />
      </AppScreen>
    );
  }

  return (
    <AppScreen contentClassName="justify-between py-2xl">
      <View className="flex-1 justify-center gap-xl">
        <View className="gap-md">
          <AppText variant="title">{t('onboarding.notificationsTitle')}</AppText>
          <AppText variant="body" tone="secondary">
            {t('onboarding.notificationsBody')}
          </AppText>
          <AppButton
            label={t('onboarding.enableNotifications')}
            icon="bell"
            variant={reminderSettings.notificationsEnabled ? 'secondary' : 'primary'}
            onPress={() => void handleEnableNotifications()}
          />
        </View>

        <View className="gap-md">
          <AppText variant="title">{t('onboarding.alarmsTitle')}</AppText>
          <AppText variant="body" tone="secondary">
            {t('onboarding.alarmsBody')}
          </AppText>
          <AppButton
            label={t('onboarding.enableAlarms')}
            icon="alarm"
            variant="secondary"
            onPress={() => void handleEnableAlarms()}
          />
        </View>

        {permissionNote ? (
          <AppText variant="caption" tone="warning">
            {permissionNote}
          </AppText>
        ) : null}
      </View>

      <View className="gap-sm">
        <AppButton label={t('onboarding.getStarted')} onPress={() => void finish()} />
        <AppButton label={t('onboarding.maybeLater')} variant="ghost" onPress={() => void finish()} />
      </View>
    </AppScreen>
  );
}
