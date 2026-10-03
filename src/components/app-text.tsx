import { Text, type TextProps } from 'react-native';

export type TextVariant =
  | 'display'
  | 'headline'
  | 'title'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'label'
  | 'mono';

export type TextTone = 'primary' | 'secondary' | 'muted' | 'accent' | 'success' | 'warning' | 'danger';

const VARIANT_CLASSES: Record<TextVariant, string> = {
  display: 'text-display',
  headline: 'text-headline',
  title: 'text-title',
  body: 'text-body',
  bodyStrong: 'text-bodyStrong',
  caption: 'text-caption',
  label: 'text-caption uppercase tracking-[2px]',
  mono: 'text-body font-mono',
};

const TONE_CLASSES: Record<TextTone, string> = {
  primary: 'text-textPrimary',
  secondary: 'text-textSecondary',
  muted: 'text-textMuted',
  accent: 'text-accent',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  tone?: TextTone;
  className?: string;
}

export function AppText({
  variant = 'body',
  tone = 'primary',
  className,
  ...props
}: AppTextProps) {
  const classes = [VARIANT_CLASSES[variant], TONE_CLASSES[tone], className]
    .filter(Boolean)
    .join(' ');
  return <Text className={classes} {...props} />;
}
