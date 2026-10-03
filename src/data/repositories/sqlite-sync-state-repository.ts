import type { SQLiteDatabase } from 'expo-sqlite';
import type { SyncScope, SyncStateRepository } from '@/domain/repositories/sync-state-repository';

export class SqliteSyncStateRepository implements SyncStateRepository {
  constructor(private readonly database: () => Promise<SQLiteDatabase>) {}

  async getLastSuccessfulSyncAt(scope: SyncScope): Promise<string | null> {
    const db = await this.database();
    const row = await db.getFirstAsync<{ last_success_at: string }>(
      'SELECT last_success_at FROM sync_state WHERE key = ?',
      scope,
    );
    return row?.last_success_at ?? null;
  }

  async setLastSuccessfulSyncAt(scope: SyncScope, isoInstant: string): Promise<void> {
    const db = await this.database();
    await db.runAsync(
      `INSERT INTO sync_state (key, last_success_at) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET last_success_at = excluded.last_success_at`,
      scope,
      isoInstant,
    );
  }
}
