import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppButton } from '@/components/app-button';
import { AppSection } from '@/components/app-primitives';
import { AppScreen } from '@/components/app-screen';
import { EmptyState, LoadingState } from '@/components/state-views';
import type { Session } from '@/domain/models/session';
import { getGrandPrixDetails } from '@/domain/use-cases/get-grand-prix-details';
import { BroadcastInformationList } from '@/features/grand-prix/components/broadcast-information';
import { CircuitInformationCard } from '@/features/grand-prix/components/circuit-information';
import { GrandPrixHeader } from '@/features/grand-prix/components/grand-prix-header';
import { SessionSchedule } from '@/features/grand-prix/components/session-schedule';
import { useAsyncData } from '@/hooks/use-async-data';
import { useCalendarActions } from '@/hooks/use-calendar-actions';
import { useCountryCode } from '@/hooks/use-country-code';
import { useReminderActions } from '@/hooks/use-reminder-actions';
import { usePreferences } from '@/providers/preferences-provider';
import { useServices } from '@/providers/services-provider';
import { useSync } from '@/providers/sync-provider';
import { useTranslation } from '@/providers/i18n-provider';

export function GrandPrixScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const services = useServices();
  const countryCode = useCountryCode();
  const { reminderSettings } = usePreferences();
  const { toggleSessionTypeReminder } = useReminderActions();
  const { addSession, addWeekend, removeSession } = useCalendarActions();
  const { lastSyncedAt } = useSync();
  const { t } = useTranslation();
  const [now] = useState(() => Date.now());
  const [calendarAdded, setCalendarAdded] = useState<Record<string, boolean>>({});
  const [weekendBusy, setWeekendBusy] = useState(false);

  const { data, loading, error, reload } = useAsyncData(
    () => getGrandPrixDetails(services.scheduleRepository, services.broadcastRepository, id, countryCode),
    [id, countryCode, lastSyncedAt],
  );

  const loadCalendarLinks = useCallback(async () => {
    const links = await services.calendarLinkRepository.list();
    setCalendarAdded(Object.fromEntries(links.map((link) => [link.sessionId, true])));
  }, [services.calendarLinkRepository]);

  useEffect(() => {
    let active = true;
    (async () => {
      const links = await services.calendarLinkRepository.list();
      if (active) {
        setCalendarAdded(Object.fromEntries(links.map((link) => [link.sessionId, true])));
      }
    })();
    return () => {
      active = false;
    };
  }, [services.calendarLinkRepository, data]);

  const reminderEnabledBySession = useMemo(() => {
    if (!data) {
      return {};
    }
    return Object.fromEntries(
      data.sessions.map((session) => [session.id, reminderSettings.sessions[session.type]?.enabled ?? false]),
    );
  }, [data, reminderSettings.sessions]);

  const alarmEnabledBySession = useMemo(() => {
    if (!data) {
      return {};
    }
    return Object.fromEntries(
      data.sessions.map((session) => [session.id, reminderSettings.sessions[session.type]?.alarmEnabled ?? false]),
    );
  }, [data, reminderSettings.sessions]);

  const openSession = useCallback(
    (session: Session) => {
      router.push(`/session/${session.id}`);
    },
    [router],
  );

  const toggleCalendar = useCallback(
    async (session: Session) => {
      if (!data) {
        return;
      }
      if (calendarAdded[session.id]) {
        await removeSession(session);
      } else {
        await addSession(session, data.grandPrix, data.circuit);
      }
      await loadCalendarLinks();
    },
    [addSession, calendarAdded, data, loadCalendarLinks, removeSession],
  );

  const handleAddWeekend = useCallback(async () => {
    if (!data) {
      return;
    }
    setWeekendBusy(true);
    try {
      await addWeekend(data.sessions, data.grandPrix, data.circuit);
      await loadCalendarLinks();
    } finally {
      setWeekendBusy(false);
    }
  }, [addWeekend, data, loadCalendarLinks]);

  if (loading && !data) {
    return (
      <AppScreen>
        <LoadingState title={t('common.loading')} />
      </AppScreen>
    );
  }

  if (error || !data) {
    return (
      <AppScreen>
        <EmptyState
          icon="alert"
          title={t('states.errorTitle')}
          body={t('states.errorBody')}
          actionLabel={t('common.retry')}
          onAction={reload}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen scroll>
      <View className="gap-xl">
        <GrandPrixHeader grandPrix={data.grandPrix} circuit={data.circuit} />

        <AppSection title={t('grandPrix.sessions')}>
          <SessionSchedule
            sessions={data.sessions}
            now={now}
            reminderEnabledBySession={reminderEnabledBySession}
            alarmEnabledBySession={alarmEnabledBySession}
            calendarAddedBySession={calendarAdded}
            onSelectSession={openSession}
            onToggleReminder={(session) => void toggleSessionTypeReminder(session.type)}
            onToggleCalendar={(session) => void toggleCalendar(session)}
          />
          <AppButton
            label={t('grandPrix.addWeekendToCalendar')}
            variant="secondary"
            icon="calendarPlus"
            loading={weekendBusy}
            onPress={() => void handleAddWeekend()}
          />
        </AppSection>

        <AppSection title={t('grandPrix.whereToWatch')}>
          <BroadcastInformationList
            sessions={data.sessions}
            broadcasts={data.broadcasts}
            countryCode={countryCode}
            now={now}
          />
        </AppSection>

        <AppSection title={t('grandPrix.circuit')}>
          <CircuitInformationCard circuit={data.circuit} />
        </AppSection>
      </View>
    </AppScreen>
  );
}
