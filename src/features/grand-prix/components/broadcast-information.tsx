import { View } from 'react-native';
import { AppText } from '@/components/app-text';
import { AppIcon } from '@/design-system/icons';
import { colors } from '@/design-system/tokens';
import type { BroadcastInformation } from '@/domain/models/broadcast-information';
import type { Session } from '@/domain/models/session';
import { selectBroadcasters } from '@/domain/services/broadcast-directory';
import { sessionName } from '@/i18n/session-labels';
import { useTranslation } from '@/providers/i18n-provider';

export interface BroadcastInformationListProps {
  sessions: Session[];
  broadcasts: BroadcastInformation[];
  countryCode: string | null;
  now: number;
}

interface BroadcastLine {
  sessionLabel: string;
  broadcaster: string;
  platform: BroadcastInformation['platform'];
}

const PLATFORM_ICON: Record<BroadcastInformation['platform'], 'tv' | 'radio' | 'globe'> = {
  freeToAir: 'tv',
  payTv: 'tv',
  streaming: 'radio',
  unknown: 'globe',
};

export function BroadcastInformationList({
  sessions,
  broadcasts,
  countryCode,
  now,
}: BroadcastInformationListProps) {
  const { t, language } = useTranslation();

  const lines: BroadcastLine[] = [];
  const seen = new Set<string>();
  let source: string | null = null;

  for (const session of sessions) {
    if (!countryCode) {
      continue;
    }
    const matches = selectBroadcasters(broadcasts, {
      countryCode,
      seasonYear: Number(session.grandPrixId.slice(0, 4)),
      sessionType: session.type,
      now,
    });
    for (const match of matches) {
      source = source ?? match.source;
      const key = `${session.id}|${match.broadcaster}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      lines.push({
        sessionLabel: sessionName(session, language),
        broadcaster: match.broadcaster,
        platform: match.platform,
      });
    }
  }

  if (!countryCode || lines.length === 0) {
    return (
      <View className="gap-sm rounded-lg border border-border bg-surface p-lg">
        <AppText variant="body" tone="secondary">
          {t('grandPrix.broadcastUnavailable')}
        </AppText>
      </View>
    );
  }

  const grouped = new Map<string, BroadcastLine[]>();
  for (const line of lines) {
    const list = grouped.get(line.broadcaster) ?? [];
    list.push(line);
    grouped.set(line.broadcaster, list);
  }

  return (
    <View className="gap-md rounded-lg border border-border bg-surface p-lg">
      {[...grouped.entries()].map(([broadcaster, entries]) => (
        <View key={broadcaster} className="flex-row items-start gap-md">
          <AppIcon name={PLATFORM_ICON[entries[0].platform]} size={18} color={colors.textSecondary} />
          <View className="flex-1 gap-xs">
            <AppText variant="bodyStrong">{broadcaster}</AppText>
            <AppText variant="caption" tone="muted">
              {entries.map((entry) => entry.sessionLabel).join(' \u00b7 ')}
            </AppText>
          </View>
        </View>
      ))}
      <View className="gap-xs border-t border-divider pt-md">
        <AppText variant="caption" tone="muted">
          {t('grandPrix.broadcastDisclaimer')}
        </AppText>
        {source ? (
          <AppText variant="caption" tone="muted">
            {source}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}
