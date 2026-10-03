import { View } from 'react-native';
import { AppText } from '@/components/app-text';
import { AppIcon } from '@/design-system/icons';
import { colors } from '@/design-system/tokens';

export interface CountryFlagProps {
  countryCode: string | null | undefined;
  size?: number;
  accessibilityLabel?: string;
}

const REGIONAL_INDICATOR_A = 0x1f1e6;
const LETTER_A = 65;

function toFlagEmoji(countryCode: string): string | null {
  const upper = countryCode.toUpperCase();
  if (!/^[A-Z]{2}$/.test(upper)) {
    return null;
  }
  return String.fromCodePoint(
    ...[...upper].map((char) => REGIONAL_INDICATOR_A + char.charCodeAt(0) - LETTER_A),
  );
}

export function CountryFlag({ countryCode, size = 20, accessibilityLabel }: CountryFlagProps) {
  const emoji = countryCode ? toFlagEmoji(countryCode) : null;
  if (!emoji) {
    return (
      <View accessible accessibilityLabel={accessibilityLabel}>
        <AppIcon name="globe" size={size} color={colors.textMuted} />
      </View>
    );
  }
  return (
    <AppText
      accessible
      accessibilityLabel={accessibilityLabel}
      style={{ fontSize: size, lineHeight: size * 1.15 }}
    >
      {emoji}
    </AppText>
  );
}
