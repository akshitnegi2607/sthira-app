import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { SthiraBrandLogo } from '@/components/ui/SthiraBrandLogo';
import { useCalendarStore } from '@/stores/useCalendarStore';
import { DailyHistoryCalendarModal } from '@/features/calendar/components/DailyHistoryCalendarModal';

export default function TabsLayout() {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const openCalendar = useCalendarStore((s) => s.openCalendar);

  // Detect any mobile device on web (iPhone, iPad, Android) or native
  const isMobile =
    Platform.OS !== 'web' ||
    (typeof window !== 'undefined' &&
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

  const bottomPadding =
    insets.bottom > 0
      ? insets.bottom
      : isMobile
      ? 28
      : 8;

  const inactiveColor = isDark ? '#94A3B8' : '#64748B';

  return (
    <>
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
            height: 62 + bottomPadding,
            paddingBottom: bottomPadding,
            paddingTop: 8,
            elevation: 0,
          },
          tabBarItemStyle: {
            paddingVertical: 0,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 3,
          },
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => openCalendar()}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="calendar-outline" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => router.push('/settings')}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
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
              size={22}
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
              size={22}
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
              size={22}
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
              size={22}
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
              size={22}
              color={color || (focused ? colors.accent : inactiveColor)}
            />
          ),
        }}
      />
    </Tabs>
    <DailyHistoryCalendarModal />
  </>
  );
}

const styles = StyleSheet.create({
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
    gap: 4,
  },
  headerButton: {
    padding: 6,
    marginHorizontal: 2,
    borderRadius: 8,
  },
});

