import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppBadge } from '@/components/app-primitives';
import { AppScreen } from '@/components/app-screen';
import { AppText } from '@/components/app-text';
import { ListRow } from '@/components/list-row';
import { LoadingState } from '@/components/state-views';
import { useAsyncData } from '@/hooks/use-async-data';
import { useServices } from '@/providers/services-provider';
import { useSync } from '@/providers/sync-provider';
import { useTranslation } from '@/providers/i18n-provider';

const STATUS_TONES = {
  upcoming: 'neutral',
  inProgress: 'accent',
  completed: 'neutral',
} as const;

export function SeasonsScreen() {
  const router = useRouter();
  const services = useServices();
  const { t } = useTranslation();
  const { lastSyncedAt } = useSync();

  const { data: seasons, loading } = useAsyncData(
    () => services.scheduleRepository.listSeasons(),
    [lastSyncedAt],
  );

  const { data: counts } = useAsyncData(
    () => services.scheduleRepository.countGrandPrixBySeason(),
    [lastSyncedAt],
  );

  const statusLabels = useMemo(
    () => ({
      upcoming: t('seasons.status.upcoming'),
      inProgress: t('seasons.status.inProgress'),
      completed: t('seasons.status.completed'),
    }),
    [t],
  );

  const openSeason = useCallback((year: number) => router.push(`/seasons/${year}`), [router]);

  if (loading && !seasons) {
    return (
      <AppScreen>
        <LoadingState title={t('states.loadingTitle')} />
      </AppScreen>
    );
  }

  return (
    <AppScreen scroll>
      <View className="gap-xl">
        <AppText variant="label" tone="accent">
          {t('seasons.title')}
        </AppText>
        <View>
          {(seasons ?? []).map((season, index) => {
            const raceCount = counts?.[season.year] ?? 0;
            const subtitle =
              raceCount > 0
                ? t('seasons.races', { count: raceCount })
                : t('seasons.notSynced');
            return (
              <View key={season.year}>
                {index > 0 ? <View className="h-px w-full bg-divider" /> : null}
                <ListRow
                  title={String(season.year)}
                  subtitle={subtitle}
                  onPress={() => openSeason(season.year)}
                  trailing={
                    <View className="flex-row items-center gap-sm">
                      <AppBadge
                        label={statusLabels[season.status]}
                        tone={STATUS_TONES[season.status]}
                      />
                    </View>
                  }
                />
              </View>
            );
          })}
        </View>
      </View>
    </AppScreen>
  );
}
