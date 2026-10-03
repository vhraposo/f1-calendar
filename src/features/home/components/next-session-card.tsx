import { View } from 'react-native';
import { AppCard } from '@/components/app-card';
import { AppText } from '@/components/app-text';
import { Countdown } from '@/components/countdown';
import { CountryFlag } from '@/components/country-flag';
import { presentSessionTime } from '@/core/time/presentation';
import type { GrandPrix } from '@/domain/models/grand-prix';
import type { Session } from '@/domain/models/session';
import { sessionName } from '@/i18n/session-labels';
import { useTranslation } from '@/providers/i18n-provider';

export interface NextSessionCardProps {
  session: Session;
  grandPrix: GrandPrix;
  onPress: () => void;
}

export function NextSessionCard({ session, grandPrix, onPress }: NextSessionCardProps) {
  const { t, language } = useTranslation();
  const time = presentSessionTime(session, language);

  return (
    <AppCard onPress={onPress} accessibilityLabel={sessionName(session, language)} className="gap-md">
      <View className="flex-row items-center justify-between">
        <AppText variant="label" tone="muted">
          {t('home.nextSession')}
        </AppText>
        <View className="flex-row items-center gap-xs">
          <CountryFlag countryCode={grandPrix.countryCode} size={16} />
          <AppText variant="caption" tone="muted">
            {grandPrix.country}
          </AppText>
        </View>
      </View>
      <View className="flex-row items-end justify-between">
        <View className="gap-xs">
          <AppText variant="title">{sessionName(session, language)}</AppText>
          <AppText variant="caption" tone="secondary" className="capitalize">
            {`${time.weekday} \u00b7 ${time.time}`}
          </AppText>
        </View>
        <Countdown targetAt={session.startAt} variant="title" className="text-accent" />
      </View>
    </AppCard>
  );
}
