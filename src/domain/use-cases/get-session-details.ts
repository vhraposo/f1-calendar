import type { BroadcastInformation } from '@/domain/models/broadcast-information';
import type { Circuit } from '@/domain/models/circuit';
import type { GrandPrix } from '@/domain/models/grand-prix';
import type { Session } from '@/domain/models/session';
import type { BroadcastRepository } from '@/domain/repositories/broadcast-repository';
import type { ScheduleRepository } from '@/domain/repositories/schedule-repository';

export interface SessionDetails {
  session: Session;
  grandPrix: GrandPrix;
  circuit: Circuit | null;
  broadcasts: BroadcastInformation[];
}

export async function getSessionDetails(
  scheduleRepository: ScheduleRepository,
  broadcastRepository: BroadcastRepository,
  sessionId: string,
  countryCode: string | null,
): Promise<SessionDetails | null> {
  const session = await scheduleRepository.getSession(sessionId);
  if (!session) {
    return null;
  }
  const grandPrix = await scheduleRepository.getGrandPrix(session.grandPrixId);
  if (!grandPrix) {
    return null;
  }
  const [circuit, broadcasts] = await Promise.all([
    scheduleRepository.getCircuit(grandPrix.circuitId),
    countryCode ? broadcastRepository.listByCountry(countryCode) : Promise.resolve([]),
  ]);

  return { session, grandPrix, circuit, broadcasts };
}
