import type { BroadcastInformation } from '@/domain/models/broadcast-information';
import type { SeasonSchedule } from '@/domain/models/season-schedule';
import type { BroadcastRepository } from '@/domain/repositories/broadcast-repository';
import type { ScheduleRepository } from '@/domain/repositories/schedule-repository';
import type { SyncStateRepository } from '@/domain/repositories/sync-state-repository';
import { SyncService } from '@/data/cache/sync-service';
import type { F1DataProvider } from '@/data/providers/f1-data-provider';

const schedule: SeasonSchedule = {
  season: { year: 2026, name: '2026', status: 'inProgress' },
  circuits: [],
  grandPrix: [],
};

function createFakes() {
  const scheduleRepository = {
    upsertSeasons: jest.fn(async () => undefined),
    replaceSeasonSchedule: jest.fn(async () => undefined),
    listGrandPrix: jest.fn(async () => []),
  } as unknown as ScheduleRepository;

  const broadcastRepository = {
    listAll: jest.fn(async () => [] as BroadcastInformation[]),
    replaceAll: jest.fn(async () => undefined),
  } as unknown as BroadcastRepository;

  const syncStateRepository = {
    getLastSuccessfulSyncAt: jest.fn(async () => null as string | null),
    setLastSuccessfulSyncAt: jest.fn(async () => undefined),
  } as unknown as SyncStateRepository;

  const provider: F1DataProvider = {
    providerId: 'fake',
    listSeasonYears: jest.fn(async () => [2026, 2025]),
    fetchSeasonSchedule: jest.fn(async () => schedule),
  };

  return { scheduleRepository, broadcastRepository, syncStateRepository, provider };
}

describe('sync service', () => {
  const now = Date.parse('2026-06-01T12:00:00.000Z');

  it('skips a fresh season that already has local data', async () => {
    const fakes = createFakes();
    (fakes.syncStateRepository.getLastSuccessfulSyncAt as jest.Mock).mockResolvedValue(
      '2026-06-01T11:00:00.000Z',
    );
    (fakes.scheduleRepository.listGrandPrix as jest.Mock).mockResolvedValue([{ id: '2026-01' }]);
    const service = new SyncService(
      fakes.provider,
      fakes.scheduleRepository,
      fakes.broadcastRepository,
      fakes.syncStateRepository,
      () => now,
    );

    const result = await service.syncSeason(2026);

    expect(result.status).toBe('skipped');
    expect(fakes.provider.fetchSeasonSchedule).not.toHaveBeenCalled();
  });

  it('syncs a stale season and records the successful timestamp', async () => {
    const fakes = createFakes();
    (fakes.syncStateRepository.getLastSuccessfulSyncAt as jest.Mock).mockResolvedValue(
      '2026-05-01T00:00:00.000Z',
    );
    const service = new SyncService(
      fakes.provider,
      fakes.scheduleRepository,
      fakes.broadcastRepository,
      fakes.syncStateRepository,
      () => now,
    );

    const result = await service.syncSeason(2026);

    expect(result.status).toBe('synced');
    expect(fakes.scheduleRepository.replaceSeasonSchedule).toHaveBeenCalledWith(schedule);
    expect(fakes.syncStateRepository.setLastSuccessfulSyncAt).toHaveBeenCalledWith(
      'season',
      '2026-06-01T12:00:00.000Z',
    );
  });

  it('keeps local data and reports failure when the provider fails', async () => {
    const fakes = createFakes();
    (fakes.provider.fetchSeasonSchedule as jest.Mock).mockRejectedValue(new Error('offline'));
    const service = new SyncService(
      fakes.provider,
      fakes.scheduleRepository,
      fakes.broadcastRepository,
      fakes.syncStateRepository,
      () => now,
    );

    const result = await service.syncSeason(2026, true);

    expect(result.status).toBe('failed');
    expect(fakes.scheduleRepository.replaceSeasonSchedule).not.toHaveBeenCalled();
    expect(fakes.syncStateRepository.setLastSuccessfulSyncAt).not.toHaveBeenCalled();
  });

  it('seeds broadcast data only when the table is empty', async () => {
    const fakes = createFakes();
    const service = new SyncService(
      fakes.provider,
      fakes.scheduleRepository,
      fakes.broadcastRepository,
      fakes.syncStateRepository,
      () => now,
    );

    await service.ensureBroadcastSeed();
    expect(fakes.broadcastRepository.replaceAll).toHaveBeenCalledTimes(1);

    (fakes.broadcastRepository.listAll as jest.Mock).mockResolvedValue([{ id: 'existing' }]);
    await service.ensureBroadcastSeed();
    expect(fakes.broadcastRepository.replaceAll).toHaveBeenCalledTimes(1);
  });

  it('upserts season years with heuristic statuses', async () => {
    const fakes = createFakes();
    const service = new SyncService(
      fakes.provider,
      fakes.scheduleRepository,
      fakes.broadcastRepository,
      fakes.syncStateRepository,
      () => now,
    );

    const result = await service.syncSeasons(true);

    expect(result.status).toBe('synced');
    const upserted = (fakes.scheduleRepository.upsertSeasons as jest.Mock).mock.calls[0][0];
    expect(upserted).toEqual([
      { year: 2026, name: '2026', status: 'inProgress' },
      { year: 2025, name: '2025', status: 'completed' },
    ]);
  });
});
