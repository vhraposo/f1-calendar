import type {
  BroadcastAvailability,
  BroadcastInformation,
} from '@/domain/models/broadcast-information';
import type { SessionType } from '@/domain/models/session';

export interface BroadcastQuery {
  countryCode: string;
  seasonYear: number;
  sessionType: SessionType;
  now: number;
}

const AVAILABILITY_RANK: Record<BroadcastAvailability, number> = {
  live: 0,
  delayed: 1,
  highlights: 2,
  unknown: 3,
};

function isValidAt(entry: BroadcastInformation, now: number): boolean {
  const from = new Date(entry.validFrom).getTime();
  const until = entry.validUntil ? new Date(entry.validUntil).getTime() : Number.POSITIVE_INFINITY;
  return now >= from && now <= until;
}

export function selectBroadcasters(
  entries: BroadcastInformation[],
  query: BroadcastQuery,
): BroadcastInformation[] {
  const normalizedCountry = query.countryCode.toUpperCase();
  const matches = entries.filter((entry) => {
    if (entry.countryCode.toUpperCase() !== normalizedCountry) {
      return false;
    }
    if (!isValidAt(entry, query.now)) {
      return false;
    }
    if (entry.seasonYear !== null && entry.seasonYear !== query.seasonYear) {
      return false;
    }
    if (entry.sessionType !== null && entry.sessionType !== query.sessionType) {
      return false;
    }
    return true;
  });

  const sorted = matches.sort((a, b) => {
    const seasonSpecific = (b.seasonYear === query.seasonYear ? 1 : 0) - (a.seasonYear === query.seasonYear ? 1 : 0);
    if (seasonSpecific !== 0) {
      return seasonSpecific;
    }
    const sessionSpecific = (b.sessionType !== null ? 1 : 0) - (a.sessionType !== null ? 1 : 0);
    if (sessionSpecific !== 0) {
      return sessionSpecific;
    }
    return AVAILABILITY_RANK[a.availability] - AVAILABILITY_RANK[b.availability];
  });

  const seen = new Set<string>();
  return sorted.filter((entry) => {
    const key = `${entry.broadcaster}|${entry.platform}|${entry.streamingService ?? ''}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function hasBroadcastInformation(
  entries: BroadcastInformation[],
  query: BroadcastQuery,
): boolean {
  return selectBroadcasters(entries, query).length > 0;
}
