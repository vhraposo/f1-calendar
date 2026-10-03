import {
  formatDateRangeInZone,
  formatTimeInZone,
  isSameDayInZone,
} from '@/core/time/instant';

describe('timezone formatting', () => {
  it('formats race start in Brazil local time', () => {
    expect(formatTimeInZone('2026-03-08T04:00:00.000Z', 'America/Sao_Paulo', 'pt-BR')).toBe('01:00');
  });

  it('formats race start in Japan local time', () => {
    expect(formatTimeInZone('2026-03-29T05:00:00.000Z', 'Asia/Tokyo', 'en')).toBe('14:00');
  });

  it('formats race start in Australia/Melbourne with AEDT offset', () => {
    expect(formatTimeInZone('2026-03-08T04:00:00.000Z', 'Australia/Melbourne', 'en')).toBe('15:00');
  });

  it('handles the UK spring DST transition at the boundary instant', () => {
    expect(formatTimeInZone('2026-03-29T00:59:00.000Z', 'Europe/London', 'en')).toBe('00:59');
    expect(formatTimeInZone('2026-03-29T01:00:00.000Z', 'Europe/London', 'en')).toBe('02:00');
  });

  it('handles the UK autumn DST transition', () => {
    expect(formatTimeInZone('2026-10-25T00:59:00.000Z', 'Europe/London', 'en')).toBe('01:59');
    expect(formatTimeInZone('2026-10-25T01:00:00.000Z', 'Europe/London', 'en')).toBe('01:00');
  });

  it('handles the US spring DST transition', () => {
    expect(formatTimeInZone('2026-03-08T07:00:00.000Z', 'America/New_York', 'en')).toBe('03:00');
  });

  it('handles the Portugal DST transition', () => {
    expect(formatTimeInZone('2026-03-29T01:00:00.000Z', 'Europe/Lisbon', 'pt-BR')).toBe('02:00');
  });

  it('supports explicit UTC presentation', () => {
    expect(formatTimeInZone('2026-03-08T04:00:00.000Z', 'UTC', 'en')).toBe('04:00');
  });

  it('formats a date range across a race weekend', () => {
    const range = formatDateRangeInZone(
      '2026-03-06T01:30:00.000Z',
      '2026-03-08T04:00:00.000Z',
      'Australia/Melbourne',
      'en',
    );
    expect(range).toContain('MAR');
  });

  it('detects same-day comparisons within a zone', () => {
    expect(
      isSameDayInZone('2026-03-08T04:00:00.000Z', '2026-03-08T05:00:00.000Z', 'Australia/Melbourne', 'en'),
    ).toBe(true);
    expect(
      isSameDayInZone('2026-03-08T04:00:00.000Z', '2026-03-09T04:00:00.000Z', 'Australia/Melbourne', 'en'),
    ).toBe(false);
  });
});
