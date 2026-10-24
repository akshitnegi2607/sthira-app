import { create } from 'zustand';
import { DailyLog, WorkoutPlan, WorkoutSession, Goals, UserProfile } from '@/types/database';
import { DailyLogsRepository } from '@/database/repositories/dailyLogsRepository';
import { ExerciseRepository } from '@/database/repositories/exerciseRepository';
import { WorkoutRepository, PopulatedSession } from '@/database/repositories/workoutRepository';
import { MealRepository } from '@/database/repositories/mealRepository';
import { ProfileRepository } from '@/database/repositories/profileRepository';
import { ProgressRepository } from '@/database/repositories/progressRepository';
import { getTodayDateString, shiftDateString } from '@/utils/date';
import { SupabaseSyncService } from '@/services/supabaseSyncService';
import { isSupabaseConfigured } from '@/services/supabaseClient';
import { getDatabase } from '@/database/db';
import {
  generateDynamicDailyCoachGuidance,
  DynamicDailyCoachGuidance,
  MealSuggestion,
  getTimeOfDayBracket,
} from '@/services/dailyCoachingEngine';
import { useNutritionStore } from './useNutritionStore';

interface DashboardState {
  todayLog: DailyLog;
  todayPlan: WorkoutPlan | null;
  activeSession: PopulatedSession | null;
  todayCompletedSession: WorkoutSession | null;
  yesterdayLog: DailyLog | null;
  yesterdaySession: WorkoutSession | null;
  coachGuidance: DynamicDailyCoachGuidance | null;
  isLoading: boolean;
  loadDashboard: () => void;
  updateLog: (updates: Partial<DailyLog>) => void;
  quickAddWater: (amountLiters: number) => void;
  quickLogWeight: (weightKg: number) => void;
  logSuggestedMeal: (meal: MealSuggestion) => Promise<void>;
}

const fallbackDate = getTodayDateString();

