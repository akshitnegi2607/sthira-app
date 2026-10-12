import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { runMigrations } from '@/database/migrations';
import { useProfileStore } from '@/stores/useProfileStore';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { useAppTheme } from '@/hooks/use-theme';
import { NarayanaEntryScreen } from '@/components/ui/NarayanaEntryScreen';
import { NarayanaAppBackground } from '@/components/ui/NarayanaAppBackground';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { colors, isDark } = useAppTheme();
  const [dbReady, setDbReady] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
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

  return (
    <View style={[styles.rootContainer, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {/* Faint ambient presence of Lord Narayana everywhere in background */}
      <NarayanaAppBackground />

      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: '700',
          },
          contentStyle: {
            backgroundColor: 'transparent',
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

      {/* Sacred App Entry Screen rendered as top overlay during startup */}
      {!hasEntered && (
        <View style={StyleSheet.absoluteFill}>
          <NarayanaEntryScreen
            isReady={dbReady}
            onReadyToEnter={() => setHasEntered(true)}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
});
