import type { Circuit } from '@/domain/models/circuit';
import type { GrandPrix } from '@/domain/models/grand-prix';
import type { Season } from '@/domain/models/season';
import type { SeasonSchedule } from '@/domain/models/season-schedule';
import type { Session } from '@/domain/models/session';

export interface ScheduleRepository {
  listSeasons(): Promise<Season[]>;
  getSeason(year: number): Promise<Season | null>;
  upsertSeasons(seasons: Season[]): Promise<void>;
  getCircuit(circuitId: string): Promise<Circuit | null>;
  listGrandPrix(seasonYear: number): Promise<GrandPrix[]>;
  countGrandPrixBySeason(): Promise<Record<number, number>>;
  getGrandPrix(grandPrixId: string): Promise<GrandPrix | null>;
  listUpcomingGrandPrix(fromIso: string, limit: number): Promise<GrandPrix[]>;
  listSessions(grandPrixId: string): Promise<Session[]>;
  listSessionsBySeason(seasonYear: number): Promise<Session[]>;
  getSession(sessionId: string): Promise<Session | null>;
  listUpcomingSessions(fromIso: string, limit: number): Promise<Session[]>;
  replaceSeasonSchedule(schedule: SeasonSchedule): Promise<void>;
}
