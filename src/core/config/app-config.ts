export const APP_CONFIG = {
  appName: 'F1 Calendar',
  appVersion: '1.0.0',
  userAgent: 'F1Calendar/1.0.0 (Expo; React Native)',
  jolpicaBaseUrl: 'https://api.jolpi.ca',
  jolpicaProviderId: 'jolpica-f1',
  httpTimeoutMs: 12_000,
  httpRetries: 2,
  syncFreshnessHours: 6,
  reminderHorizonDays: 60,
  maxScheduledReminders: 56,
  maxUpcomingGrandPrix: 5,
} as const;

export function buildUserAgent(platform: string, version = APP_CONFIG.appVersion): string {
  return `F1Calendar/${version} (Expo; ${platform})`;
}
