import { View } from 'react-native';
import type { Session } from '@/domain/models/session';
import { SessionCard } from '@/features/grand-prix/components/session-card';

export interface SessionScheduleProps {
  sessions: Session[];
  now: number;
  reminderEnabledBySession: Record<string, boolean>;
  alarmEnabledBySession: Record<string, boolean>;
  calendarAddedBySession: Record<string, boolean>;
  onSelectSession: (session: Session) => void;
  onToggleReminder: (session: Session) => void;
  onToggleCalendar: (session: Session) => void;
}

export function SessionSchedule({
  sessions,
  now,
  reminderEnabledBySession,
  alarmEnabledBySession,
  calendarAddedBySession,
  onSelectSession,
  onToggleReminder,
  onToggleCalendar,
}: SessionScheduleProps) {
  return (
    <View className="gap-sm">
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          now={now}
          reminderEnabled={reminderEnabledBySession[session.id] ?? false}
          alarmEnabled={alarmEnabledBySession[session.id] ?? false}
          calendarAdded={calendarAddedBySession[session.id] ?? false}
          onPress={() => onSelectSession(session)}
          onToggleReminder={() => onToggleReminder(session)}
          onToggleCalendar={() => onToggleCalendar(session)}
        />
      ))}
    </View>
  );
}
