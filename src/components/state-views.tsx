import { ActivityIndicator, View } from 'react-native';
import { AppText } from '@/components/app-text';
import { AppButton } from '@/components/app-button';
import { AppIcon, type IconName } from '@/design-system/icons';
import { colors } from '@/design-system/tokens';

export function LoadingState({ title }: { title: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-md">
      <ActivityIndicator size="large" color={colors.accent} />
      <AppText variant="body" tone="secondary">
        {title}
      </AppText>
    </View>
  );
}

export interface ErrorStateProps {
  title: string;
  body: string;
  retryLabel?: string;
  onRetry?: () => void;
}

export function ErrorState({ title, body, retryLabel, onRetry }: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-md px-xl">
      <AppIcon name="alert" size={32} color={colors.warning} />
      <AppText variant="title" className="text-center">
        {title}
      </AppText>
      <AppText variant="body" tone="secondary" className="text-center">
        {body}
      </AppText>
      {onRetry && retryLabel ? (
        <AppButton label={retryLabel} onPress={onRetry} variant="secondary" size="sm" icon="refresh" />
      ) : null}
    </View>
  );
}

export interface EmptyStateProps {
  icon?: IconName;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = 'flag', title, body, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-md px-xl">
      <AppIcon name={icon} size={32} color={colors.textMuted} />
      <AppText variant="title" className="text-center">
        {title}
      </AppText>
      <AppText variant="body" tone="secondary" className="text-center">
        {body}
      </AppText>
      {actionLabel && onAction ? (
        <AppButton label={actionLabel} onPress={onAction} variant="secondary" size="sm" />
      ) : null}
    </View>
  );
}

export function OfflineBanner({ message }: { message: string }) {
  return (
    <View className="flex-row items-center gap-sm rounded-md border border-warning/40 bg-warning/10 px-md py-sm">
      <AppIcon name="wifiOff" size={16} color={colors.warning} />
      <AppText variant="caption" tone="warning" className="flex-1">
        {message}
      </AppText>
    </View>
  );
}
