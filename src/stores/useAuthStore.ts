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

interface AuthState {
  accounts: UserAccount[];
  activeAccount: UserAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  initAuth: () => void;
  login: (accountId: string, pin: string) => { success: boolean; error?: string };
  logout: () => void;
  switchAccount: (accountId: string, pin: string) => { success: boolean; error?: string };
  updatePin: (accountId: string, newPin: string) => boolean;
  updateAccount: (accountId: string, updates: Partial<UserAccount>) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accounts: [],
  activeAccount: null,
  isAuthenticated: false,
  isLoading: false,

  initAuth: () => {
    AuthService.init();
    const accounts = AuthService.getAccounts();
    const active = AuthService.getActiveAccount();
    set({
      accounts,
      activeAccount: active,
      isAuthenticated: active !== null,
    });
  },

  login: (accountId: string, pin: string) => {
    set({ isLoading: true });
    const result = AuthService.login(accountId, pin);
    if (result.success && result.account) {
      set({
        activeAccount: result.account,
        isAuthenticated: true,
        isLoading: false,
        accounts: AuthService.getAccounts(),
      });
      reloadActiveUserStores();
      return { success: true };
    }
    set({ isLoading: false });
    return { success: false, error: result.error || 'Authentication failed' };
  },

  logout: () => {
    AuthService.logout();
    set({
      activeAccount: null,
      isAuthenticated: false,
    });
  },

  switchAccount: (accountId: string, pin: string) => {
    return get().login(accountId, pin);
  },

  updatePin: (accountId: string, newPin: string) => {
    const success = AuthService.updateAccountPin(accountId, newPin);
    if (success) {
      const accounts = AuthService.getAccounts();
      const active = AuthService.getActiveAccount();
      set({ accounts, activeAccount: active });
    }
    return success;
  },

  updateAccount: (accountId: string, updates: Partial<UserAccount>) => {
    const success = AuthService.updateAccount(accountId, updates);
    if (success) {
      const accounts = AuthService.getAccounts();
      const active = AuthService.getActiveAccount();
      set({ accounts, activeAccount: active });
    }
    return success;
  },
}));
