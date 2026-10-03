import type { SQLiteDatabase } from 'expo-sqlite';
import type { Circuit } from '@/domain/models/circuit';
import type { GrandPrix } from '@/domain/models/grand-prix';
import type { Season, SeasonStatus } from '@/domain/models/season';
import type { SeasonSchedule } from '@/domain/models/season-schedule';
import type { Session, SessionType } from '@/domain/models/session';
import type { ScheduleRepository } from '@/domain/repositories/schedule-repository';

interface SeasonRow {
  year: number;
  name: string;
  status: string;
}

interface CircuitRow {
  id: string;
  name: string;
  short_name: string | null;
  country: string;
  country_code: string | null;
  city: string;
  latitude: number | null;
  longitude: number | null;
  length_km: number | null;
  laps: number | null;
  race_distance_km: number | null;
}

interface GrandPrixRow {
  id: string;
  season_year: number;
  round: number;
  name: string;
  official_name: string | null;
  country: string;
  country_code: string | null;
  city: string;
  circuit_id: string;
  start_at: string;
  end_at: string;
  is_cancelled: number;
  sprint_weekend: number;
}

interface SessionRow {
  id: string;
  grand_prix_id: string;
  type: string;
  name: string;
  start_at: string;
  end_at: string | null;
  timezone: string;
  scheduled_laps: number | null;
  is_cancelled: number;
}

function toSeason(row: SeasonRow): Season {
  return { year: row.year, name: row.name, status: row.status as SeasonStatus };
}

function toCircuit(row: CircuitRow): Circuit {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    country: row.country,
    countryCode: row.country_code,
    city: row.city,
    latitude: row.latitude,
    longitude: row.longitude,
    lengthKm: row.length_km,
    laps: row.laps,
    raceDistanceKm: row.race_distance_km,
  };
}

function toGrandPrix(row: GrandPrixRow): GrandPrix {
  return {
    id: row.id,
    seasonYear: row.season_year,
    round: row.round,
    name: row.name,
    officialName: row.official_name,
    country: row.country,
    countryCode: row.country_code,
    city: row.city,
    circuitId: row.circuit_id,
    startAt: row.start_at,
    endAt: row.end_at,
    isCancelled: row.is_cancelled === 1,
    sprintWeekend: row.sprint_weekend === 1,
  };
}

function toSession(row: SessionRow): Session {
  return {
    id: row.id,
    grandPrixId: row.grand_prix_id,
    type: row.type as SessionType,
    name: row.name,
    startAt: row.start_at,
    endAt: row.end_at,
    timezone: row.timezone,
    scheduledLaps: row.scheduled_laps,
    isCancelled: row.is_cancelled === 1,
  };
}

export class SqliteScheduleRepository implements ScheduleRepository {
  constructor(private readonly database: () => Promise<SQLiteDatabase>) {}

  async listSeasons(): Promise<Season[]> {
    const db = await this.database();
    const rows = await db.getAllAsync<SeasonRow>('SELECT * FROM seasons ORDER BY year DESC');
    return rows.map(toSeason);
  }

  async getSeason(year: number): Promise<Season | null> {
    const db = await this.database();
    const row = await db.getFirstAsync<SeasonRow>('SELECT * FROM seasons WHERE year = ?', year);
    return row ? toSeason(row) : null;
  }

  async upsertSeasons(seasons: Season[]): Promise<void> {
    const db = await this.database();
    await db.withExclusiveTransactionAsync(async (transaction) => {
      for (const season of seasons) {
        await transaction.runAsync(
          `INSERT INTO seasons (year, name, status) VALUES (?, ?, ?)
           ON CONFLICT(year) DO UPDATE SET name = excluded.name, status = excluded.status`,
          season.year,
          season.name,
          season.status,
        );
      }
    });
  }

  async getCircuit(circuitId: string): Promise<Circuit | null> {
    const db = await this.database();
    const row = await db.getFirstAsync<CircuitRow>('SELECT * FROM circuits WHERE id = ?', circuitId);
    return row ? toCircuit(row) : null;
  }

  async listGrandPrix(seasonYear: number): Promise<GrandPrix[]> {
    const db = await this.database();
    const rows = await db.getAllAsync<GrandPrixRow>(
      'SELECT * FROM grand_prix WHERE season_year = ? ORDER BY round ASC',
      seasonYear,
    );
    return rows.map(toGrandPrix);
  }

  async getGrandPrix(grandPrixId: string): Promise<GrandPrix | null> {
    const db = await this.database();
    const row = await db.getFirstAsync<GrandPrixRow>('SELECT * FROM grand_prix WHERE id = ?', grandPrixId);
    return row ? toGrandPrix(row) : null;
  }

  async countGrandPrixBySeason(): Promise<Record<number, number>> {
    const db = await this.database();
    const rows = await db.getAllAsync<{ season_year: number; count: number }>(
      'SELECT season_year, COUNT(*) as count FROM grand_prix GROUP BY season_year',
    );
    return Object.fromEntries(rows.map((row) => [row.season_year, row.count]));
  }

