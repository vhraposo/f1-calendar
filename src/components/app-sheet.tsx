import type { ReactNode } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/app-text';
import { AppIconButton } from '@/components/app-button';
import { AppDivider } from '@/components/app-primitives';

export interface AppSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  closeAccessibilityLabel: string;
}

export function AppSheet({ visible, title, onClose, children, closeAccessibilityLabel }: AppSheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-overlay">
        <Pressable className="flex-1" onPress={onClose} accessibilityLabel={closeAccessibilityLabel} />
        <View
          className="rounded-t-xl border border-border bg-surfaceElevated px-lg pt-lg"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <View className="flex-row items-center justify-between pb-md">
            <AppText variant="title">{title}</AppText>
            <AppIconButton icon="close" onPress={onClose} accessibilityLabel={closeAccessibilityLabel} />
          </View>
          <AppDivider />
          <View className="pt-md">{children}</View>
        </View>
      </View>
    </Modal>
  );
}
