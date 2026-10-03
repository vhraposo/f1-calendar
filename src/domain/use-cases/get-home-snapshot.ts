import { APP_CONFIG } from '@/core/config/app-config';
import type { GrandPrix } from '@/domain/models/grand-prix';
import type { Session } from '@/domain/models/session';
import type { ScheduleRepository } from '@/domain/repositories/schedule-repository';
import { findNextGrandPrix, findNextSession } from '@/domain/services/schedule-query';

export interface HomeSnapshot {
  nextGrandPrix: GrandPrix | null;
  nextSession: Session | null;
  upcomingGrandPrix: GrandPrix[];
  seasonYear: number | null;
}

export async function getHomeSnapshot(
  scheduleRepository: ScheduleRepository,
  now: number = Date.now(),
): Promise<HomeSnapshot> {
  const nowIso = new Date(now).toISOString();
  const [candidateGrandPrix, candidateSessions] = await Promise.all([
    scheduleRepository.listUpcomingGrandPrix(nowIso, APP_CONFIG.maxUpcomingGrandPrix + 5),
    scheduleRepository.listUpcomingSessions(nowIso, 1),
  ]);

  const nextGrandPrix = findNextGrandPrix(candidateGrandPrix, now);
  const nextSession = findNextSession(candidateSessions, now);
  const upcomingGrandPrix = nextGrandPrix
    ? [nextGrandPrix, ...candidateGrandPrix.filter((event) => event.id !== nextGrandPrix.id)].slice(
        0,
        APP_CONFIG.maxUpcomingGrandPrix,
      )
    : candidateGrandPrix.slice(0, APP_CONFIG.maxUpcomingGrandPrix);

  return {
    nextGrandPrix,
    nextSession,
    upcomingGrandPrix,
    seasonYear: nextGrandPrix?.seasonYear ?? null,
  };
}
