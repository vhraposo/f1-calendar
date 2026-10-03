import { InvalidScheduleError } from '@/core/errors/app-errors';

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(locale: string, timeZone: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale}|${timeZone}|${JSON.stringify(options)}`;
  const cached = formatterCache.get(key);
  if (cached) {
    return cached;
  }
  const formatter = new Intl.DateTimeFormat(locale, { ...options, timeZone });
  formatterCache.set(key, formatter);
  return formatter;
}

export function parseInstant(isoInstant: string): Date {
  const date = new Date(isoInstant);
  if (Number.isNaN(date.getTime())) {
    throw new InvalidScheduleError(`Invalid instant: ${isoInstant}`);
  }
  return date;
}

export function getDeviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function formatTimeInZone(isoInstant: string, timeZone: string, locale: string): string {
  return getFormatter(locale, timeZone, {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(parseInstant(isoInstant));
}

export function formatWeekdayInZone(isoInstant: string, timeZone: string, locale: string): string {
  return getFormatter(locale, timeZone, { weekday: 'long' }).format(parseInstant(isoInstant));
}

export function formatShortWeekdayInZone(isoInstant: string, timeZone: string, locale: string): string {
  return getFormatter(locale, timeZone, { weekday: 'short' }).format(parseInstant(isoInstant));
}

export function formatDayInZone(isoInstant: string, timeZone: string, locale: string): string {
  return getFormatter(locale, timeZone, { day: '2-digit' }).format(parseInstant(isoInstant));
}

export function formatMonthInZone(isoInstant: string, timeZone: string, locale: string): string {
  return getFormatter(locale, timeZone, { month: 'short' }).format(parseInstant(isoInstant));
}

export function formatMonthLongInZone(isoInstant: string, timeZone: string, locale: string): string {
  return getFormatter(locale, timeZone, { month: 'long' }).format(parseInstant(isoInstant));
}

export function formatYearInZone(isoInstant: string, timeZone: string, locale: string): string {
  return getFormatter(locale, timeZone, { year: 'numeric' }).format(parseInstant(isoInstant));
}

export function formatDateTimeInZone(isoInstant: string, timeZone: string, locale: string): string {
  return getFormatter(locale, timeZone, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(parseInstant(isoInstant));
}

export function formatDateRangeInZone(
  startIso: string,
  endIso: string,
  timeZone: string,
  locale: string,
): string {
  const start = parseInstant(startIso);
  const end = parseInstant(endIso);
  const dayFormatter = getFormatter(locale, timeZone, { day: '2-digit' });
  const monthFormatter = getFormatter(locale, timeZone, { month: 'short' });
  const startDay = dayFormatter.format(start);
  const endDay = dayFormatter.format(end);
  const startMonth = monthFormatter.format(start);
  const endMonth = monthFormatter.format(end);
  if (startMonth === endMonth) {
    return `${startDay}\u2013${endDay} ${startMonth.toUpperCase()}`;
  }
  return `${startDay} ${startMonth.toUpperCase()} \u2013 ${endDay} ${endMonth.toUpperCase()}`;
}

export function isSameDayInZone(aIso: string, bIso: string, timeZone: string, locale: string): boolean {
  const formatter = getFormatter(locale, timeZone, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(parseInstant(aIso)) === formatter.format(parseInstant(bIso));
}

export function addMinutes(isoInstant: string, minutes: number): string {
  return new Date(parseInstant(isoInstant).getTime() + minutes * 60_000).toISOString();
}
