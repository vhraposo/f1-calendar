import { useEffect } from 'react';
import { View } from 'react-native';
import { Redirect, Stack, router, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoadingState } from '@/components/state-views';
import { colors } from '@/design-system/tokens';
import { I18nProvider } from '@/providers/i18n-provider';
import { PreferencesProvider, usePreferences } from '@/providers/preferences-provider';
import { ServicesProvider } from '@/providers/services-provider';
import { SyncProvider } from '@/providers/sync-provider';
import { registerBackgroundSync } from '@/providers/background-sync-task';
import '../global.css';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function useNotificationDeepLinks() {
  useEffect(() => {
    function redirect(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url;
      if (typeof url === 'string') {
        router.push(url as never);
      }
    }

    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse?.notification) {
      redirect(lastResponse.notification);
    }

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      redirect(response.notification);
    });
    return () => subscription.remove();
  }, []);
}

function RootNavigator() {
  const { preferences, isLoaded } = usePreferences();
  const pathname = usePathname();
  useNotificationDeepLinks();

  useEffect(() => {
    if (isLoaded && preferences.onboardingCompleted) {
      void registerBackgroundSync();
    }
  }, [isLoaded, preferences.onboardingCompleted]);

  if (!isLoaded) {
    return (
      <View className="flex-1 bg-background">
        <LoadingState title="" />
      </View>
    );
  }

  if (!preferences.onboardingCompleted && pathname !== '/onboarding') {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
      <Stack.Screen name="grand-prix/[id]" />
      <Stack.Screen name="session/[id]" />
      <Stack.Screen name="seasons/[year]" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ServicesProvider>
          <PreferencesProvider>
            <I18nProvider>
              <SyncProvider>
                <StatusBar style="light" />
                <RootNavigator />
              </SyncProvider>
            </I18nProvider>
          </PreferencesProvider>
        </ServicesProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
