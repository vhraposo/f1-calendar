import type { SQLiteDatabase } from 'expo-sqlite';
import type { CalendarLink, CalendarLinkRepository } from '@/domain/repositories/calendar-link-repository';

interface CalendarLinkRow {
  session_id: string;
  event_id: string;
  calendar_id: string;
  created_at: string;
}

function toCalendarLink(row: CalendarLinkRow): CalendarLink {
  return {
    sessionId: row.session_id,
    eventId: row.event_id,
    calendarId: row.calendar_id,
    createdAt: row.created_at,
  };
}

export class SqliteCalendarLinkRepository implements CalendarLinkRepository {
  constructor(private readonly database: () => Promise<SQLiteDatabase>) {}

  async list(): Promise<CalendarLink[]> {
    const db = await this.database();
    const rows = await db.getAllAsync<CalendarLinkRow>('SELECT * FROM calendar_links');
    return rows.map(toCalendarLink);
  }

  async find(sessionId: string): Promise<CalendarLink | null> {
    const db = await this.database();
    const row = await db.getFirstAsync<CalendarLinkRow>(
      'SELECT * FROM calendar_links WHERE session_id = ?',
      sessionId,
    );
    return row ? toCalendarLink(row) : null;
  }

  async save(link: CalendarLink): Promise<void> {
    const db = await this.database();
    await db.runAsync(
      `INSERT INTO calendar_links (session_id, event_id, calendar_id, created_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(session_id) DO UPDATE SET event_id = excluded.event_id, calendar_id = excluded.calendar_id, created_at = excluded.created_at`,
      link.sessionId,
      link.eventId,
      link.calendarId,
      link.createdAt,
    );
  }

  async remove(sessionId: string): Promise<void> {
    const db = await this.database();
    await db.runAsync('DELETE FROM calendar_links WHERE session_id = ?', sessionId);
  }
}
