import { View } from 'react-native';
import { CountryFlag } from '@/components/country-flag';
import { ListRow } from '@/components/list-row';
import { presentGrandPrixLocalDate } from '@/core/time/presentation';
import type { GrandPrix } from '@/domain/models/grand-prix';
import { useTranslation } from '@/providers/i18n-provider';

export interface UpcomingGrandPrixListProps {
  grandPrix: GrandPrix[];
  onSelect: (grandPrix: GrandPrix) => void;
}

export function UpcomingGrandPrixList({ grandPrix, onSelect }: UpcomingGrandPrixListProps) {
  const { t, language } = useTranslation();
  return (
    <View>
      {grandPrix.map((event, index) => (
        <View key={event.id}>
          {index > 0 ? <View className="h-px w-full bg-divider" /> : null}
          <ListRow
            title={event.name}
            subtitle={`${event.country} \u00b7 ${presentGrandPrixLocalDate(event, language)}`}
            leading={<CountryFlag countryCode={event.countryCode} size={22} />}
            onPress={() => onSelect(event)}
            accessibilityLabel={event.name}
            accessibilityHint={t('home.viewGrandPrix')}
          />
        </View>
      ))}
    </View>
  );
}
