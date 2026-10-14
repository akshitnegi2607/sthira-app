import { create } from 'zustand';
import { DailyLog, WorkoutPlan, WorkoutSession } from '@/types/database';
import { DailyLogsRepository } from '@/database/repositories/dailyLogsRepository';
import { ExerciseRepository } from '@/database/repositories/exerciseRepository';
import { WorkoutRepository, PopulatedSession } from '@/database/repositories/workoutRepository';
import { MealRepository } from '@/database/repositories/mealRepository';
import { getTodayDateString } from '@/utils/date';

interface DashboardState {
  todayLog: DailyLog;
  todayPlan: WorkoutPlan | null;
  activeSession: PopulatedSession | null;
  todayCompletedSession: WorkoutSession | null;
  isLoading: boolean;
  loadDashboard: () => void;
  updateLog: (updates: Partial<DailyLog>) => void;
  quickAddWater: (amountLiters: number) => void;
  quickLogWeight: (weightKg: number) => void;
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
  isLoading: false,

  loadDashboard: () => {
    try {
      const todayStr = getTodayDateString();
      try {
        MealRepository.syncDailyLogTotals(todayStr);
      } catch (e) {
        // silent sync guard
      }
      const log = DailyLogsRepository.getTodayLog();
      const plan = ExerciseRepository.getTodayPlan();
      const activeSession = WorkoutRepository.getActiveSession();
      const history = WorkoutRepository.getCompletedHistory(5);
      const todayCompletedSession = history.find((h) => h.date === todayStr) || null;

      // Dynamic coach summary if not set or empty
      if (!log.coach_summary || log.coach_summary.includes('2,320 / 2,450')) {
        let summary = 'Starting your day. Log your meals, hydration, and training to receive guidance.';
        if (log.calories_consumed > 0) {
          summary = `Logged ${log.calories_consumed} kcal and ${log.protein_consumed}g protein so far. Stay hydrated and keep steady!`;
        }
        log.coach_summary = summary;
      }

      set({
        todayLog: log,
        todayPlan: plan,
        activeSession,
        todayCompletedSession,
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
      set({ todayLog: updated });
    } catch (e) {
      console.error('Failed to update log', e);
      set((state) => ({ todayLog: { ...state.todayLog, ...updates } }));
    }
  },

  quickAddWater: (amountLiters) => {
    const current = get().todayLog.water_liters;
    const newAmount = Math.round((current + amountLiters) * 10) / 10;
    get().updateLog({ water_liters: newAmount });
  },

  quickLogWeight: (weightKg) => {
    get().updateLog({ weight: weightKg });
  },
}));
