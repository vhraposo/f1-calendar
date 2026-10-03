import { Tabs } from 'expo-router';
import { AppIcon } from '@/design-system/icons';
import { colors } from '@/design-system/tokens';
import { useTranslation } from '@/providers/i18n-provider';

export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color }) => <AppIcon name="timer" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t('tabs.calendar'),
          tabBarIcon: ({ color }) => <AppIcon name="calendarCheck" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="seasons"
        options={{
          title: t('tabs.seasons'),
          tabBarIcon: ({ color }) => <AppIcon name="globe" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color }) => <AppIcon name="settings" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
