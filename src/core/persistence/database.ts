import * as SQLite from 'expo-sqlite';
import { StorageError } from '@/core/errors/app-errors';

export const DATABASE_NAME = 'f1-calendar.db';

const MIGRATIONS: string[] = [
  `
  CREATE TABLE IF NOT EXISTS seasons (
    year INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    synced_at TEXT
  );

  CREATE TABLE IF NOT EXISTS circuits (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    short_name TEXT,
    country TEXT NOT NULL,
    country_code TEXT,
    city TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    length_km REAL,
    laps INTEGER,
    race_distance_km REAL
  );

  CREATE TABLE IF NOT EXISTS grand_prix (
    id TEXT PRIMARY KEY NOT NULL,
    season_year INTEGER NOT NULL,
    round INTEGER NOT NULL,
    name TEXT NOT NULL,
    official_name TEXT,
    country TEXT NOT NULL,
    country_code TEXT,
    city TEXT NOT NULL,
    circuit_id TEXT NOT NULL,
    start_at TEXT NOT NULL,
    end_at TEXT NOT NULL,
    is_cancelled INTEGER NOT NULL DEFAULT 0,
    sprint_weekend INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY NOT NULL,
    grand_prix_id TEXT NOT NULL,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    start_at TEXT NOT NULL,
    end_at TEXT,
    timezone TEXT NOT NULL,
    scheduled_laps INTEGER,
    is_cancelled INTEGER NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_grand_prix_season ON grand_prix (season_year, round);
  CREATE INDEX IF NOT EXISTS idx_grand_prix_start ON grand_prix (start_at);
  CREATE INDEX IF NOT EXISTS idx_sessions_grand_prix ON sessions (grand_prix_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_start ON sessions (start_at);

  CREATE TABLE IF NOT EXISTS broadcasts (
    id TEXT PRIMARY KEY NOT NULL,
    season_year INTEGER,
    country_code TEXT NOT NULL,
    session_type TEXT,
    broadcaster TEXT NOT NULL,
    platform TEXT NOT NULL,
    streaming_service TEXT,
    availability TEXT NOT NULL,
    source TEXT NOT NULL,
    valid_from TEXT NOT NULL,
    valid_until TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_broadcasts_country ON broadcasts (country_code, season_year);

  CREATE TABLE IF NOT EXISTS sync_state (
    key TEXT PRIMARY KEY NOT NULL,
    last_success_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS calendar_links (
    session_id TEXT PRIMARY KEY NOT NULL,
    event_id TEXT NOT NULL,
    calendar_id TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  `,
];

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function migrate(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync('PRAGMA journal_mode = WAL;');
  await database.execAsync('PRAGMA foreign_keys = ON;');
  const result = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  for (let index = currentVersion; index < MIGRATIONS.length; index += 1) {
    await database.execAsync(MIGRATIONS[index]);
    await database.execAsync(`PRAGMA user_version = ${index + 1}`);
  }
}

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME)
      .then(async (database) => {
        await migrate(database);
        return database;
      })
      .catch((error: unknown) => {
        databasePromise = null;
        throw new StorageError('Failed to open the local database', { cause: error });
      });
  }
  return databasePromise;
}
