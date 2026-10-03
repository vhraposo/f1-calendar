import type { SQLiteDatabase } from 'expo-sqlite';
import type {
  BroadcastAvailability,
  BroadcastInformation,
  BroadcastPlatform,
} from '@/domain/models/broadcast-information';
import type { SessionType } from '@/domain/models/session';
import type { BroadcastRepository } from '@/domain/repositories/broadcast-repository';

interface BroadcastRow {
  id: string;
  season_year: number | null;
  country_code: string;
  session_type: string | null;
  broadcaster: string;
  platform: string;
  streaming_service: string | null;
  availability: string;
  source: string;
  valid_from: string;
  valid_until: string | null;
}

function toBroadcast(row: BroadcastRow): BroadcastInformation {
  return {
    id: row.id,
    seasonYear: row.season_year,
    countryCode: row.country_code,
    sessionType: row.session_type as SessionType | null,
    broadcaster: row.broadcaster,
    platform: row.platform as BroadcastPlatform,
    streamingService: row.streaming_service,
    availability: row.availability as BroadcastAvailability,
    source: row.source,
    validFrom: row.valid_from,
    validUntil: row.valid_until,
  };
}

export class SqliteBroadcastRepository implements BroadcastRepository {
  constructor(private readonly database: () => Promise<SQLiteDatabase>) {}

  async listByCountry(countryCode: string): Promise<BroadcastInformation[]> {
    const db = await this.database();
    const rows = await db.getAllAsync<BroadcastRow>(
      'SELECT * FROM broadcasts WHERE country_code = ?',
      countryCode.toUpperCase(),
    );
    return rows.map(toBroadcast);
  }

  async listAll(): Promise<BroadcastInformation[]> {
    const db = await this.database();
    const rows = await db.getAllAsync<BroadcastRow>('SELECT * FROM broadcasts');
    return rows.map(toBroadcast);
  }

  async replaceAll(entries: BroadcastInformation[]): Promise<void> {
    const db = await this.database();
    await db.withExclusiveTransactionAsync(async (transaction) => {
      await transaction.runAsync('DELETE FROM broadcasts');
      for (const entry of entries) {
        await this.insert(transaction, entry);
      }
    });
  }

  async upsert(entries: BroadcastInformation[]): Promise<void> {
    const db = await this.database();
    await db.withExclusiveTransactionAsync(async (transaction) => {
      for (const entry of entries) {
        await this.insert(transaction, entry);
      }
    });
  }

  private async insert(transaction: SQLiteDatabase, entry: BroadcastInformation): Promise<void> {
    await transaction.runAsync(
      `INSERT INTO broadcasts (id, season_year, country_code, session_type, broadcaster, platform, streaming_service, availability, source, valid_from, valid_until)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         season_year = excluded.season_year, country_code = excluded.country_code,
         session_type = excluded.session_type, broadcaster = excluded.broadcaster,
         platform = excluded.platform, streaming_service = excluded.streaming_service,
         availability = excluded.availability, source = excluded.source,
         valid_from = excluded.valid_from, valid_until = excluded.valid_until`,
      entry.id,
      entry.seasonYear,
      entry.countryCode.toUpperCase(),
      entry.sessionType,
      entry.broadcaster,
      entry.platform,
      entry.streamingService,
      entry.availability,
      entry.source,
      entry.validFrom,
      entry.validUntil,
    );
  }
}
