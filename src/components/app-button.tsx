import { ActivityIndicator, Pressable } from 'react-native';
import { AppText } from '@/components/app-text';
import { AppIcon, type IconName } from '@/design-system/icons';
import { colors } from '@/design-system/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'sm';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-accent active:bg-accentStrong',
  secondary: 'bg-surfaceElevated border border-border active:bg-surfaceMuted',
  ghost: 'bg-transparent active:bg-surfaceMuted',
  danger: 'bg-danger/15 border border-danger/40 active:bg-danger/25',
};

const TEXT_TONES: Record<ButtonVariant, 'primary' | 'secondary' | 'accent' | 'danger'> = {
  primary: 'primary',
  secondary: 'primary',
  ghost: 'secondary',
  danger: 'danger',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: 'h-12 px-xl',
  sm: 'h-9 px-lg',
};

export interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  className?: string;
  testID?: string;
}

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  className,
  testID,
}: AppButtonProps) {
  const isDisabled = disabled || loading;
  const classes = [
    'flex-row items-center justify-center gap-sm rounded-full',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    isDisabled ? 'opacity-50' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const iconColor = variant === 'primary' ? colors.white : colors.textPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      className={classes}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <>
          {icon ? <AppIcon name={icon} size={size === 'sm' ? 15 : 18} color={iconColor} /> : null}
          <AppText variant="bodyStrong" tone={TEXT_TONES[variant]}>
            {label}
          </AppText>
        </>
      )}
    </Pressable>
  );
}

export interface AppIconButtonProps {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  size?: number;
  disabled?: boolean;
  className?: string;
  testID?: string;
}

export function AppIconButton({
  icon,
  onPress,
  accessibilityLabel,
  size = 20,
  disabled = false,
  className,
  testID,
}: AppIconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      hitSlop={8}
      className={[
        'h-11 w-11 items-center justify-center rounded-full bg-surfaceElevated active:bg-surfaceMuted',
        disabled ? 'opacity-50' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      testID={testID}
    >
      <AppIcon name={icon} size={size} color={colors.textPrimary} />
    </Pressable>
  );
}

export interface ToggleButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
  icon: IconName;
  accessibilityLabel: string;
}

export function AppToggleButton({ label, active, onPress, icon, accessibilityLabel }: ToggleButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="switch"
      accessibilityState={{ checked: active }}
      accessibilityLabel={accessibilityLabel}
      className={[
        'flex-1 flex-row items-center justify-center gap-sm rounded-md border px-md py-sm',
        active ? 'border-accent bg-accent/15' : 'border-border bg-surfaceElevated',
      ].join(' ')}
    >
      <AppIcon name={icon} size={16} color={active ? colors.accentStrong : colors.textSecondary} />
      <AppText variant="caption" tone={active ? 'primary' : 'secondary'}>
        {label}
      </AppText>
    </Pressable>
  );
}
