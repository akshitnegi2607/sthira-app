import { create } from 'zustand';
import { UserAccount } from '@/types/auth';
import { AuthService } from '@/services/authService';
import { useProfileStore } from './useProfileStore';
import { useDashboardStore } from './useDashboardStore';
import { useWorkoutStore } from './useWorkoutStore';
import { useNutritionStore } from './useNutritionStore';
import { useProgressStore } from './useProgressStore';
import { useJournalStore } from './useJournalStore';
import { useCalendarStore } from './useCalendarStore';
import { getTodayDateString } from '@/utils/date';
import { setOnSyncCompleteCallback } from '@/services/supabaseSyncService';

/**
 * Reloads all application stores to reflect the newly active user's SQLite database.
 */
export function reloadActiveUserStores() {
  const today = getTodayDateString();
  try {
    useProfileStore.getState().loadProfile();
  } catch (e) {
    console.warn('Failed to reload ProfileStore on user switch', e);
  }

  try {
    useDashboardStore.getState().loadDashboard();
  } catch (e) {
    console.warn('Failed to reload DashboardStore on user switch', e);
  }

  try {
    useWorkoutStore.getState().loadData();
  } catch (e) {
    console.warn('Failed to reload WorkoutStore on user switch', e);
  }

  try {
    useNutritionStore.getState().loadNutritionData(today);
  } catch (e) {
    console.warn('Failed to reload NutritionStore on user switch', e);
  }

  try {
    useProgressStore.getState().loadProgressData();
  } catch (e) {
    console.warn('Failed to reload ProgressStore on user switch', e);
  }

  try {
    useJournalStore.getState().loadJournalData(today);
  } catch (e) {
    console.warn('Failed to reload JournalStore on user switch', e);
  }

  try {
    useCalendarStore.getState().setSelectedDate(today);
  } catch (e) {
    console.warn('Failed to reload CalendarStore on user switch', e);
  }
}

setOnSyncCompleteCallback(reloadActiveUserStores);

interface AuthState {
  activeAccount: UserAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  initAuth: () => void;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  activeAccount: null,
  isAuthenticated: false,
  isLoading: false,

  initAuth: () => {
    AuthService.init();
    const active = AuthService.getActiveAccount();
    set({
      activeAccount: active,
      isAuthenticated: active !== null,
    });
  },

  login: (username: string, password: string) => {
    set({ isLoading: true });
    const result = AuthService.login(username, password);
    if (result.success && result.account) {
      set({
        activeAccount: result.account,
        isAuthenticated: true,
        isLoading: false,
      });
      reloadActiveUserStores();
      return { success: true };
    }
    set({ isLoading: false });
    return { success: false, error: result.error || 'Invalid credentials' };
  },

  logout: () => {
    AuthService.logout();
    set({
      activeAccount: null,
      isAuthenticated: false,
    });
  },
}));
