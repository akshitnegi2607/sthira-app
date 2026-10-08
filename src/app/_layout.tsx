import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { runMigrations } from '@/database/migrations';
import { useProfileStore } from '@/stores/useProfileStore';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { useAppTheme } from '@/hooks/use-theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { colors, isDark } = useAppTheme();
  const [dbReady, setDbReady] = useState(false);
  const loadProfile = useProfileStore((s) => s.loadProfile);
  const loadDashboard = useDashboardStore((s) => s.loadDashboard);

  useEffect(() => {
    async function prepare() {
      try {
        // Run SQLite migrations & initial data seeding
        runMigrations();
        loadProfile();
        loadDashboard();
      } catch (e) {
        console.error('Error during app database startup:', e);
      } finally {
        setDbReady(true);
        await SplashScreen.hideAsync().catch(() => {});
      }
    }

    prepare();
  }, [loadProfile, loadDashboard]);

  if (!dbReady) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>
          Setting up your personal coach...
        </Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: '700',
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="settings"
          options={{
            presentation: 'modal',
            title: 'Profile & Targets',
            headerBackTitle: 'Done',
          }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
});
