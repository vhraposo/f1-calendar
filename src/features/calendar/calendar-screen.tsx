import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
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

export function CalendarScreen() {
  const router = useRouter();
  const services = useServices();
  const { t } = useTranslation();
  const { lastSyncedAt, syncFailed, isSyncing, refresh } = useSync();
  const [now] = useState(() => Date.now());

  const { data: seasons, loading: seasonsLoading } = useAsyncData(
    () => services.scheduleRepository.listSeasons(),
    [lastSyncedAt],
  );

  const { data: counts } = useAsyncData(
    () => services.scheduleRepository.countGrandPrixBySeason(),
    [lastSyncedAt],
  );

  const currentYear = useMemo(() => {
    if (!seasons || !counts) {
      return new Date().getUTCFullYear();
    }
    const yearsWithData = seasons
      .map((season) => season.year)
      .filter((year) => (counts[year] ?? 0) > 0);
    const utcYear = new Date().getUTCFullYear();
    if (yearsWithData.includes(utcYear)) {
      return utcYear;
    }
    const upcoming = yearsWithData.filter((year) => year >= utcYear).sort((a, b) => a - b)[0];
    return upcoming ?? yearsWithData.sort((a, b) => b - a)[0] ?? utcYear;
  }, [counts, seasons]);

  const { data: calendar, loading } = useAsyncData(
    () => getSeasonCalendar(services.scheduleRepository, currentYear),
    [currentYear, lastSyncedAt],
  );

  const openGrandPrix = useCallback(
    (grandPrix: GrandPrix) => router.push(`/grand-prix/${grandPrix.id}`),
    [router],
  );

  if ((loading || seasonsLoading) && !calendar) {
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
              <View className="gap-xs">
                <AppText variant="label" tone="accent">
                  {t('calendar.title')}
                </AppText>
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
          <EmptyState
            icon="flag"
            title={t('calendar.emptyTitle')}
            body={t('calendar.emptyBody')}
          />
        }
      />
    </AppScreen>
  );
}
