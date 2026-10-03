export const SESSION_TYPES = [
  'PRACTICE_1',
  'PRACTICE_2',
  'PRACTICE_3',
  'SPRINT_QUALIFYING',
  'SPRINT',
  'QUALIFYING',
  'RACE',
  'OTHER',
] as const;

export type SessionType = (typeof SESSION_TYPES)[number];

export const REMINDABLE_SESSION_TYPES: SessionType[] = [
  'PRACTICE_1',
  'PRACTICE_2',
  'PRACTICE_3',
  'SPRINT_QUALIFYING',
  'SPRINT',
  'QUALIFYING',
  'RACE',
];

export interface Session {
  id: string;
  grandPrixId: string;
  type: SessionType;
  name: string;
  startAt: string;
  endAt: string | null;
  timezone: string;
  scheduledLaps: number | null;
  isCancelled: boolean;
}

export type SessionPhase = 'upcoming' | 'live' | 'finished';
