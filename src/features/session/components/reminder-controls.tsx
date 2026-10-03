import { Pressable, View } from 'react-native';
import { AppSwitch } from '@/components/app-primitives';
import { AppText } from '@/components/app-text';
import { REMINDER_LEAD_LABEL_KEYS, REMINDER_LEAD_OPTIONS, type ReminderLeadMinutes } from '@/domain/models/reminder-settings';
import type { SessionType } from '@/domain/models/session';
import { useTranslation } from '@/providers/i18n-provider';

export interface ReminderControlsProps {
  sessionType: SessionType;
  notificationsEnabled: boolean;
  alarmsEnabled: boolean;
  reminderEnabled: boolean;
  alarmEnabled: boolean;
  leads: number[];
  onToggleReminder: (value: boolean) => void;
  onToggleAlarm: (value: boolean) => void;
  onToggleLead: (lead: ReminderLeadMinutes, enabled: boolean) => void;
}

export function ReminderControls({
  notificationsEnabled,
  alarmsEnabled,
  reminderEnabled,
  alarmEnabled,
  leads,
  onToggleReminder,
  onToggleAlarm,
  onToggleLead,
}: ReminderControlsProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-md rounded-lg border border-border bg-surface p-lg">
      <View className="flex-row items-center justify-between">
        <AppText variant="bodyStrong">{t('session.reminder')}</AppText>
        <AppSwitch
          value={reminderEnabled}
          onValueChange={onToggleReminder}
          accessibilityLabel={t('session.reminder')}
          disabled={!notificationsEnabled}
        />
      </View>

      {!notificationsEnabled ? (
        <AppText variant="caption" tone="muted">
          {t('reminders.disabledHint')}
        </AppText>
      ) : (
        <View className="flex-row flex-wrap gap-sm">
          {REMINDER_LEAD_OPTIONS.map((lead) => {
            const active = leads.includes(lead);
            return (
              <Pressable
                key={lead}
                onPress={() => onToggleLead(lead, !active)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: active }}
                className={[
                  'rounded-full border px-md py-xs',
                  active ? 'border-accent bg-accent/15' : 'border-border bg-surfaceElevated',
                ].join(' ')}
              >
                <AppText variant="caption" tone={active ? 'accent' : 'secondary'}>
                  {t(REMINDER_LEAD_LABEL_KEYS[lead])}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      )}

      <View className="h-px w-full bg-divider" />

      <View className="flex-row items-center justify-between">
        <View className="flex-1 gap-xs">
          <AppText variant="bodyStrong">{t('session.alarm')}</AppText>
          <AppText variant="caption" tone="muted">
            {t('reminders.alarmLead')}
          </AppText>
        </View>
        <AppSwitch
          value={alarmEnabled}
          onValueChange={onToggleAlarm}
          accessibilityLabel={t('session.alarm')}
          disabled={!alarmsEnabled}
        />
      </View>
    </View>
  );
}
