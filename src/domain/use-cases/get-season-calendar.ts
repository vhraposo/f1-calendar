import type { Circuit } from '@/domain/models/circuit';
import type { GrandPrix } from '@/domain/models/grand-prix';
import type { Season } from '@/domain/models/season';
import type { Session } from '@/domain/models/session';
import type { ScheduleRepository } from '@/domain/repositories/schedule-repository';

export interface SeasonCalendarEntry {
  grandPrix: GrandPrix;
  sessions: Session[];
  circuit: Circuit | null;
}

export interface SeasonCalendar {
  season: Season;
  entries: SeasonCalendarEntry[];
}

export async function getSeasonCalendar(
  scheduleRepository: ScheduleRepository,
  year: number,
): Promise<SeasonCalendar | null> {
  const season = await scheduleRepository.getSeason(year);
  if (!season) {
    return null;
  }
  const grandPrix = await scheduleRepository.listGrandPrix(year);
  const sessions = await scheduleRepository.listSessionsBySeason(year);

  const sessionsByGrandPrix = new Map<string, Session[]>();
  for (const session of sessions) {
    const list = sessionsByGrandPrix.get(session.grandPrixId) ?? [];
    list.push(session);
    sessionsByGrandPrix.set(session.grandPrixId, list);
  }

  const circuitIds = [...new Set(grandPrix.map((event) => event.circuitId))];
  const circuits = await Promise.all(circuitIds.map((id) => scheduleRepository.getCircuit(id)));
  const circuitsById = new Map<string, Circuit>();
  for (const circuit of circuits) {
    if (circuit) {
      circuitsById.set(circuit.id, circuit);
    }
  }

  return {
    season,
    entries: grandPrix.map((event) => ({
      grandPrix: event,
      sessions: sessionsByGrandPrix.get(event.id) ?? [],
      circuit: circuitsById.get(event.circuitId) ?? null,
    })),
  };
}