const initialLog: DailyLog = {
  id: `log_${fallbackDate}`,
  date: fallbackDate,
  calories_consumed: 0,
  protein_consumed: 0,
  carbs_consumed: 0,
  fat_consumed: 0,
  water_liters: 0,
  weight: null,
  sleep_hours: null,
  energy_rating: null,
  mood_rating: null,
  hunger_rating: null,
  recovery_rating: null,
  soreness_rating: null,
  stress_rating: null,
  coach_status: 'ON TRACK',
  coach_summary: 'Starting your day. Fuel up and stay hydrated!',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  todayLog: initialLog,
  todayPlan: null,
  activeSession: null,
  todayCompletedSession: null,
  yesterdayLog: null,
  yesterdaySession: null,
  coachGuidance: null,
  isLoading: false,

  loadDashboard: () => {
    try {
      const todayStr = getTodayDateString();
      const yesterdayStr = shiftDateString(todayStr, -1);

      try {
        MealRepository.syncDailyLogTotals(todayStr);
      } catch (e) {
        // silent sync guard
      }
      const log = DailyLogsRepository.getTodayLog();
      const yesterdayLog = DailyLogsRepository.getLogByDate(yesterdayStr);
      const plan = ExerciseRepository.getTodayPlan();
      const activeSession = WorkoutRepository.getActiveSession();
      const history = WorkoutRepository.getCompletedHistory(10);
      const todayCompletedSession = history.find((h) => h.date === todayStr) || null;
      const yesterdaySession = history.find((h) => h.date === yesterdayStr) || null;
      const mealsToday = MealRepository.getMealsByDate(todayStr);

      const goals = ProfileRepository.getGoals();
      const profile = ProfileRepository.getProfile();
      let coachGuidance: DynamicDailyCoachGuidance | null = null;

      if (goals && profile) {
        coachGuidance = generateDynamicDailyCoachGuidance({
          todayLog: log,
          yesterdayLog,
          yesterdaySession,
          goals,
          profile,
          todayPlanTitle: plan?.name,
          isTodayWorkoutCompleted: !!todayCompletedSession,
          mealsLoggedCount: mealsToday.length,
        });

        // Update log coach summary with dynamic guidance headline/narrative
        log.coach_summary = coachGuidance.motivationalNarrative;
        log.coach_status = coachGuidance.statusBadge;
      }

      set({
        todayLog: { ...log },
        todayPlan: plan ? { ...plan } : null,
        activeSession,
        todayCompletedSession,
        yesterdayLog,
        yesterdaySession,
        coachGuidance,
        isLoading: false,
      });
    } catch (e) {
      console.warn('Failed to load dashboard from SQLite, using initial fallback', e);
      set({ todayLog: initialLog, isLoading: false });
    }
  },

  updateLog: (updates) => {
    const todayStr = get().todayLog.date;
    try {
      DailyLogsRepository.updateDailyLog(todayStr, updates);
      const updated = DailyLogsRepository.getTodayLog();
      set({ todayLog: { ...updated } });
    } catch (e) {
      console.error('Failed to update log', e);
      set((state) => ({ todayLog: { ...state.todayLog, ...updates } }));
    }
  },

  quickAddWater: (amountLiters) => {
    const todayStr = getTodayDateString();
    try {
      const updatedLog = DailyLogsRepository.logWater(todayStr, Number(amountLiters));
      set({ todayLog: { ...updatedLog } });
    } catch (e) {
      console.error('Failed to log water:', e);
      const current = Number(get().todayLog.water_liters) || 0;
      const newAmount = Math.round((current + Number(amountLiters)) * 10) / 10;
      get().updateLog({ water_liters: newAmount });
    }
    try {
      useNutritionStore.getState().loadNutritionData(todayStr);
    } catch {}
    try {
      if (isSupabaseConfigured()) {
        SupabaseSyncService.syncAll().catch(() => {});
      }
    } catch {}
  },

  quickLogWeight: (weightKg) => {
    const rounded = Math.round(Number(weightKg) * 10) / 10;
    const todayStr = getTodayDateString();
    try {
      ProgressRepository.logWeight(rounded, todayStr);
    } catch (e) {
      console.warn('Failed to persist weight in ProgressRepository:', e);
    }
    get().updateLog({ weight: rounded });
    try {
      ProfileRepository.updateProfile({ current_weight: rounded });
    } catch {}
    try {
      if (isSupabaseConfigured()) {
        SupabaseSyncService.syncAll().catch(() => {});
      }
    } catch {}
  },

  logSuggestedMeal: async (meal: MealSuggestion) => {
    try {
      const todayStr = getTodayDateString();
      const timeOfDay = getTimeOfDayBracket();
      let mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'lunch';
      if (timeOfDay === 'morning') mealType = 'breakfast';
      else if (timeOfDay === 'afternoon') mealType = 'lunch';
      else if (timeOfDay === 'evening') mealType = 'dinner';
      else mealType = 'snack';

      MealRepository.createMeal(
        {
          date: todayStr,
          meal_type: mealType,
          raw_text: `${meal.name} (${meal.portion})`,
          total_calories: meal.calories,
          total_protein: meal.protein,
          total_carbs: meal.carbs,
          total_fat: meal.fat,
          confidence: 'high',
          is_verified_by_user: 1,
        },
        [
          {
            food_name: meal.name,
            quantity: 1,
            unit: 'portion',
            calories_estimated: meal.calories,
            protein_estimated: meal.protein,
            carbs_estimated: meal.carbs,
            fat_estimated: meal.fat,
            confidence_score: 'high',
            clarification_needed: 0,
          },
        ]
      );

      get().loadDashboard();

      if (isSupabaseConfigured()) {
        SupabaseSyncService.syncAll().catch(() => {});
      }
    } catch (e) {
      console.error('Failed to log suggested meal', e);
    }
  },
}));
