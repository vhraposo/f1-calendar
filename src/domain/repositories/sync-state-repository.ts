export type SyncScope = 'seasons' | 'season' | 'broadcasts';

export interface SyncStateRepository {
  getLastSuccessfulSyncAt(scope: SyncScope): Promise<string | null>;
  setLastSuccessfulSyncAt(scope: SyncScope, isoInstant: string): Promise<void>;
}
