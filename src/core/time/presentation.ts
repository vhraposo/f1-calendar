import {
  formatDateTimeInZone,
  formatShortWeekdayInZone,
  formatTimeInZone,
  getDeviceTimeZone,
} from '@/core/time/instant';
import type { GrandPrix } from '@/domain/models/grand-prix';
import type { Session } from '@/domain/models/session';
import type { ResolvedLanguage } from '@/i18n';

export interface SessionTimePresentation {
  weekday: string;
  time: string;
  circuitWeekday: string;
  circuitTime: string;
  deviceTimeZone: string;
}

export function presentSessionTime(
  session: Session,
  language: ResolvedLanguage,
): SessionTimePresentation {
  const deviceTimeZone = getDeviceTimeZone();
  return {
    weekday: formatShortWeekdayInZone(session.startAt, deviceTimeZone, language),
    time: formatTimeInZone(session.startAt, deviceTimeZone, language),
    circuitWeekday: formatShortWeekdayInZone(session.startAt, session.timezone, language),
    circuitTime: formatTimeInZone(session.startAt, session.timezone, language),
    deviceTimeZone,
  };
}

export function presentGrandPrixDateRange(grandPrix: GrandPrix, language: ResolvedLanguage): string {
  const deviceTimeZone = getDeviceTimeZone();
  const start = formatDateTimeInZone(grandPrix.startAt, deviceTimeZone, language);
  const end = formatDateTimeInZone(grandPrix.endAt, deviceTimeZone, language);
  return `${start} \u2013 ${end}`;
}

export function presentGrandPrixLocalDate(grandPrix: GrandPrix, language: ResolvedLanguage): string {
  return formatDateTimeInZone(grandPrix.endAt, getDeviceTimeZone(), language);
}
