import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppButton } from '@/components/app-button';
import { AppBadge, AppSection } from '@/components/app-primitives';
import { AppScreen } from '@/components/app-screen';
import { AppText } from '@/components/app-text';
import { Countdown } from '@/components/countdown';
import { EmptyState, LoadingState } from '@/components/state-views';
import type { ReminderLeadMinutes } from '@/domain/models/reminder-settings';
import { resolveSessionPhase } from '@/domain/services/schedule-query';
import { getSessionDetails } from '@/domain/use-cases/get-session-details';
import { BroadcastInformationList } from '@/features/grand-prix/components/broadcast-information';
import { ReminderControls } from '@/features/session/components/reminder-controls';
import { SessionTimeBlock } from '@/features/session/components/session-time-block';
import { useAsyncData } from '@/hooks/use-async-data';
import { useCalendarActions } from '@/hooks/use-calendar-actions';
import { useCountryCode } from '@/hooks/use-country-code';
import { useReminderActions } from '@/hooks/use-reminder-actions';
import { sessionName } from '@/i18n/session-labels';
import { usePreferences } from '@/providers/preferences-provider';
import { useServices } from '@/providers/services-provider';
import { useSync } from '@/providers/sync-provider';
import { useTranslation } from '@/providers/i18n-provider';

export function SessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const services = useServices();
  const countryCode = useCountryCode();
  const { reminderSettings } = usePreferences();
  const { toggleSessionTypeReminder, toggleSessionTypeAlarm, setLeadEnabled } = useReminderActions();
  const { addSession, removeSession } = useCalendarActions();
  const { lastSyncedAt } = useSync();
  const { t, language } = useTranslation();
  const [now] = useState(() => Date.now());
  const [calendarAdded, setCalendarAdded] = useState(false);

  const { data, loading, error, reload } = useAsyncData(
    () => getSessionDetails(services.scheduleRepository, services.broadcastRepository, id, countryCode),
    [id, countryCode, lastSyncedAt],
  );

  useEffect(() => {
    let active = true;
    services.calendarLinkRepository.find(id).then((link) => {
      if (active) {
        setCalendarAdded(link !== null);
      }
    });
    return () => {
      active = false;
    };
  }, [id, services.calendarLinkRepository]);

  const toggleCalendar = useCallback(async () => {
    if (!data) {
      return;
    }
    if (calendarAdded) {
      await removeSession(data.session);
      setCalendarAdded(false);
    } else {
      await addSession(data.session, data.grandPrix, data.circuit);
      setCalendarAdded(true);
    }
  }, [addSession, calendarAdded, data, removeSession]);

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

  const { session, grandPrix, circuit } = data;
  const preference = reminderSettings.sessions[session.type];
  const phase = resolveSessionPhase(session, now);
  const name = sessionName(session, language);

  return (
    <AppScreen scroll>
      <View className="gap-xl">
        <View className="gap-sm">
          <View className="flex-row items-center gap-sm">
            <AppText variant="label" tone="accent">
              {t('session.details')}
            </AppText>
            {phase === 'live' ? <AppBadge label={t('session.live')} tone="accent" /> : null}
            {session.isCancelled ? <AppBadge label={t('common.cancelled')} tone="danger" /> : null}
          </View>
          <AppText variant="headline">{name}</AppText>
          <AppText variant="body" tone="secondary">
            {grandPrix.name}
          </AppText>
          {circuit ? (
            <AppText variant="caption" tone="muted">
              {circuit.name}
            </AppText>
          ) : null}
        </View>

        {phase === 'upcoming' ? (
          <View className="gap-xs">
            <AppText variant="label" tone="muted">
              {t('session.startsIn')}
            </AppText>
            <Countdown targetAt={session.startAt} className="text-accent" />
          </View>
        ) : null}

        <SessionTimeBlock session={session} />

        <ReminderControls
          sessionType={session.type}
          notificationsEnabled={reminderSettings.notificationsEnabled}
          alarmsEnabled={reminderSettings.alarmsEnabled}
          reminderEnabled={preference?.enabled ?? false}
          alarmEnabled={preference?.alarmEnabled ?? false}
          leads={preference?.leads ?? []}
          onToggleReminder={() => void toggleSessionTypeReminder(session.type)}
          onToggleAlarm={() => void toggleSessionTypeAlarm(session.type)}
          onToggleLead={(lead: ReminderLeadMinutes, enabled: boolean) =>
            void setLeadEnabled(session.type, lead, enabled)
          }
        />

        <AppButton
          label={calendarAdded ? t('session.addedToCalendar') : t('session.addToCalendar')}
          variant={calendarAdded ? 'secondary' : 'primary'}
          icon={calendarAdded ? 'calendarCheck' : 'calendarPlus'}
          onPress={() => void toggleCalendar()}
        />

        <AppSection title={t('grandPrix.whereToWatch')}>
          <BroadcastInformationList
            sessions={[session]}
            broadcasts={data.broadcasts}
            countryCode={countryCode}
            now={now}
          />
        </AppSection>

        <AppButton
          label={t('home.viewGrandPrix')}
          variant="ghost"
          icon="chevronRight"
          onPress={() => router.push(`/grand-prix/${grandPrix.id}`)}
        />
      </View>
    </AppScreen>
  );
}
