import type { JolpicaSeasonSchedule } from '@/data/providers/jolpica/jolpica-dto';
import {
  buildGrandPrixId,
  mapJolpicaScheduleToDomain,
  mapSessionType,
} from '@/data/providers/jolpica/jolpica-schedule-mapper';

function makeSchedule(): JolpicaSeasonSchedule {
  return {
    id: 'season_2026',
    url: 'https://api.jolpi.ca/f1/alpha/schedules/2026/',
    year: 2026,
    wikipedia: null,
    events: [
      {
        round: {
          id: 'round_1',
          url: 'https://api.jolpi.ca/f1/alpha/core/rounds/round_1/',
          number: 1,
          name: 'Australian Grand Prix',
          is_cancelled: false,
          race_number: 1150,
          wikipedia: null,
        },
        circuit: {
          id: 'circuit_albert_park',
          url: '',
          name: 'Albert Park Grand Prix Circuit',
          locality: 'Melbourne',
          country_code: 'AUS',
          country: 'Australia',
          country_flag: null,
          latitude: -37.8497,
          longitude: 144.968,
          altitude: 10,
          wikipedia: null,
        },
        schedule: [
          {
            code: 'FP1',
            title: 'Practice 1',
            sessions: [{ id: 's1', url: '', number: 1, type: 'FP1', type_display: 'Practice One', is_cancelled: false }],
            timestamp: '2026-03-06T01:30:00Z',
            local_timestamp: '2026-03-06 12:30:00+11:00',
            timezone: 'Australia/Melbourne',
            results_url: null,
            laps_url: null,
          },
          {
            code: 'Q',
            title: 'Qualifying',
            sessions: [{ id: 's2', url: '', number: 2, type: 'Q1', type_display: 'Qualifying One', is_cancelled: false }],
            timestamp: '2026-03-07T05:00:00Z',
            local_timestamp: '2026-03-07 16:00:00+11:00',
            timezone: 'Australia/Melbourne',
            results_url: null,
            laps_url: null,
          },
          {
            code: 'R',
            title: 'Race',
            sessions: [
              { id: 's3', url: '', number: 3, type: 'R', type_display: 'Race', is_cancelled: false, scheduled_laps: 58 },
            ],
            timestamp: '2026-03-08T04:00:00Z',
            local_timestamp: '2026-03-08 15:00:00+11:00',
            timezone: 'Australia/Melbourne',
            results_url: null,
            laps_url: null,
          },
        ],
      },
      {
        round: {
          id: 'round_2',
          url: '',
          number: 2,
          name: 'Chinese Grand Prix',
          is_cancelled: false,
          race_number: 1151,
          wikipedia: null,
        },
        circuit: {
          id: 'circuit_shanghai',
          url: '',
          name: 'Shanghai International Circuit',
          locality: 'Shanghai',
          country_code: 'CHN',
          country: 'China',
          country_flag: null,
          latitude: 31.3389,
          longitude: 121.22,
          altitude: null,
          wikipedia: null,
        },
        schedule: [
          {
            code: 'FP1',
            title: 'Practice 1',
            sessions: [{ id: 's4', url: '', number: 1, type: 'FP1', type_display: 'Practice One', is_cancelled: false }],
            timestamp: '2026-03-13T03:30:00Z',
            local_timestamp: '2026-03-13 11:30:00+08:00',
            timezone: 'Asia/Shanghai',
            results_url: null,
            laps_url: null,
          },
          {
            code: 'SQ',
            title: 'Sprint Qualifying',
            sessions: [
              { id: 's5', url: '', number: 2, type: 'SQ1', type_display: 'Sprint Qualifying One', is_cancelled: false },
            ],
            timestamp: '2026-03-13T07:30:00Z',
            local_timestamp: '2026-03-13 15:30:00+08:00',
            timezone: 'Asia/Shanghai',
            results_url: null,
            laps_url: null,
          },
          {
            code: 'SR',
            title: 'Sprint Race',
            sessions: [{ id: 's6', url: '', number: 3, type: 'SR', type_display: 'Sprint Race', is_cancelled: false }],
            timestamp: '2026-03-14T03:00:00Z',
            local_timestamp: '2026-03-14 11:00:00+08:00',
            timezone: 'Asia/Shanghai',
            results_url: null,
            laps_url: null,
          },
          {
            code: 'Q',
            title: 'Qualifying',
            sessions: [{ id: 's7', url: '', number: 4, type: 'Q1', type_display: 'Qualifying One', is_cancelled: false }],
            timestamp: '2026-03-14T07:00:00Z',
            local_timestamp: '2026-03-14 15:00:00+08:00',
            timezone: 'Asia/Shanghai',
            results_url: null,
            laps_url: null,
          },
          {
            code: 'R',
            title: 'Race',
            sessions: [
              { id: 's8', url: '', number: 5, type: 'R', type_display: 'Race', is_cancelled: false, scheduled_laps: 56 },
            ],
            timestamp: '2026-03-15T07:00:00Z',
            local_timestamp: '2026-03-15 15:00:00+08:00',
            timezone: 'Asia/Shanghai',
            results_url: null,
            laps_url: null,
          },
        ],
      },
    ],
  };
}

