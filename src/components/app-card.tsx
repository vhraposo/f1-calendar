import type { ReactNode } from 'react';
import { Pressable, View, type ViewProps } from 'react-native';

export interface AppCardProps extends ViewProps {
  children: ReactNode;
  className?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function AppCard({
  children,
  className,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  ...props
}: AppCardProps) {
  const classes = [
    'rounded-lg border border-border bg-surface p-lg',
    onPress ? 'active:bg-surfaceElevated' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        className={classes}
        {...props}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View className={classes} {...props}>
      {children}
    </View>
  );
}
