import { JsonHttpClient } from '@/core/networking/json-http-client';
import { JolpicaF1Provider } from '@/data/providers/jolpica/jolpica-f1-provider';

jest.setTimeout(60_000);

describe('live Jolpica integration', () => {
  const provider = new JolpicaF1Provider(
    new JsonHttpClient({
      baseUrl: 'https://api.jolpi.ca',
      userAgent: 'F1Calendar/1.0.0 (Expo; React Native)',
      timeoutMs: 20_000,
      retries: 1,
    }),
  );

  it('lists every published season', async () => {
    const years = await provider.listSeasonYears();
    expect(years.length).toBeGreaterThanOrEqual(70);
    expect(years).toContain(2026);
    expect(years).toContain(1950);
  });

  it('maps the 2026 season with sessions, timezones and cancellations', async () => {
    const schedule = await provider.fetchSeasonSchedule(2026);
    expect(schedule.grandPrix.length).toBeGreaterThanOrEqual(20);
    expect(schedule.circuits.length).toBeGreaterThanOrEqual(20);

    const sessions = schedule.grandPrix.flatMap((entry) => entry.sessions);
    expect(sessions.length).toBeGreaterThan(80);
    expect(sessions.every((session) => session.timezone.includes('/'))).toBe(true);
    expect(sessions.every((session) => !Number.isNaN(Date.parse(session.startAt)))).toBe(true);

    const sprintWeekend = schedule.grandPrix.find((entry) => entry.grandPrix.sprintWeekend);
    expect(sprintWeekend).toBeDefined();
    const sprintTypes = sprintWeekend!.sessions.map((session) => session.type);
    expect(sprintTypes).toContain('SPRINT_QUALIFYING');
    expect(sprintTypes).toContain('SPRINT');

    const cancelled = schedule.grandPrix.filter((entry) => entry.grandPrix.isCancelled);
    expect(cancelled.length).toBeGreaterThan(0);
    expect(cancelled.every((entry) => entry.grandPrix.id.includes('cancelled'))).toBe(true);
    expect(cancelled.every((entry) => entry.sessions.every((session) => session.isCancelled))).toBe(true);

    const races = schedule.grandPrix.filter((entry) => !entry.grandPrix.isCancelled);
    expect(races.every((entry) => entry.grandPrix.round > 0)).toBe(true);
    expect(races[0].grandPrix.id).toBe('2026-01');
  });

  it('maps a historical season', async () => {
    const schedule = await provider.fetchSeasonSchedule(1990);
    expect(schedule.grandPrix.length).toBeGreaterThan(10);
    expect(schedule.season.status).toBe('completed');
  });
});
