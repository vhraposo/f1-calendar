import { APP_CONFIG } from '@/core/config/app-config';
import { DataProviderError, InvalidScheduleError, isAppError } from '@/core/errors/app-errors';
import { JsonHttpClient } from '@/core/networking/json-http-client';
import type { SeasonSchedule } from '@/domain/models/season-schedule';
import type { F1DataProvider } from '@/data/providers/f1-data-provider';
import type {
  JolpicaScheduleResponse,
  JolpicaSchedulesListResponse,
} from '@/data/providers/jolpica/jolpica-dto';
import { mapJolpicaScheduleToDomain } from '@/data/providers/jolpica/jolpica-schedule-mapper';

export class JolpicaF1Provider implements F1DataProvider {
  readonly providerId = APP_CONFIG.jolpicaProviderId;

  constructor(
    private readonly client: JsonHttpClient,
    private readonly now: () => number = Date.now,
  ) {}

  async listSeasonYears(): Promise<number[]> {
    try {
      const response = await this.client.getJson<JolpicaSchedulesListResponse>('/f1/alpha/schedules/');
      return response.data.map((season) => season.year).sort((a, b) => b - a);
    } catch (error) {
      throw this.toProviderError('Failed to list seasons', error);
    }
  }

  async fetchSeasonSchedule(year: number): Promise<SeasonSchedule> {
    try {
      const response = await this.client.getJson<JolpicaScheduleResponse>(`/f1/alpha/schedules/${year}/`);
      const schedule = mapJolpicaScheduleToDomain(response.data, this.now());
      if (schedule.grandPrix.length === 0) {
        throw new InvalidScheduleError(`Season ${year} contains no valid sessions`);
      }
      return schedule;
    } catch (error) {
      throw this.toProviderError(`Failed to fetch season ${year}`, error);
    }
  }

  private toProviderError(message: string, error: unknown): DataProviderError {
    if (error instanceof DataProviderError) {
      return error;
    }
    if (isAppError(error)) {
      return new DataProviderError(this.providerId, `${message}: ${error.message}`, { cause: error });
    }
    return new DataProviderError(this.providerId, message, { cause: error });
  }
}