  async listUpcomingGrandPrix(fromIso: string, limit: number): Promise<GrandPrix[]> {
    const db = await this.database();
    const rows = await db.getAllAsync<GrandPrixRow>(
      'SELECT * FROM grand_prix WHERE is_cancelled = 0 AND end_at > ? ORDER BY start_at ASC LIMIT ?',
      fromIso,
      limit,
    );
    return rows.map(toGrandPrix);
  }

  async listSessions(grandPrixId: string): Promise<Session[]> {
    const db = await this.database();
    const rows = await db.getAllAsync<SessionRow>(
      'SELECT * FROM sessions WHERE grand_prix_id = ? ORDER BY start_at ASC',
      grandPrixId,
    );
    return rows.map(toSession);
  }

  async listSessionsBySeason(seasonYear: number): Promise<Session[]> {
    const db = await this.database();
    const rows = await db.getAllAsync<SessionRow>(
      `SELECT sessions.* FROM sessions
       INNER JOIN grand_prix ON grand_prix.id = sessions.grand_prix_id
       WHERE grand_prix.season_year = ?
       ORDER BY sessions.start_at ASC`,
      seasonYear,
    );
    return rows.map(toSession);
  }

  async getSession(sessionId: string): Promise<Session | null> {
    const db = await this.database();
    const row = await db.getFirstAsync<SessionRow>('SELECT * FROM sessions WHERE id = ?', sessionId);
    return row ? toSession(row) : null;
  }

  async listUpcomingSessions(fromIso: string, limit: number): Promise<Session[]> {
    const db = await this.database();
    const rows = await db.getAllAsync<SessionRow>(
      'SELECT * FROM sessions WHERE is_cancelled = 0 AND start_at > ? ORDER BY start_at ASC LIMIT ?',
      fromIso,
      limit,
    );
    return rows.map(toSession);
  }

  async replaceSeasonSchedule(schedule: SeasonSchedule): Promise<void> {
    const db = await this.database();
    const syncedAt = new Date().toISOString();
    await db.withExclusiveTransactionAsync(async (transaction) => {
      const { season } = schedule;
      await transaction.runAsync(
        `INSERT INTO seasons (year, name, status, synced_at) VALUES (?, ?, ?, ?)
         ON CONFLICT(year) DO UPDATE SET name = excluded.name, status = excluded.status, synced_at = excluded.synced_at`,
        season.year,
        season.name,
        season.status,
        syncedAt,
      );

      for (const circuit of schedule.circuits) {
        await transaction.runAsync(
          `INSERT INTO circuits (id, name, short_name, country, country_code, city, latitude, longitude, length_km, laps, race_distance_km)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             name = excluded.name, short_name = excluded.short_name, country = excluded.country,
             country_code = excluded.country_code, city = excluded.city, latitude = excluded.latitude,
             longitude = excluded.longitude, length_km = excluded.length_km, laps = excluded.laps,
             race_distance_km = excluded.race_distance_km`,
          circuit.id,
          circuit.name,
          circuit.shortName,
          circuit.country,
          circuit.countryCode,
          circuit.city,
          circuit.latitude,
          circuit.longitude,
          circuit.lengthKm,
          circuit.laps,
          circuit.raceDistanceKm,
        );
      }

      await transaction.runAsync(
        'DELETE FROM sessions WHERE grand_prix_id IN (SELECT id FROM grand_prix WHERE season_year = ?)',
        season.year,
      );
      await transaction.runAsync('DELETE FROM grand_prix WHERE season_year = ?', season.year);

      for (const entry of schedule.grandPrix) {
        const { grandPrix, sessions } = entry;
        await transaction.runAsync(
          `INSERT INTO grand_prix (id, season_year, round, name, official_name, country, country_code, city, circuit_id, start_at, end_at, is_cancelled, sprint_weekend)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          grandPrix.id,
          grandPrix.seasonYear,
          grandPrix.round,
          grandPrix.name,
          grandPrix.officialName,
          grandPrix.country,
          grandPrix.countryCode,
          grandPrix.city,
          grandPrix.circuitId,
          grandPrix.startAt,
          grandPrix.endAt,
          grandPrix.isCancelled ? 1 : 0,
          grandPrix.sprintWeekend ? 1 : 0,
        );
        for (const session of sessions) {
          await transaction.runAsync(
            `INSERT INTO sessions (id, grand_prix_id, type, name, start_at, end_at, timezone, scheduled_laps, is_cancelled)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            session.id,
            session.grandPrixId,
            session.type,
            session.name,
            session.startAt,
            session.endAt,
            session.timezone,
            session.scheduledLaps,
            session.isCancelled ? 1 : 0,
          );
        }
      }
    });
  }
}
