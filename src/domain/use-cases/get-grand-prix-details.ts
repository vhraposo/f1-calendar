import type { BroadcastInformation } from '@/domain/models/broadcast-information';
import type { Circuit } from '@/domain/models/circuit';
import type { GrandPrix } from '@/domain/models/grand-prix';
import type { Session } from '@/domain/models/session';
import type { BroadcastRepository } from '@/domain/repositories/broadcast-repository';
import type { ScheduleRepository } from '@/domain/repositories/schedule-repository';

export interface GrandPrixDetails {
  grandPrix: GrandPrix;
  circuit: Circuit | null;
  sessions: Session[];
  broadcasts: BroadcastInformation[];
}

export async function getGrandPrixDetails(
  scheduleRepository: ScheduleRepository,
  broadcastRepository: BroadcastRepository,
  grandPrixId: string,
  countryCode: string | null,
): Promise<GrandPrixDetails | null> {
  const grandPrix = await scheduleRepository.getGrandPrix(grandPrixId);
  if (!grandPrix) {
    return null;
  }
  const [circuit, sessions, broadcasts] = await Promise.all([
    scheduleRepository.getCircuit(grandPrix.circuitId),
    scheduleRepository.listSessions(grandPrixId),
    countryCode ? broadcastRepository.listByCountry(countryCode) : Promise.resolve([]),
  ]);

  return { grandPrix, circuit, sessions, broadcasts };
}
