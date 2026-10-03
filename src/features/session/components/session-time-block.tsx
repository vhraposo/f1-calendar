import { View } from 'react-native';
import { AppText } from '@/components/app-text';
import { presentSessionTime } from '@/core/time/presentation';
import type { Session } from '@/domain/models/session';
import { useTranslation } from '@/providers/i18n-provider';

export interface SessionTimeBlockProps {
  session: Session;
}

export function SessionTimeBlock({ session }: SessionTimeBlockProps) {
  const { t, language } = useTranslation();
  const time = presentSessionTime(session, language);

  return (
    <View className="flex-row gap-md">
      <View className="flex-1 gap-xs rounded-lg border border-border bg-surface p-lg">
        <AppText variant="label" tone="muted">
          {t('session.yourLocalTime')}
        </AppText>
        <AppText variant="title">{time.time}</AppText>
        <AppText variant="caption" tone="secondary" className="capitalize">
          {time.weekday}
        </AppText>
      </View>
      <View className="flex-1 gap-xs rounded-lg border border-accent/40 bg-surface p-lg">
        <AppText variant="label" tone="accent">
          {t('session.circuitTime')}
        </AppText>
        <AppText variant="title">{time.circuitTime}</AppText>
        <AppText variant="caption" tone="secondary" className="capitalize">
          {time.circuitWeekday}
        </AppText>
      </View>
    </View>
  );
}
