import { View } from 'react-native';
import { InfoRow } from '@/components/app-primitives';
import { AppText } from '@/components/app-text';
import type { Circuit } from '@/domain/models/circuit';
import { useTranslation } from '@/providers/i18n-provider';

export interface CircuitInformationCardProps {
  circuit: Circuit | null;
}

export function CircuitInformationCard({ circuit }: CircuitInformationCardProps) {
  const { t } = useTranslation();

  if (!circuit) {
    return (
      <View className="rounded-lg border border-border bg-surface p-lg">
        <AppText variant="body" tone="secondary">
          {t('grandPrix.notAvailable')}
        </AppText>
      </View>
    );
  }

  const length = circuit.lengthKm !== null ? `${circuit.lengthKm.toFixed(3)} km` : t('grandPrix.notAvailable');
  const laps = circuit.laps !== null ? String(circuit.laps) : t('grandPrix.notAvailable');
  const distance =
    circuit.raceDistanceKm !== null
      ? `${circuit.raceDistanceKm.toFixed(3)} km`
      : t('grandPrix.notAvailable');

  return (
    <View className="gap-sm rounded-lg border border-border bg-surface p-lg">
      <AppText variant="bodyStrong">{circuit.name}</AppText>
      <AppText variant="caption" tone="muted">
        {t('grandPrix.circuitCity', { city: circuit.city, country: circuit.country })}
      </AppText>
      <View className="pt-sm">
        <InfoRow icon="mapPin" label={t('grandPrix.length')} value={length} />
        <InfoRow icon="flag" label={t('grandPrix.laps')} value={laps} />
        <InfoRow icon="car" label={t('grandPrix.raceDistance')} value={distance} />
      </View>
    </View>
  );
}