describe('jolpica schedule mapper', () => {
  const now = Date.parse('2026-01-15T00:00:00.000Z');

  it('maps session types from provider codes', () => {
    expect(mapSessionType('FP1')).toBe('PRACTICE_1');
    expect(mapSessionType('SQ')).toBe('SPRINT_QUALIFYING');
    expect(mapSessionType('SR')).toBe('SPRINT');
    expect(mapSessionType('Q')).toBe('QUALIFYING');
    expect(mapSessionType('R')).toBe('RACE');
    expect(mapSessionType('FUTURE_CODE')).toBe('OTHER');
  });

  it('builds deterministic grand prix identifiers', () => {
    expect(buildGrandPrixId(2026, 1)).toBe('2026-01');
    expect(buildGrandPrixId(2026, 24)).toBe('2026-24');
  });

  it('maps a standard weekend with UTC instants and IANA timezones', () => {
    const schedule = mapJolpicaScheduleToDomain(makeSchedule(), now);
    const australia = schedule.grandPrix[0];
    expect(australia.grandPrix.id).toBe('2026-01');
    expect(australia.grandPrix.countryCode).toBe('AU');
    expect(australia.grandPrix.sprintWeekend).toBe(false);
    expect(australia.sessions).toHaveLength(3);
    expect(australia.sessions[0].id).toBe('2026-01-practice-1');
    expect(australia.sessions[0].timezone).toBe('Australia/Melbourne');
    expect(australia.sessions[2].scheduledLaps).toBe(58);
    expect(schedule.circuits[0].laps).toBe(58);
  });

  it('detects sprint weekends and preserves their session structure', () => {
    const schedule = mapJolpicaScheduleToDomain(makeSchedule(), now);
    const china = schedule.grandPrix[1];
    expect(china.grandPrix.sprintWeekend).toBe(true);
    expect(china.sessions.map((session) => session.type)).toEqual([
      'PRACTICE_1',
      'SPRINT_QUALIFYING',
      'SPRINT',
      'QUALIFYING',
      'RACE',
    ]);
  });

  it('skips schedule entries without a timestamp', () => {
    const dto = makeSchedule();
    dto.events[0].schedule[1].timestamp = null;
    const schedule = mapJolpicaScheduleToDomain(dto, now);
    expect(schedule.grandPrix[0].sessions.map((session) => session.type)).toEqual(['PRACTICE_1', 'RACE']);
  });

  it('marks cancelled rounds', () => {
    const dto = makeSchedule();
    dto.events[0].round.is_cancelled = true;
    const schedule = mapJolpicaScheduleToDomain(dto, now);
    const cancelled = schedule.grandPrix.find((entry) => entry.grandPrix.id === '2026-01');
    expect(cancelled?.grandPrix.isCancelled).toBe(true);
  });

  it('handles cancelled rounds that have no round number', () => {
    const dto = makeSchedule();
    dto.events[0].round.number = undefined;
    dto.events[0].round.is_cancelled = true;
    const schedule = mapJolpicaScheduleToDomain(dto, now);
    const cancelled = schedule.grandPrix.find((entry) => entry.grandPrix.isCancelled);
    expect(cancelled?.grandPrix.id).toMatch(/^2026-cancelled-/);
    expect(cancelled?.grandPrix.round).toBe(0);
    expect(schedule.grandPrix[schedule.grandPrix.length - 1].grandPrix.isCancelled).toBe(true);
  });

  it('maps unknown future session codes to OTHER while keeping the title', () => {
    const dto = makeSchedule();
    dto.events[0].schedule.push({
      code: 'XX',
      title: 'Exhibition Session',
      sessions: [{ id: 'sx', url: '', number: 9, type: 'XX', type_display: 'Exhibition', is_cancelled: false }],
      timestamp: '2026-03-07T09:00:00Z',
      local_timestamp: null,
      timezone: 'Australia/Melbourne',
      results_url: null,
      laps_url: null,
    });
    const schedule = mapJolpicaScheduleToDomain(dto, now);
    const other = schedule.grandPrix[0].sessions.find((session) => session.type === 'OTHER');
    expect(other?.name).toBe('Exhibition Session');
    expect(other?.id).toBe('2026-01-other-4');
  });

  it('computes the season status from session dates', () => {
    const schedule = mapJolpicaScheduleToDomain(makeSchedule(), now);
    expect(schedule.season.status).toBe('upcoming');
    const duringSeason = mapJolpicaScheduleToDomain(makeSchedule(), Date.parse('2026-03-07T00:00:00Z'));
    expect(duringSeason.season.status).toBe('inProgress');
    const afterSeason = mapJolpicaScheduleToDomain(makeSchedule(), Date.parse('2027-01-01T00:00:00Z'));
    expect(afterSeason.season.status).toBe('completed');
  });
});
