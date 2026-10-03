export interface CalendarLink {
  sessionId: string;
  eventId: string;
  calendarId: string;
  createdAt: string;
}

export interface CalendarLinkRepository {
  list(): Promise<CalendarLink[]>;
  find(sessionId: string): Promise<CalendarLink | null>;
  save(link: CalendarLink): Promise<void>;
  remove(sessionId: string): Promise<void>;
}
