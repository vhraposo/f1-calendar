import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { getDeviceRegionCode } from '@/core/localization/device-locale';
import { reconcileSessionReminders } from '@/notifications/reminder-reconciliation';
import { usePreferences } from '@/providers/preferences-provider';
import { useServices } from '@/providers/services-provider';
import { useTranslation } from '@/providers/i18n-provider';

export interface SyncContextValue {
  isSyncing: boolean;
  lastSyncedAt: string | null;
  syncFailed: boolean;
  refresh: () => Promise<void>;
  reconcileReminders: () => Promise<void>;
}

const SyncContext = createContext<SyncContextValue | null>(null);

export function SyncProvider({ children }: { children: ReactNode }) {
  const services = useServices();
  const { preferences, reminderSettings, isLoaded } = usePreferences();
  const { language } = useTranslation();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFailed, setSyncFailed] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const bootstrapped = useRef(false);

  const reconcileReminders = useCallback(async () => {
    await reconcileSessionReminders({
      services,
      settings: reminderSettings,
      countryCode: preferences.countryCode ?? getDeviceRegionCode(),
      language,
    });
  }, [language, preferences.countryCode, reminderSettings, services]);

  const runSync = useCallback(
    async (force: boolean) => {
      setIsSyncing(true);
      setSyncFailed(false);
      try {
        await services.syncService.ensureBroadcastSeed();
        const results = await services.syncService.syncUpcomingSeasons(force);
        const failed = results.some((result) => result.status === 'failed');
        setSyncFailed(failed);
        const storedLastSync = await services.syncStateRepository.getLastSuccessfulSyncAt('season');
        setLastSyncedAt(storedLastSync);
        await reconcileReminders();
      } catch {
        setSyncFailed(true);
      } finally {
        setIsSyncing(false);
      }
    },
    [reconcileReminders, services],
  );

  useEffect(() => {
    if (!isLoaded || bootstrapped.current) {
      return;
    }
    bootstrapped.current = true;
    void runSync(false);
  }, [isLoaded, runSync]);

  const refresh = useCallback(async () => {
    await runSync(true);
  }, [runSync]);

  const value = useMemo(
    () => ({ isSyncing, lastSyncedAt, syncFailed, refresh, reconcileReminders }),
    [isSyncing, lastSyncedAt, syncFailed, refresh, reconcileReminders],
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync(): SyncContextValue {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within SyncProvider');
  }
  return context;
}
