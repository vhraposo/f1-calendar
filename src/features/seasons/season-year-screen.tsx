import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppIconButton } from '@/components/app-button';
import { AppScreen } from '@/components/app-screen';
import { AppText } from '@/components/app-text';
import { EmptyState, LoadingState, OfflineBanner } from '@/components/state-views';
import type { GrandPrix } from '@/domain/models/grand-prix';
import { getSeasonCalendar } from '@/domain/use-cases/get-season-calendar';
import { SeasonCalendarView } from '@/features/calendar/components/season-calendar-view';
import { useAsyncData } from '@/hooks/use-async-data';
import { useServices } from '@/providers/services-provider';
import { useSync } from '@/providers/sync-provider';
import { useTranslation } from '@/providers/i18n-provider';

export function SeasonYearScreen() {
  const { year } = useLocalSearchParams<{ year: string }>();
  const router = useRouter();
  const services = useServices();
  const { t } = useTranslation();
  const { lastSyncedAt, syncFailed, isSyncing, refresh } = useSync();
  const [now] = useState(() => Date.now());
  const [autoSyncAttempted, setAutoSyncAttempted] = useState(false);
  const seasonYear = Number(year);

  const { data: calendar, loading, reload } = useAsyncData(
    () => getSeasonCalendar(services.scheduleRepository, seasonYear),
    [seasonYear, lastSyncedAt],
  );

  useEffect(() => {
    if (loading || !calendar || calendar.entries.length > 0 || autoSyncAttempted) {
      return;
    }
    let active = true;
    (async () => {
      await services.syncService.syncSeason(seasonYear);
      if (active) {
        setAutoSyncAttempted(true);
        reload();
      }
    })();
    return () => {
      active = false;
    };
  }, [autoSyncAttempted, calendar, loading, reload, seasonYear, services.syncService]);

  const openGrandPrix = useCallback(
    (grandPrix: GrandPrix) => router.push(`/grand-prix/${grandPrix.id}`),
    [router],
  );

  if (loading && !calendar) {
    return (
      <AppScreen>
        <LoadingState title={t('states.loadingTitle')} />
      </AppScreen>
    );
  }

  if (!calendar) {
    return (
      <AppScreen>
        <EmptyState
          icon="flag"
          title={t('calendar.emptyTitle')}
          body={t('calendar.emptyBody')}
          actionLabel={t('common.retry')}
          onAction={() => void refresh()}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <SeasonCalendarView
        entries={calendar.entries}
        now={now}
        onSelectGrandPrix={openGrandPrix}
        ListHeaderComponent={
          <View className="gap-md">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-sm">
                <AppIconButton
                  icon="chevronLeft"
                  onPress={() => router.back()}
                  accessibilityLabel={t('common.back')}
                />
                <AppText variant="headline">{calendar.season.year}</AppText>
              </View>
              <AppIconButton
                icon="refresh"
                onPress={() => void refresh()}
                accessibilityLabel={t('settings.refreshData')}
                disabled={isSyncing}
              />
            </View>
            {syncFailed ? <OfflineBanner message={t('states.offlineBody')} /> : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="flag" title={t('calendar.emptyTitle')} body={t('calendar.emptyBody')} />
        }
      />
    </AppScreen>
  );
}
