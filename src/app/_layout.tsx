import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { runMigrations } from '@/database/migrations';
import { setActiveDatabase } from '@/database/db';
import { useProfileStore } from '@/stores/useProfileStore';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { LoginScreen } from '@/features/auth/components/LoginScreen';
import { useAppTheme } from '@/hooks/use-theme';
import { NarayanaEntryScreen } from '@/components/ui/NarayanaEntryScreen';
import { NarayanaAppBackground } from '@/components/ui/NarayanaAppBackground';
import { isSupabaseConfigured } from '@/services/supabaseClient';
import { SupabaseSyncService } from '@/services/supabaseSyncService';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { colors, isDark } = useAppTheme();
  const [dbReady, setDbReady] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  const initAuth = useAuthStore((s) => s.initAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loadProfile = useProfileStore((s) => s.loadProfile);
  const loadDashboard = useDashboardStore((s) => s.loadDashboard);

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize multi-user authentication & mount active user database
        initAuth();
        const active = useAuthStore.getState().activeAccount;

        if (active) {
          setActiveDatabase(active.dbName, active.webStorageKey);
          runMigrations({
            name: active.displayName,
            current_weight: active.initialWeight,
            target_weight: active.targetWeight,
          });
          loadProfile();
          loadDashboard();
        } else {
          // If no active session, ensure master db initialized
          runMigrations();
        }

        // Background non-blocking sync with Supabase if configured
        if (isSupabaseConfigured()) {
          SupabaseSyncService.syncAll().catch((err) => {
            console.warn('[Startup] Supabase background sync failed:', err);
          });
        }
      } catch (e) {
        console.error('Error during app database startup:', e);
      } finally {
        setDbReady(true);
        await SplashScreen.hideAsync().catch(() => {});
      }
    }

    prepare();
  }, [initAuth, loadProfile, loadDashboard]);

  // If user is logged out, render the LoginScreen
  if (dbReady && !isAuthenticated) {
    return (
      <SafeAreaProvider style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.rootContainer, { backgroundColor: colors.background }]}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <NarayanaAppBackground />
          <LoginScreen />

          {/* Sacred App Entry Screen on initial cold start */}
          {!hasEntered && (
            <View style={StyleSheet.absoluteFill}>
              <NarayanaEntryScreen
                isReady={dbReady}
                onReadyToEnter={() => setHasEntered(true)}
              />
            </View>
          )}
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.rootContainer, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        {/* Faint ambient presence of Lord Narayana everywhere in background */}
        <NarayanaAppBackground />

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
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
});
