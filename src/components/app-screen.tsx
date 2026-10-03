import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

export interface AppScreenProps {
  children: ReactNode;
  scroll?: boolean;
  edges?: readonly Edge[];
  className?: string;
  contentClassName?: string;
  testID?: string;
}

export function AppScreen({
  children,
  scroll = false,
  edges = ['top', 'bottom'],
  className,
  contentClassName,
  testID,
}: AppScreenProps) {
  return (
    <SafeAreaView edges={edges} className={['flex-1 bg-background', className].filter(Boolean).join(' ')}>
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName={['px-lg pb-3xl pt-md', contentClassName].filter(Boolean).join(' ')}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          testID={testID}
        >
          {children}
        </ScrollView>
      ) : (
        <View
          className={['flex-1 px-lg', contentClassName].filter(Boolean).join(' ')}
          testID={testID}
        >
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}
