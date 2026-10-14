import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { SthiraBrandLogo } from '@/components/ui/SthiraBrandLogo';

export default function TabsLayout() {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Detect iOS PWA standalone mode (Add to Home Screen) vs standard Safari browser
  const isStandalonePWA =
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    (Boolean((window.navigator as any)?.standalone) ||
      Boolean(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches));

  const bottomPadding =
    insets.bottom > 0
      ? insets.bottom
      : Platform.OS === 'ios'
      ? 28
      : isStandalonePWA
      ? 30
      : 8;

  const inactiveColor = isDark ? '#94A3B8' : '#64748B';

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        sceneStyle: {
          backgroundColor: colors.background,
        },
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.cardBorder,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '700',
          fontSize: 18,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          height: 56 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 6,
          elevation: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        headerRight: () => (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push('/settings')}
            activeOpacity={0.7}>
            <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: () => <SthiraBrandLogo size="small" />,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color || (focused ? colors.accent : inactiveColor)}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrition',
          headerTitle: 'Daily Nutrition',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'restaurant' : 'restaurant-outline'}
              size={24}
              color={color || (focused ? colors.accent : inactiveColor)}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
          headerTitle: 'Workout & Training',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'barbell' : 'barbell-outline'}
              size={24}
              color={color || (focused ? colors.accent : inactiveColor)}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          headerTitle: 'Health Trends',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'trending-up' : 'trending-up-outline'}
              size={24}
              color={color || (focused ? colors.accent : inactiveColor)}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          headerTitle: 'Daily Journal',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'book' : 'book-outline'}
              size={24}
              color={color || (focused ? colors.accent : inactiveColor)}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    marginRight: 16,
    padding: 4,
  },
});
