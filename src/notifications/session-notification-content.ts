import type { NotificationContentInput } from 'expo-notifications';
import { formatShortWeekdayInZone, formatTimeInZone } from '@/core/time/instant';
import type { GrandPrix } from '@/domain/models/grand-prix';
import type { Session } from '@/domain/models/session';
import type { PlannedReminder } from '@/domain/services/reminder-planner';
import type { ResolvedLanguage, TranslationKey } from '@/i18n';
import { translate } from '@/i18n';
import { sessionName } from '@/i18n/session-labels';

const LEAD_KEYS: Record<number, TranslationKey> = {
  1440: 'notification.lead.day',
  60: 'notification.lead.hour',
  30: 'notification.lead.minutes30',
  15: 'notification.lead.minutes15',
};

export interface SessionNotificationContentContext {
  reminder: PlannedReminder;
  session: Session;
  grandPrix: GrandPrix;
  language: ResolvedLanguage;
  deviceTimeZone: string;
  broadcaster: string | null;
}

export function buildSessionNotificationContent(
  context: SessionNotificationContentContext,
): NotificationContentInput {
  const { reminder, session, grandPrix, language, deviceTimeZone, broadcaster } = context;
  const leadKey = LEAD_KEYS[reminder.leadMinutes];
  const leadLabel = leadKey ? translate(language, leadKey) : `${reminder.leadMinutes}m`;
  const localizedName = sessionName(session, language);

  const title = translate(language, 'notification.sessionIn', {
    session: localizedName,
    lead: leadLabel,
  });

  const weekday = formatShortWeekdayInZone(session.startAt, deviceTimeZone, language);
  const time = formatTimeInZone(session.startAt, deviceTimeZone, language);
  const lines = [grandPrix.name, `${weekday} \u00b7 ${time}`];
  if (broadcaster) {
    lines.push(translate(language, 'notification.watchOn', { broadcaster }));
  }

  const isAlarm = reminder.kind === 'alarm';

  return {
    title: isAlarm ? translate(language, 'notification.alarmTitle', { session: localizedName }) : title,
    body: lines.join('\n'),
    sound: 'default',
    interruptionLevel: isAlarm ? 'timeSensitive' : 'active',
    data: {
      reminderId: reminder.id,
      kind: reminder.kind,
      sessionId: session.id,
      grandPrixId: grandPrix.id,
      url: `/session/${session.id}`,
    },
  };
}
