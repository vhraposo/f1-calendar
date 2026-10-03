import type { SessionType } from '@/domain/models/session';

export type BroadcastPlatform = 'freeToAir' | 'payTv' | 'streaming' | 'unknown';
export type BroadcastAvailability = 'live' | 'highlights' | 'delayed' | 'unknown';

export interface BroadcastInformation {
  id: string;
  seasonYear: number | null;
  countryCode: string;
  sessionType: SessionType | null;
  broadcaster: string;
  platform: BroadcastPlatform;
  streamingService: string | null;
  availability: BroadcastAvailability;
  source: string;
  validFrom: string;
  validUntil: string | null;
}
