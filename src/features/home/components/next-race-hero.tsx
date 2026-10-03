import { View } from 'react-native';
import { AppBadge, AppDivider } from '@/components/app-primitives';
import { AppButton } from '@/components/app-button';
import { AppCard } from '@/components/app-card';
import { AppText } from '@/components/app-text';
import { Countdown } from '@/components/countdown';
import { CountryFlag } from '@/components/country-flag';
import { presentSessionTime } from '@/core/time/presentation';
import type { GrandPrix } from '@/domain/models/grand-prix';
import type { Session } from '@/domain/models/session';
import { sessionName } from '@/i18n/session-labels';
import { useTranslation } from '@/providers/i18n-provider';

export interface NextRaceHeroProps {
  grandPrix: GrandPrix;
  nextSession: Session | null;
  onPress: () => void;
}

export function NextRaceHero({ grandPrix, nextSession, onPress }: NextRaceHeroProps) {
  const { t, language } = useTranslation();
  const sessionTime = nextSession ? presentSessionTime(nextSession, language) : null;

  return (
    <AppCard className="gap-md border-l-4 border-l-accent">
      <View className="flex-row items-center justify-between">
        <AppText variant="label" tone="accent">
          {t('home.nextRace')}
        </AppText>
        {grandPrix.sprintWeekend ? <AppBadge label={t('common.sprintWeekend')} tone="accent" /> : null}
      </View>

      <View className="gap-sm">
        <View className="flex-row items-center gap-sm">
          <CountryFlag
            countryCode={grandPrix.countryCode}
            size={22}
            accessibilityLabel={t('a11y.flagOf', { country: grandPrix.country })}
          />
          <AppText variant="caption" tone="secondary" className="uppercase tracking-[2px]">
            {grandPrix.country}
          </AppText>
        </View>
        <AppText variant="headline">{grandPrix.name}</AppText>
        <AppText variant="caption" tone="muted">
          {grandPrix.city}
        </AppText>
      </View>

      <Countdown
        targetAt={grandPrix.endAt}
        accessibilityLabel={t('a11y.countdown', { session: grandPrix.name })}
      />

      <AppDivider />

      {nextSession && sessionTime ? (
        <View className="flex-row items-end justify-between">
          <View className="gap-xs">
            <AppText variant="label" tone="muted">
              {t('home.nextSession')}
            </AppText>
            <AppText variant="bodyStrong">{sessionName(nextSession, language)}</AppText>
          </View>
          <View className="items-end gap-xs">
            <AppText variant="caption" tone="muted" className="capitalize">
              {sessionTime.weekday}
            </AppText>
            <AppText variant="bodyStrong">{sessionTime.time}</AppText>
          </View>
        </View>
      ) : null}

      <AppButton label={t('home.viewGrandPrix')} onPress={onPress} icon="chevronRight" />
    </AppCard>
  );
}
