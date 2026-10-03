import { View } from 'react-native';
import { AppIconButton } from '@/components/app-button';
import { AppBadge } from '@/components/app-primitives';
import { AppText } from '@/components/app-text';
import { presentSessionTime } from '@/core/time/presentation';
import type { Session, SessionPhase } from '@/domain/models/session';
import { resolveSessionPhase } from '@/domain/services/schedule-query';
import { sessionName, sessionShortName } from '@/i18n/session-labels';
import { useTranslation } from '@/providers/i18n-provider';

export interface SessionCardProps {
  session: Session;
  now: number;
  reminderEnabled: boolean;
  alarmEnabled: boolean;
  calendarAdded: boolean;
  onPress: () => void;
  onToggleReminder: () => void;
  onToggleCalendar: () => void;
}

const PHASE_TONES: Record<SessionPhase, 'primary' | 'secondary' | 'muted'> = {
  upcoming: 'primary',
  live: 'primary',
  finished: 'muted',
};

export function SessionCard({
  session,
  now,
  reminderEnabled,
  alarmEnabled,
  calendarAdded,
  onPress,
  onToggleReminder,
  onToggleCalendar,
}: SessionCardProps) {
  const { t, language } = useTranslation();
  const time = presentSessionTime(session, language);
  const phase = resolveSessionPhase(session, now);
  const name = sessionName(session, language);

  return (
    <View className="flex-row items-center gap-md rounded-lg border border-border bg-surface p-md">
      <View className="w-12 items-center rounded-sm bg-surfaceMuted py-xs">
        <AppText variant="caption" tone="secondary">
          {sessionShortName(session.type, language)}
        </AppText>
      </View>

      <View className="flex-1 gap-xs">
        <AppText variant="bodyStrong" tone={PHASE_TONES[phase]}>
          {name}
        </AppText>
        <AppText variant="caption" tone="secondary" className="capitalize">
          {`${time.weekday} \u00b7 ${time.time}`}
        </AppText>
      </View>

      <View className="flex-row items-center gap-sm">
        {phase === 'live' ? <AppBadge label={t('session.live')} tone="accent" /> : null}
        {session.isCancelled ? <AppBadge label={t('common.cancelled')} tone="danger" /> : null}
        {alarmEnabled ? <AppBadge label={t('session.alarm')} tone="warning" /> : null}
        <AppIconButton
          icon={calendarAdded ? 'calendarCheck' : 'calendarPlus'}
          onPress={onToggleCalendar}
          accessibilityLabel={t('a11y.calendarToggle', { session: name })}
          className={calendarAdded ? 'bg-accent/20' : undefined}
        />
        <AppIconButton
          icon={reminderEnabled ? 'bell' : 'bellOff'}
          onPress={onToggleReminder}
          accessibilityLabel={t('a11y.reminderToggle', { session: name })}
          className={reminderEnabled ? 'bg-accent/20' : undefined}
        />
        <AppIconButton
          icon="chevronRight"
          onPress={onPress}
          accessibilityLabel={name}
          className="bg-transparent"
        />
      </View>
    </View>
  );
}
