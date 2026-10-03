import { toIso2CountryCode } from '@/core/localization/country-codes';
import type { Circuit } from '@/domain/models/circuit';
import type { GrandPrix } from '@/domain/models/grand-prix';
import type { SeasonSchedule } from '@/domain/models/season-schedule';
import type { Session, SessionType } from '@/domain/models/session';
import { resolveSeasonStatus } from '@/domain/services/schedule-query';
import type {
  JolpicaCircuit,
  JolpicaEvent,
  JolpicaScheduleEntry,
  JolpicaSeasonSchedule,
} from '@/data/providers/jolpica/jolpica-dto';

const SESSION_TYPE_BY_CODE: Record<string, SessionType> = {
  FP1: 'PRACTICE_1',
  FP2: 'PRACTICE_2',
  FP3: 'PRACTICE_3',
  SQ: 'SPRINT_QUALIFYING',
  SR: 'SPRINT',
  Q: 'QUALIFYING',
  R: 'RACE',
};

const SESSION_SLUG_BY_CODE: Record<string, string> = {
  FP1: 'practice-1',
  FP2: 'practice-2',
  FP3: 'practice-3',
  SQ: 'sprint-qualifying',
  SR: 'sprint',
  Q: 'qualifying',
  R: 'race',
};

export function buildGrandPrixId(seasonYear: number, round: number): string {
  return `${seasonYear}-${round.toString().padStart(2, '0')}`;
}

export function buildCancelledGrandPrixId(seasonYear: number, providerRoundId: string): string {
  const suffix = providerRoundId.replace(/[^a-zA-Z0-9]/g, '').slice(-6) || 'unknown';
  return `${seasonYear}-cancelled-${suffix}`;
}

function resolveGrandPrixIdentity(
  seasonYear: number,
  round: { id: string; number?: number },
): { id: string; roundNumber: number } {
  if (typeof round.number === 'number' && round.number > 0) {
    return { id: buildGrandPrixId(seasonYear, round.number), roundNumber: round.number };
  }
  return { id: buildCancelledGrandPrixId(seasonYear, round.id), roundNumber: 0 };
}

export function mapSessionType(code: string): SessionType {
  return SESSION_TYPE_BY_CODE[code.toUpperCase()] ?? 'OTHER';
}

function mapCircuit(circuit: JolpicaCircuit, laps: number | null): Circuit {
  return {
    id: circuit.id,
    name: circuit.name,
    shortName: null,
    country: circuit.country,
    countryCode: toIso2CountryCode(circuit.country_code),
    city: circuit.locality ?? '',
    latitude: circuit.latitude,
    longitude: circuit.longitude,
    lengthKm: null,
    laps,
    raceDistanceKm: null,
  };
}

function mapSession(entry: JolpicaScheduleEntry, grandPrixId: string, index: number): Session | null {
  if (!entry.timestamp || !entry.timezone) {
    return null;
  }
  const type = mapSessionType(entry.code);
  const slug = SESSION_SLUG_BY_CODE[entry.code.toUpperCase()] ?? `other-${index + 1}`;
  const raceSession = entry.sessions.find((session) => session.type === 'R');
  return {
    id: `${grandPrixId}-${slug}`,
    grandPrixId,
    type,
    name: entry.title,
    startAt: new Date(entry.timestamp).toISOString(),
    endAt: null,
    timezone: entry.timezone,
    scheduledLaps: raceSession?.scheduled_laps ?? null,
    isCancelled: entry.sessions.every((session) => session.is_cancelled),
  };
}

function mapEvent(event: JolpicaEvent, seasonYear: number): { grandPrix: GrandPrix; sessions: Session[]; circuit: Circuit } | null {
  const identity = resolveGrandPrixIdentity(seasonYear, event.round);
  const sessions = event.schedule
    .map((entry, index) => mapSession(entry, identity.id, index))
    .filter((session): session is Session => session !== null)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  if (sessions.length === 0) {
    return null;
  }

  const raceSession = sessions.find((session) => session.type === 'RACE');
  const startAt = sessions[0].startAt;
  const endAt = raceSession?.startAt ?? sessions[sessions.length - 1].startAt;
  const laps = raceSession?.scheduledLaps ?? null;
  const sprintWeekend = sessions.some(
    (session) => session.type === 'SPRINT' || session.type === 'SPRINT_QUALIFYING',
  );

  const grandPrix: GrandPrix = {
    id: identity.id,
    seasonYear,
    round: identity.roundNumber,
    name: event.round.name,
    officialName: null,
    country: event.circuit.country,
    countryCode: toIso2CountryCode(event.circuit.country_code),
    city: event.circuit.locality ?? '',
    circuitId: event.circuit.id,
    startAt,
    endAt,
    isCancelled: event.round.is_cancelled,
    sprintWeekend,
  };

  return { grandPrix, sessions, circuit: mapCircuit(event.circuit, laps) };
}

export function mapJolpicaScheduleToDomain(
  dto: JolpicaSeasonSchedule,
  now: number,
): SeasonSchedule {
  const circuits = new Map<string, Circuit>();
  const grandPrix: SeasonSchedule['grandPrix'] = [];

  for (const event of dto.events) {
    const mapped = mapEvent(event, dto.year);
    if (!mapped) {
      continue;
    }
    circuits.set(mapped.circuit.id, mapped.circuit);
    grandPrix.push({ grandPrix: mapped.grandPrix, sessions: mapped.sessions });
  }

  const firstSessionAt = grandPrix
    .flatMap((event) => event.sessions)
    .reduce<string | null>((earliest, session) => {
      if (!earliest) {
        return session.startAt;
      }
      return new Date(session.startAt).getTime() < new Date(earliest).getTime() ? session.startAt : earliest;
    }, null);

  const lastSessionEndAt = grandPrix
    .flatMap((event) => event.sessions)
    .reduce<string | null>((latest, session) => {
      if (!latest) {
        return session.startAt;
      }
      return new Date(session.startAt).getTime() > new Date(latest).getTime() ? session.startAt : latest;
    }, null);

  return {
    season: {
      year: dto.year,
      name: String(dto.year),
      status: resolveSeasonStatus(dto.year, firstSessionAt, lastSessionEndAt, now),
    },
    circuits: [...circuits.values()],
    grandPrix: grandPrix.sort((a, b) => {
      if (a.grandPrix.isCancelled !== b.grandPrix.isCancelled) {
        return a.grandPrix.isCancelled ? 1 : -1;
      }
      return a.grandPrix.round - b.grandPrix.round;
    }),
  };
}
