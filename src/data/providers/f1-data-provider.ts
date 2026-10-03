import type { SeasonSchedule } from '@/domain/models/season-schedule';

export interface F1DataProvider {
  readonly providerId: string;
  listSeasonYears(): Promise<number[]>;
  fetchSeasonSchedule(year: number): Promise<SeasonSchedule>;
}
