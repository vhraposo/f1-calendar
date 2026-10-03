import { useCallback, useState } from 'react';
import { AppState, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { AppText, type TextVariant } from '@/components/app-text';
import { computeCountdown, formatCountdownCompact } from '@/core/time/countdown';
import { animation } from '@/design-system/tokens';

export interface CountdownProps {
  targetAt: string;
  variant?: TextVariant;
  className?: string;
  accessibilityLabel?: string;
}

export function Countdown({ targetAt, variant = 'display', className, accessibilityLabel }: CountdownProps) {
  const [now, setNow] = useState(() => Date.now());

  useFocusEffect(
    useCallback(() => {
      setNow(Date.now());
      const interval = setInterval(() => setNow(Date.now()), animation.countdownTick);
      const subscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          setNow(Date.now());
        }
      });
      return () => {
        clearInterval(interval);
        subscription.remove();
      };
    }, []),
  );

  const parts = computeCountdown(targetAt, now);

  return (
    <View accessible accessibilityRole="timer" accessibilityLabel={accessibilityLabel}>
      <AppText variant={variant} className={className}>
        {formatCountdownCompact(parts)}
      </AppText>
    </View>
  );
}
