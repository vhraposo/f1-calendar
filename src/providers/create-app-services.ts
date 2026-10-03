import { APP_CONFIG } from '@/core/config/app-config';
import { JsonHttpClient } from '@/core/networking/json-http-client';
import { getDatabase } from '@/core/persistence/database';
import { DeviceCalendarIntegration } from '@/calendar/calendar-integration';
import { NotificationBackedAlarmScheduler, type AlarmScheduler } from '@/alarms/alarm-scheduler';
import { SyncService } from '@/data/cache/sync-service';
import { FallbackF1DataProvider } from '@/data/providers/fallback-f1-data-provider';
import { JolpicaF1Provider } from '@/data/providers/jolpica/jolpica-f1-provider';
import { KeyValuePreferencesRepository } from '@/data/repositories/key-value-preferences-repository';
import { SqliteBroadcastRepository } from '@/data/repositories/sqlite-broadcast-repository';
import { SqliteCalendarLinkRepository } from '@/data/repositories/sqlite-calendar-link-repository';
import { SqliteScheduleRepository } from '@/data/repositories/sqlite-schedule-repository';
import { SqliteSyncStateRepository } from '@/data/repositories/sqlite-sync-state-repository';
import { SessionNotificationScheduler } from '@/notifications/session-notification-scheduler';

export interface AppServices {
  scheduleRepository: SqliteScheduleRepository;
  broadcastRepository: SqliteBroadcastRepository;
  calendarLinkRepository: SqliteCalendarLinkRepository;
  preferencesRepository: KeyValuePreferencesRepository;
  syncStateRepository: SqliteSyncStateRepository;
  syncService: SyncService;
  notificationScheduler: SessionNotificationScheduler;
  alarmScheduler: AlarmScheduler;
  calendarIntegration: DeviceCalendarIntegration;
}

export function createAppServices(): AppServices {
  const database = getDatabase;
  const scheduleRepository = new SqliteScheduleRepository(database);
  const broadcastRepository = new SqliteBroadcastRepository(database);
  const calendarLinkRepository = new SqliteCalendarLinkRepository(database);
  const preferencesRepository = new KeyValuePreferencesRepository();
  const syncStateRepository = new SqliteSyncStateRepository(database);

  const httpClient = new JsonHttpClient({
    baseUrl: APP_CONFIG.jolpicaBaseUrl,
    userAgent: APP_CONFIG.userAgent,
  });
  const provider = new FallbackF1DataProvider([new JolpicaF1Provider(httpClient)]);
  const syncService = new SyncService(provider, scheduleRepository, broadcastRepository, syncStateRepository);

  const notificationScheduler = new SessionNotificationScheduler('notification');
  const alarmScheduler = new NotificationBackedAlarmScheduler();
  const calendarIntegration = new DeviceCalendarIntegration(calendarLinkRepository);

  return {
    scheduleRepository,
    broadcastRepository,
    calendarLinkRepository,
    preferencesRepository,
    syncStateRepository,
    syncService,
    notificationScheduler,
    alarmScheduler,
    calendarIntegration,
  };
}
