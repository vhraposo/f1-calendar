import { View } from 'react-native';
import { AppBadge } from '@/components/app-primitives';
import { AppText } from '@/components/app-text';
import { Countdown } from '@/components/countdown';
import { CountryFlag } from '@/components/country-flag';
import { formatDateRangeInZone, getDeviceTimeZone } from '@/core/time/instant';
import type { Circuit } from '@/domain/models/circuit';
import type { GrandPrix } from '@/domain/models/grand-prix';
import { useTranslation } from '@/providers/i18n-provider';

export interface GrandPrixHeaderProps {
  grandPrix: GrandPrix;
  circuit: Circuit | null;
}

export function GrandPrixHeader({ grandPrix, circuit }: GrandPrixHeaderProps) {
  const { t, language } = useTranslation();
  const dateRange = formatDateRangeInZone(
    grandPrix.startAt,
    grandPrix.endAt,
    getDeviceTimeZone(),
    language,
  );

  return (
    <View className="gap-md">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-sm">
          <CountryFlag
            countryCode={grandPrix.countryCode}
            size={26}
            accessibilityLabel={t('a11y.flagOf', { country: grandPrix.country })}
          />
          <AppText variant="caption" tone="secondary" className="uppercase tracking-[2px]">
            {grandPrix.country}
          </AppText>
        </View>
        <View className="flex-row items-center gap-sm">
          {grandPrix.isCancelled ? <AppBadge label={t('common.cancelled')} tone="danger" /> : null}
          {grandPrix.sprintWeekend ? <AppBadge label={t('common.sprintWeekend')} tone="accent" /> : null}
        </View>
      </View>

      <AppText variant="headline">{grandPrix.name}</AppText>

      <View className="gap-xs">
        {circuit ? <AppText variant="body" tone="secondary">{circuit.name}</AppText> : null}
        <AppText variant="caption" tone="muted">
          {t('grandPrix.circuitCity', { city: grandPrix.city, country: grandPrix.country })}
        </AppText>
        <AppText variant="caption" tone="muted">
          {dateRange}
        </AppText>
      </View>

      {!grandPrix.isCancelled ? (
        <Countdown
          targetAt={grandPrix.endAt}
          variant="title"
          className="text-accent"
          accessibilityLabel={t('a11y.countdown', { session: grandPrix.name })}
        />
      ) : null}
    </View>
  );
}
