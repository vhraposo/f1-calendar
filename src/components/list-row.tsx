import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from '@/components/app-text';
import { AppIcon, type IconName } from '@/design-system/icons';
import { colors } from '@/design-system/tokens';

export interface ListRowProps {
  title: string;
  subtitle?: string;
  icon?: IconName;
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function ListRow({
  title,
  subtitle,
  icon,
  leading,
  trailing,
  onPress,
  accessibilityLabel,
  accessibilityHint,
}: ListRowProps) {
  const content = (
    <View className="flex-row items-center gap-md py-md">
      {leading ?? (icon ? <AppIcon name={icon} size={20} color={colors.textSecondary} /> : null)}
      <View className="flex-1 gap-xs">
        <AppText variant="bodyStrong">{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" tone="secondary">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {trailing ?? (onPress ? <AppIcon name="chevronRight" size={18} color={colors.textMuted} /> : null)}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityHint={accessibilityHint}
        className="active:opacity-80"
      >
        {content}
      </Pressable>
    );
  }
  return content;
}
