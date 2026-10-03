import type { Circuit } from '@/domain/models/circuit';
import type { GrandPrix } from '@/domain/models/grand-prix';
import type { Season } from '@/domain/models/season';
import type { Session } from '@/domain/models/session';

export interface GrandPrixSchedule {
  grandPrix: GrandPrix;
  sessions: Session[];
}

export interface SeasonSchedule {
  season: Season;
  circuits: Circuit[];
  grandPrix: GrandPrixSchedule[];
}
