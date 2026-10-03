import type { GrandPrix } from '@/domain/models/grand-prix';
import type { SeasonStatus } from '@/domain/models/season';
import type { Session, SessionPhase } from '@/domain/models/session';
import { getNominalSessionEnd } from '@/domain/services/session-duration';

export function resolveSeasonStatus(
  seasonYear: number,
  firstSessionAt: string | null,
  lastSessionEndAt: string | null,
  now: number,
): SeasonStatus {
  if (!firstSessionAt || !lastSessionEndAt) {
    const currentYear = new Date(now).getUTCFullYear();
    if (seasonYear < currentYear) {
      return 'completed';
    }
    if (seasonYear > currentYear) {
      return 'upcoming';
    }
    return 'inProgress';
  }
  if (now < new Date(firstSessionAt).getTime()) {
    return 'upcoming';
  }
  if (now > new Date(lastSessionEndAt).getTime()) {
    return 'completed';
  }
  return 'inProgress';
}

export function resolveSessionPhase(session: Session, now: number): SessionPhase {
  const start = new Date(session.startAt).getTime();
  const end = new Date(getNominalSessionEnd(session)).getTime();
  if (now < start) {
    return 'upcoming';
  }
  if (now <= end) {
    return 'live';
  }
  return 'finished';
}

export function sortSessionsChronologically(sessions: Session[]): Session[] {
  return [...sessions].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
}

export function findNextSession(sessions: Session[], now: number): Session | null {
  const candidates = sessions
    .filter((session) => !session.isCancelled)
    .filter((session) => new Date(getNominalSessionEnd(session)).getTime() > now)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  return candidates[0] ?? null;
}

export function findNextGrandPrix(grandPrix: GrandPrix[], now: number): GrandPrix | null {
  const candidates = grandPrix
    .filter((event) => !event.isCancelled)
    .filter((event) => new Date(event.endAt).getTime() > now)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  return candidates[0] ?? null;
}

export function findUpcomingGrandPrix(grandPrix: GrandPrix[], now: number, limit: number): GrandPrix[] {
  return grandPrix
    .filter((event) => !event.isCancelled)
    .filter((event) => new Date(event.startAt).getTime() > now)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
    .slice(0, limit);
}

export function isWithinHorizon(targetIso: string, now: number, horizonDays: number): boolean {
  const target = new Date(targetIso).getTime();
  return target > now && target - now <= horizonDays * 24 * 60 * 60 * 1000;
}
