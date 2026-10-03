import type { BroadcastInformation } from '@/domain/models/broadcast-information';
import { selectBroadcasters } from '@/domain/services/broadcast-directory';

function makeBroadcast(overrides: Partial<BroadcastInformation>): BroadcastInformation {
  return {
    id: overrides.id ?? 'broadcast-1',
    seasonYear: 'seasonYear' in overrides ? overrides.seasonYear ?? null : 2026,
    countryCode: overrides.countryCode ?? 'BR',
    sessionType: overrides.sessionType ?? null,
    broadcaster: overrides.broadcaster ?? 'TV Globo',
    platform: overrides.platform ?? 'unknown',
    streamingService: overrides.streamingService ?? null,
    availability: overrides.availability ?? 'unknown',
    source: overrides.source ?? 'https://www.formula1.com/',
    validFrom: overrides.validFrom ?? '2026-01-01',
    validUntil: overrides.validUntil ?? '2026-12-31',
  };
}

describe('broadcast directory', () => {
  const now = Date.parse('2026-06-01T00:00:00.000Z');

  it('selects broadcasters for the user country and season', () => {
    const entries = [makeBroadcast({}), makeBroadcast({ id: 'broadcast-2', countryCode: 'US', broadcaster: 'Apple TV' })];
    const result = selectBroadcasters(entries, { countryCode: 'BR', seasonYear: 2026, sessionType: 'RACE', now });
    expect(result.map((entry) => entry.broadcaster)).toEqual(['TV Globo']);
  });

  it('ignores entries outside their validity window', () => {
    const expired = makeBroadcast({ validUntil: '2025-12-31' });
    const result = selectBroadcasters([expired], { countryCode: 'BR', seasonYear: 2026, sessionType: 'RACE', now });
    expect(result).toHaveLength(0);
  });

  it('prefers season-specific entries over generic ones', () => {
    const generic = makeBroadcast({ id: 'generic', seasonYear: null, broadcaster: 'Old TV' });
    const specific = makeBroadcast({ id: 'specific', seasonYear: 2026, broadcaster: 'New TV' });
    const result = selectBroadcasters([generic, specific], {
      countryCode: 'BR',
      seasonYear: 2026,
      sessionType: 'RACE',
      now,
    });
    expect(result[0].broadcaster).toBe('New TV');
  });

  it('prefers session-specific entries over all-session entries', () => {
    const allSessions = makeBroadcast({ id: 'all', sessionType: null, broadcaster: 'TV Globo' });
    const raceOnly = makeBroadcast({ id: 'race', sessionType: 'RACE', broadcaster: 'sportv' });
    const result = selectBroadcasters([allSessions, raceOnly], {
      countryCode: 'BR',
      seasonYear: 2026,
      sessionType: 'RACE',
      now,
    });
    expect(result[0].broadcaster).toBe('sportv');
  });

  it('does not return entries for other session types', () => {
    const qualifyingOnly = makeBroadcast({ sessionType: 'QUALIFYING' });
    const result = selectBroadcasters([qualifyingOnly], {
      countryCode: 'BR',
      seasonYear: 2026,
      sessionType: 'RACE',
      now,
    });
    expect(result).toHaveLength(0);
  });

  it('deduplicates identical broadcaster entries', () => {
    const result = selectBroadcasters([makeBroadcast({}), makeBroadcast({ id: 'duplicate' })], {
      countryCode: 'BR',
      seasonYear: 2026,
      sessionType: 'RACE',
      now,
    });
    expect(result).toHaveLength(1);
  });

  it('returns an empty list when the country has no broadcaster', () => {
    const result = selectBroadcasters([], { countryCode: 'BR', seasonYear: 2026, sessionType: 'RACE', now });
    expect(result).toHaveLength(0);
  });
});
