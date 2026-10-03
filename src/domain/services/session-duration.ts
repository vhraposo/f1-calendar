import { addMinutes } from '@/core/time/instant';
import type { Session, SessionType } from '@/domain/models/session';

export const NOMINAL_SESSION_DURATION_MINUTES: Record<SessionType, number> = {
  PRACTICE_1: 60,
  PRACTICE_2: 60,
  PRACTICE_3: 60,
  SPRINT_QUALIFYING: 45,
  SPRINT: 60,
  QUALIFYING: 60,
  RACE: 120,
  OTHER: 60,
};

export function getNominalSessionEnd(session: Session): string {
  if (session.endAt) {
    return session.endAt;
  }
  return addMinutes(session.startAt, NOMINAL_SESSION_DURATION_MINUTES[session.type]);
}

export function getNominalSessionDurationMinutes(session: Session): number {
  return NOMINAL_SESSION_DURATION_MINUTES[session.type];
}
