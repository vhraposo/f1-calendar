import type { ReactNode } from 'react';
import { Switch, View } from 'react-native';
import { AppText, type TextTone } from '@/components/app-text';
import { AppIcon, type IconName } from '@/design-system/icons';
import { colors } from '@/design-system/tokens';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

const BADGE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-surfaceMuted',
  accent: 'bg-accent/15 border border-accent/40',
  success: 'bg-success/15 border border-success/40',
  warning: 'bg-warning/15 border border-warning/40',
  danger: 'bg-danger/15 border border-danger/40',
};

const BADGE_TEXT_TONES: Record<BadgeTone, TextTone> = {
  neutral: 'secondary',
  accent: 'accent',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
};

export function AppBadge({ label, tone = 'neutral' }: { label: string; tone?: BadgeTone }) {
  return (
    <View className={`self-start rounded-full px-md py-xs ${BADGE_CLASSES[tone]}`}>
      <AppText variant="caption" tone={BADGE_TEXT_TONES[tone]}>
        {label}
      </AppText>
    </View>
  );
}

export function AppDivider({ className }: { className?: string }) {
  return <View className={['h-px w-full bg-divider', className].filter(Boolean).join(' ')} />;
}

export interface AppSectionProps {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AppSection({ title, action, children, className }: AppSectionProps) {
  return (
    <View className={['gap-md', className].filter(Boolean).join(' ')}>
      {title || action ? (
        <View className="flex-row items-center justify-between">
          {title ? (
            <AppText variant="label" tone="secondary">
              {title}
            </AppText>
          ) : (
            <View />
          )}
          {action}
        </View>
      ) : null}
      {children}
    </View>
  );
}

export interface AppSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
  disabled?: boolean;
}

export function AppSwitch({ value, onValueChange, accessibilityLabel, disabled }: AppSwitchProps) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      trackColor={{ false: colors.surfaceMuted, true: colors.accentMuted }}
      thumbColor={value ? colors.accent : colors.textMuted}
      ios_backgroundColor={colors.surfaceMuted}
    />
  );
}

export interface InfoRowProps {
  icon: IconName;
  label: string;
  value: string;
}

export function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View className="flex-row items-center justify-between py-sm">
      <View className="flex-row items-center gap-sm">
        <AppIcon name={icon} size={16} color={colors.textMuted} />
        <AppText variant="caption" tone="secondary">
          {label}
        </AppText>
      </View>
      <AppText variant="caption" tone="primary">
        {value}
      </AppText>
    </View>
  );
}
