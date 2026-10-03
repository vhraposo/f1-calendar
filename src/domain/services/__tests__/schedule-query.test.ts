import { makeGrandPrix, makeSession } from '@/test-support/schedule-fixtures';
import {
  findNextGrandPrix,
  findNextSession,
  findUpcomingGrandPrix,
  resolveSeasonStatus,
  resolveSessionPhase,
} from '@/domain/services/schedule-query';

describe('schedule queries', () => {
  const now = Date.parse('2026-03-06T12:00:00.000Z');

  it('finds the next grand prix, skipping cancelled events', () => {
    const cancelled = makeGrandPrix({
      id: '2026-02',
      round: 2,
      startAt: '2026-03-13T03:30:00.000Z',
      endAt: '2026-03-15T07:00:00.000Z',
      isCancelled: true,
    });
    const next = makeGrandPrix({
      id: '2026-03',
      round: 3,
      startAt: '2026-03-27T02:30:00.000Z',
      endAt: '2026-03-29T05:00:00.000Z',
    });
    expect(findNextGrandPrix([cancelled, next], now)?.id).toBe('2026-03');
  });

  it('keeps a live race weekend as the next grand prix', () => {
    const current = makeGrandPrix({
      startAt: '2026-03-06T01:30:00.000Z',
      endAt: '2026-03-08T04:00:00.000Z',
    });
    expect(findNextGrandPrix([current], now)?.id).toBe('2026-01');
  });

  it('finds the next session in chronological order', () => {
    const sessions = [
      makeSession({ id: 'fp1', type: 'PRACTICE_1', startAt: '2026-03-06T01:30:00.000Z' }),
      makeSession({ id: 'fp2', type: 'PRACTICE_2', startAt: '2026-03-06T05:00:00.000Z' }),
      makeSession({ id: 'q', type: 'QUALIFYING', startAt: '2026-03-07T05:00:00.000Z' }),
    ];
    expect(findNextSession(sessions, now)?.id).toBe('q');
  });

  it('skips cancelled sessions when finding the next session', () => {
    const sessions = [
      makeSession({
        id: 'q',
        type: 'QUALIFYING',
        startAt: '2026-03-07T05:00:00.000Z',
        isCancelled: true,
      }),
      makeSession({ id: 'race', type: 'RACE', startAt: '2026-03-08T04:00:00.000Z' }),
    ];
    expect(findNextSession(sessions, now)?.id).toBe('race');
  });

  it('limits upcoming grand prix results', () => {
    const events = [1, 2, 3, 4].map((round) =>
      makeGrandPrix({
        id: `2026-0${round}`,
        round,
        startAt: new Date(now + round * 86_400_000).toISOString(),
        endAt: new Date(now + round * 86_400_000 + 3_600_000).toISOString(),
      }),
    );
    expect(findUpcomingGrandPrix(events, now, 2)).toHaveLength(2);
  });

  it('resolves session phases including live windows', () => {
    const session = makeSession({
      type: 'QUALIFYING',
      startAt: '2026-03-06T11:30:00.000Z',
    });
    expect(resolveSessionPhase(session, Date.parse('2026-03-06T11:00:00.000Z'))).toBe('upcoming');
    expect(resolveSessionPhase(session, Date.parse('2026-03-06T11:45:00.000Z'))).toBe('live');
    expect(resolveSessionPhase(session, Date.parse('2026-03-06T13:00:00.000Z'))).toBe('finished');
  });

  it('resolves season status from real session dates', () => {
    expect(
      resolveSeasonStatus(2026, '2026-03-06T01:30:00.000Z', '2026-12-06T13:00:00.000Z', now),
    ).toBe('inProgress');
    expect(
      resolveSeasonStatus(2027, '2027-03-05T01:30:00.000Z', '2027-12-05T13:00:00.000Z', now),
    ).toBe('upcoming');
    expect(
      resolveSeasonStatus(2025, '2025-03-14T01:30:00.000Z', '2025-12-07T13:00:00.000Z', now),
    ).toBe('completed');
  });

  it('falls back to year heuristics when dates are unknown', () => {
    expect(resolveSeasonStatus(2025, null, null, now)).toBe('completed');
    expect(resolveSeasonStatus(2026, null, null, now)).toBe('inProgress');
    expect(resolveSeasonStatus(2027, null, null, now)).toBe('upcoming');
  });
});
