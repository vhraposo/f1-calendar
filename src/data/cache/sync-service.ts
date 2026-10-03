import { APP_CONFIG } from '@/core/config/app-config';
import { isAppError, type AppError } from '@/core/errors/app-errors';
import type { Season } from '@/domain/models/season';
import { resolveSeasonStatus } from '@/domain/services/schedule-query';
import type { BroadcastRepository } from '@/domain/repositories/broadcast-repository';
import type { ScheduleRepository } from '@/domain/repositories/schedule-repository';
import type { SyncScope, SyncStateRepository } from '@/domain/repositories/sync-state-repository';
import { BROADCAST_SEED } from '@/data/broadcast/broadcast-seed';
import type { F1DataProvider } from '@/data/providers/f1-data-provider';

export interface SyncResult {
  status: 'synced' | 'skipped' | 'failed';
  scope: SyncScope;
  year?: number;
  error?: AppError;
  syncedAt: string;
}

export class SyncService {
  constructor(
    private readonly provider: F1DataProvider,
    private readonly scheduleRepository: ScheduleRepository,
    private readonly broadcastRepository: BroadcastRepository,
    private readonly syncStateRepository: SyncStateRepository,
    private readonly now: () => number = Date.now,
  ) {}

  async ensureBroadcastSeed(): Promise<void> {
    const existing = await this.broadcastRepository.listAll();
    if (existing.length === 0) {
      await this.broadcastRepository.replaceAll(BROADCAST_SEED);
    }
  }

  async syncSeasons(force = false): Promise<SyncResult> {
    if (!force && (await this.isFresh('seasons'))) {
      return this.skipped('seasons');
    }
    try {
      const years = await this.provider.listSeasonYears();
      const now = this.now();
      const seasons: Season[] = years.map((year) => ({
        year,
        name: String(year),
        status: resolveSeasonStatus(year, null, null, now),
      }));
      await this.scheduleRepository.upsertSeasons(seasons);
      return await this.markSynced('seasons');
    } catch (error) {
      return this.failed('seasons', error);
    }
  }

  async syncSeason(year: number, force = false): Promise<SyncResult> {
    if (!force && (await this.isFresh('season')) && (await this.hasSeasonSchedule(year))) {
      return this.skipped('season', year);
    }
    try {
      const schedule = await this.provider.fetchSeasonSchedule(year);
      await this.scheduleRepository.replaceSeasonSchedule(schedule);
      return await this.markSynced('season', year);
    } catch (error) {
      return this.failed('season', error, year);
    }
  }

  async syncUpcomingSeasons(force = false): Promise<SyncResult[]> {
    const currentYear = new Date(this.now()).getUTCFullYear();
    const results: SyncResult[] = [];
    results.push(await this.syncSeasons(force));
    results.push(await this.syncSeason(currentYear, force));
    if (!(await this.hasSeasonSchedule(currentYear))) {
      results.push(await this.syncSeason(currentYear - 1, force));
    }
    return results;
  }

  private async hasSeasonSchedule(year: number): Promise<boolean> {
    const grandPrix = await this.scheduleRepository.listGrandPrix(year);
    return grandPrix.length > 0;
  }

  private async isFresh(scope: SyncScope): Promise<boolean> {
    const lastSyncAt = await this.syncStateRepository.getLastSuccessfulSyncAt(scope);
    if (!lastSyncAt) {
      return false;
    }
    const ageMs = this.now() - new Date(lastSyncAt).getTime();
    return ageMs >= 0 && ageMs < APP_CONFIG.syncFreshnessHours * 60 * 60 * 1000;
  }

  private async markSynced(scope: SyncScope, year?: number): Promise<SyncResult> {
    const syncedAt = new Date(this.now()).toISOString();
    await this.syncStateRepository.setLastSuccessfulSyncAt(scope, syncedAt);
    return { status: 'synced', scope, year, syncedAt };
  }

  private skipped(scope: SyncScope, year?: number): SyncResult {
    return { status: 'skipped', scope, year, syncedAt: new Date(this.now()).toISOString() };
  }

  private failed(scope: SyncScope, error: unknown, year?: number): SyncResult {
    const appError = isAppError(error)
      ? error
      : undefined;
    return {
      status: 'failed',
      scope,
      year,
      error: appError,
      syncedAt: new Date(this.now()).toISOString(),
    };
  }
}
