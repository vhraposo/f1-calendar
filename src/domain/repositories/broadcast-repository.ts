import type { BroadcastInformation } from '@/domain/models/broadcast-information';
import type { SessionType } from '@/domain/models/session';

export interface BroadcastRepository {
  listByCountry(countryCode: string): Promise<BroadcastInformation[]>;
  listAll(): Promise<BroadcastInformation[]>;
  replaceAll(entries: BroadcastInformation[]): Promise<void>;
  upsert(entries: BroadcastInformation[]): Promise<void>;
}

export interface BroadcastLookup {
  countryCode: string;
  seasonYear: number;
  sessionType: SessionType;
}
