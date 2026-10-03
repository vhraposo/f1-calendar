import { DataProviderError, isAppError } from '@/core/errors/app-errors';
import type { SeasonSchedule } from '@/domain/models/season-schedule';
import type { F1DataProvider } from '@/data/providers/f1-data-provider';

export class FallbackF1DataProvider implements F1DataProvider {
  readonly providerId: string;

  constructor(private readonly providers: F1DataProvider[]) {
    if (providers.length === 0) {
      throw new DataProviderError('none', 'At least one F1 data provider is required');
    }
    this.providerId = providers.map((provider) => provider.providerId).join('+');
  }

  async listSeasonYears(): Promise<number[]> {
    return this.tryProviders('listSeasonYears', (provider) => provider.listSeasonYears());
  }

  async fetchSeasonSchedule(year: number): Promise<SeasonSchedule> {
    return this.tryProviders(`fetchSeasonSchedule(${year})`, (provider) => provider.fetchSeasonSchedule(year));
  }

  private async tryProviders<T>(
    operation: string,
    execute: (provider: F1DataProvider) => Promise<T>,
  ): Promise<T> {
    const failures: string[] = [];
    for (const provider of this.providers) {
      try {
        return await execute(provider);
      } catch (error) {
        failures.push(isAppError(error) ? `${provider.providerId}: ${error.message}` : provider.providerId);
      }
    }
    throw new DataProviderError(this.providerId, `${operation} failed for all providers (${failures.join('; ')})`);
  }
}
