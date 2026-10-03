import { JsonHttpClient } from '@/core/networking/json-http-client';
import { DataProviderError } from '@/core/errors/app-errors';
import { JolpicaF1Provider } from '@/data/providers/jolpica/jolpica-f1-provider';

const listPayload = {
  metadata: { timestamp: '2026-10-03T00:00:00Z', count: 2 },
  data: [
    { id: 'season_2025', url: '', year: 2025, wikipedia: null },
    { id: 'season_2026', url: '', year: 2026, wikipedia: null },
  ],
};

const schedulePayload = {
  metadata: { timestamp: '2026-10-03T00:00:00Z' },
  data: {
    id: 'season_2026',
    url: '',
    year: 2026,
    wikipedia: null,
    events: [
      {
        round: {
          id: 'round_1',
          url: '',
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
          altitude: null,
          wikipedia: null,
        },
        schedule: [
          {
            code: 'R',
            title: 'Race',
            sessions: [{ id: 's1', url: '', number: 1, type: 'R', type_display: 'Race', is_cancelled: false }],
            timestamp: '2026-03-08T04:00:00Z',
            local_timestamp: null,
            timezone: 'Australia/Melbourne',
            results_url: null,
            laps_url: null,
          },
        ],
      },
    ],
  },
};

describe('jolpica provider', () => {
  it('sends an identifiable user agent and lists seasons newest first', async () => {
    const fetchMock = jest.fn(async () =>
      new Response(JSON.stringify(listPayload), { status: 200 }),
    ) as unknown as typeof fetch;
    const client = new JsonHttpClient({
      baseUrl: 'https://api.jolpi.ca',
      userAgent: 'F1Calendar/1.0.0 (Expo; React Native)',
      fetchImpl: fetchMock,
    });
    const provider = new JolpicaF1Provider(client);

    const years = await provider.listSeasonYears();

    expect(years).toEqual([2026, 2025]);
    const [, init] = (fetchMock as jest.Mock).mock.calls[0];
    expect(init.headers['User-Agent']).toBe('F1Calendar/1.0.0 (Expo; React Native)');
  });

  it('maps season schedules into the domain', async () => {
    const fetchMock = jest.fn(async () =>
      new Response(JSON.stringify(schedulePayload), { status: 200 }),
    ) as unknown as typeof fetch;
    const client = new JsonHttpClient({
      baseUrl: 'https://api.jolpi.ca',
      userAgent: 'F1Calendar/1.0.0',
      fetchImpl: fetchMock,
    });
    const provider = new JolpicaF1Provider(client, () => Date.parse('2026-01-01T00:00:00Z'));

    const schedule = await provider.fetchSeasonSchedule(2026);

    expect(schedule.season.year).toBe(2026);
    expect(schedule.grandPrix).toHaveLength(1);
    expect(schedule.grandPrix[0].sessions[0].type).toBe('RACE');
    expect((fetchMock as jest.Mock).mock.calls[0][0]).toContain('/f1/alpha/schedules/2026/');
  });

  it('wraps network failures in DataProviderError', async () => {
    const fetchMock = jest.fn(async () =>
      new Response('{"message":"boom"}', { status: 500 }),
    ) as unknown as typeof fetch;
    const client = new JsonHttpClient({
      baseUrl: 'https://api.jolpi.ca',
      userAgent: 'F1Calendar/1.0.0',
      fetchImpl: fetchMock,
      retries: 0,
    });
    const provider = new JolpicaF1Provider(client);

    await expect(provider.fetchSeasonSchedule(2026)).rejects.toBeInstanceOf(DataProviderError);
  });

  it('rejects schedules that contain no usable sessions', async () => {
    const emptyPayload = { ...schedulePayload, data: { ...schedulePayload.data, events: [] } };
    const fetchMock = jest.fn(async () =>
      new Response(JSON.stringify(emptyPayload), { status: 200 }),
    ) as unknown as typeof fetch;
    const client = new JsonHttpClient({
      baseUrl: 'https://api.jolpi.ca',
      userAgent: 'F1Calendar/1.0.0',
      fetchImpl: fetchMock,
    });
    const provider = new JolpicaF1Provider(client);

    await expect(provider.fetchSeasonSchedule(2026)).rejects.toBeInstanceOf(DataProviderError);
  });
});
