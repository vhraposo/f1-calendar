import { computeCountdown, formatCountdownCompact } from '@/core/time/countdown';

describe('countdown', () => {
  const now = Date.UTC(2026, 2, 5, 0, 0, 0);

  it('computes days, hours, minutes and seconds', () => {
    const target = new Date(now + 3 * 86_400_000 + 8 * 3_600_000 + 21 * 60_000 + 5_000).toISOString();
    const parts = computeCountdown(target, now);
    expect(parts.days).toBe(3);
    expect(parts.hours).toBe(8);
    expect(parts.minutes).toBe(21);
    expect(parts.seconds).toBe(5);
    expect(parts.isComplete).toBe(false);
  });

  it('never returns negative values for past targets', () => {
    const parts = computeCountdown('2020-01-01T00:00:00.000Z', now);
    expect(parts.totalMilliseconds).toBe(0);
    expect(parts.isComplete).toBe(true);
  });

  it('formats compact countdowns with days', () => {
    const target = new Date(now + 3 * 86_400_000 + 8 * 3_600_000 + 21 * 60_000).toISOString();
    expect(formatCountdownCompact(computeCountdown(target, now))).toBe('3d 08h 21m');
  });

  it('formats compact countdowns with hours and seconds', () => {
    const target = new Date(now + 2 * 3_600_000 + 5 * 60_000 + 9_000).toISOString();
    expect(formatCountdownCompact(computeCountdown(target, now))).toBe('2h 05m 09s');
  });

  it('formats completed countdowns', () => {
    expect(formatCountdownCompact(computeCountdown('2020-01-01T00:00:00.000Z', now))).toBe('0m');
  });
});
