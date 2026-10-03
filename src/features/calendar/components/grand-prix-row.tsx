import { View } from 'react-native';
import { AppBadge } from '@/components/app-primitives';
import { CountryFlag } from '@/components/country-flag';
import { ListRow } from '@/components/list-row';
import { formatDateRangeInZone, getDeviceTimeZone } from '@/core/time/instant';
import type { SeasonCalendarEntry } from '@/domain/use-cases/get-season-calendar';
import { useTranslation } from '@/providers/i18n-provider';

export interface GrandPrixRowProps {
  entry: SeasonCalendarEntry;
  onPress: () => void;
}

export function GrandPrixRow({ entry, onPress }: GrandPrixRowProps) {
  const { t, language } = useTranslation();
  const { grandPrix } = entry;
  const dateRange = formatDateRangeInZone(
    grandPrix.startAt,
    grandPrix.endAt,
    getDeviceTimeZone(),
    language,
  );

  return (
    <ListRow
      title={grandPrix.name}
      subtitle={`${dateRange} \u00b7 ${t('calendar.round', { round: grandPrix.round })}`}
      leading={
        <View className="w-8 items-center">
          <CountryFlag countryCode={grandPrix.countryCode} size={22} />
        </View>
      }
      trailing={
        <View className="flex-row items-center gap-sm">
          {grandPrix.isCancelled ? (
            <AppBadge label={t('common.cancelled')} tone="danger" />
          ) : grandPrix.sprintWeekend ? (
            <AppBadge label="SPR" tone="accent" />
          ) : null}
        </View>
      }
      onPress={onPress}
      accessibilityLabel={grandPrix.name}
    />
  );
}

export function GrandPrixRowDivider() {
  return <View className="h-px w-full bg-divider" />;
}
