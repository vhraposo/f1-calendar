import { useCallback } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppIconButton } from '@/components/app-button';
import { AppSection } from '@/components/app-primitives';
import { AppScreen } from '@/components/app-screen';
import { AppText } from '@/components/app-text';
import { EmptyState, LoadingState, OfflineBanner } from '@/components/state-views';
import { getHomeSnapshot } from '@/domain/use-cases/get-home-snapshot';
import { NextRaceHero } from '@/features/home/components/next-race-hero';
import { NextSessionCard } from '@/features/home/components/next-session-card';
import { UpcomingGrandPrixList } from '@/features/home/components/upcoming-grand-prix-list';
import { useAsyncData } from '@/hooks/use-async-data';
import { useServices } from '@/providers/services-provider';
import { useSync } from '@/providers/sync-provider';
import { useTranslation } from '@/providers/i18n-provider';

export function HomeScreen() {
  const router = useRouter();
  const services = useServices();
  const { t } = useTranslation();
  const { lastSyncedAt, syncFailed, isSyncing, refresh } = useSync();

  const { data, loading } = useAsyncData(
    () => getHomeSnapshot(services.scheduleRepository),
    [lastSyncedAt],
  );

  const openGrandPrix = useCallback(
    (grandPrixId: string) => router.push(`/grand-prix/${grandPrixId}`),
    [router],
  );

  return (
    <AppScreen scroll>
      <View className="gap-xl">
        <View className="flex-row items-center justify-between">
          <AppText variant="label" tone="accent">
            {t('home.title')}
          </AppText>
          <AppIconButton
            icon="refresh"
            onPress={() => void refresh()}
            accessibilityLabel={t('settings.refreshData')}
            disabled={isSyncing}
          />
        </View>

        {syncFailed ? <OfflineBanner message={t('states.offlineBody')} /> : null}

        {loading && !data ? <LoadingState title={t('states.loadingTitle')} /> : null}

        {data && !data.nextGrandPrix ? (
          <EmptyState
            icon="flag"
            title={t('home.noUpcomingTitle')}
            body={t('home.noUpcomingBody')}
            actionLabel={t('common.retry')}
            onAction={() => void refresh()}
          />
        ) : null}

        {data?.nextGrandPrix ? (
          <>
            <NextRaceHero
              grandPrix={data.nextGrandPrix}
              nextSession={data.nextSession}
              onPress={() => openGrandPrix(data.nextGrandPrix!.id)}
            />

            {data.nextSession && data.nextSession.grandPrixId !== data.nextGrandPrix.id ? (
              <AppSection title={t('home.nextSession')}>
                <NextSessionCard
                  session={data.nextSession}
                  grandPrix={data.nextGrandPrix}
                  onPress={() => router.push(`/session/${data.nextSession!.id}`)}
                />
              </AppSection>
            ) : null}

            <AppSection title={t('home.upcoming')}>
              <UpcomingGrandPrixList
                grandPrix={data.upcomingGrandPrix}
                onSelect={(event) => openGrandPrix(event.id)}
              />
            </AppSection>
          </>
        ) : null}
      </View>
    </AppScreen>
  );
}
