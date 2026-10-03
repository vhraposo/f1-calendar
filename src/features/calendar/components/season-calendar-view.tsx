import { useMemo, useState } from 'react';
import { SectionList, View } from 'react-native';
import { AppText } from '@/components/app-text';
import { SegmentedControl } from '@/components/segmented-control';
import { formatMonthLongInZone, formatYearInZone, getDeviceTimeZone } from '@/core/time/instant';
import type { GrandPrix } from '@/domain/models/grand-prix';
import type { SeasonCalendarEntry } from '@/domain/use-cases/get-season-calendar';
import { GrandPrixRow, GrandPrixRowDivider } from '@/features/calendar/components/grand-prix-row';
import { useTranslation } from '@/providers/i18n-provider';

type CalendarFilter = 'upcoming' | 'completed' | 'all';

export interface SeasonCalendarViewProps {
  entries: SeasonCalendarEntry[];
  now: number;
  onSelectGrandPrix: (grandPrix: GrandPrix) => void;
  ListHeaderComponent?: React.ReactElement | null;
  ListEmptyComponent?: React.ReactElement | null;
}

interface MonthSection {
  title: string;
  data: SeasonCalendarEntry[];
}

export function SeasonCalendarView({
  entries,
  now,
  onSelectGrandPrix,
  ListHeaderComponent,
  ListEmptyComponent,
}: SeasonCalendarViewProps) {
  const { t, language } = useTranslation();
  const [filter, setFilter] = useState<CalendarFilter>('upcoming');
  const deviceTimeZone = getDeviceTimeZone();

  const filtered = useMemo(() => {
    return entries.filter((entry) => {
      if (entry.grandPrix.isCancelled && filter === 'upcoming') {
        return false;
      }
      const finished = new Date(entry.grandPrix.endAt).getTime() < now;
      if (filter === 'upcoming') {
        return !finished;
      }
      if (filter === 'completed') {
        return finished;
      }
      return true;
    });
  }, [entries, filter, now]);

  const sections = useMemo<MonthSection[]>(() => {
    const byMonth = new Map<string, MonthSection>();
    for (const entry of filtered) {
      const month = formatMonthLongInZone(entry.grandPrix.endAt, deviceTimeZone, language);
      const year = formatYearInZone(entry.grandPrix.endAt, deviceTimeZone, language);
      const key = `${month}-${year}`;
      const section = byMonth.get(key) ?? { title: `${month} ${year}`.toUpperCase(), data: [] };
      section.data.push(entry);
      byMonth.set(key, section);
    }
    return [...byMonth.values()];
  }, [deviceTimeZone, filtered, language]);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.grandPrix.id}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
      contentContainerClassName="px-lg pb-3xl pt-md"
      ListHeaderComponent={
        <View className="gap-md pb-md">
          {ListHeaderComponent}
          <SegmentedControl<CalendarFilter>
            value={filter}
            onChange={setFilter}
            accessibilityLabel={t('calendar.title')}
            options={[
              { value: 'upcoming', label: t('calendar.upcoming') },
              { value: 'completed', label: t('calendar.completed') },
              { value: 'all', label: t('common.seeAll') },
            ]}
          />
        </View>
      }
      ListEmptyComponent={ListEmptyComponent ?? null}
      renderSectionHeader={({ section }) => (
        <AppText variant="label" tone="secondary" className="pb-sm pt-lg">
          {section.title}
        </AppText>
      )}
      renderItem={({ item, index }) => (
        <View>
          {index > 0 ? <GrandPrixRowDivider /> : null}
          <GrandPrixRow entry={item} onPress={() => onSelectGrandPrix(item.grandPrix)} />
        </View>
      )}
    />
  );
}
