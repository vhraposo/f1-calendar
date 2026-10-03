export type SeasonStatus = 'upcoming' | 'inProgress' | 'completed';

export interface Season {
  year: number;
  name: string;
  status: SeasonStatus;
}
