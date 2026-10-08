import { create } from 'zustand';
import { DailyLog, WorkoutPlan } from '@/types/database';
import { DailyLogsRepository } from '@/database/repositories/dailyLogsRepository';
import { ExerciseRepository } from '@/database/repositories/exerciseRepository';

interface DashboardState {
  todayLog: DailyLog;
  todayPlan: WorkoutPlan | null;
  isLoading: boolean;
  loadDashboard: () => void;
  updateLog: (updates: Partial<DailyLog>) => void;
  quickAddWater: (amountLiters: number) => void;
  quickLogWeight: (weightKg: number) => void;
}

const fallbackDate = new Date().toISOString().split('T')[0];

const initialLog: DailyLog = {
  id: `log_${fallbackDate}`,
  date: fallbackDate,
  calories_consumed: 2320,
  protein_consumed: 114,
  carbs_consumed: 290,
  fat_consumed: 68,
  water_liters: 1.9,
  weight: 64.2,
  sleep_hours: 7.25,
  energy_rating: 8,
  mood_rating: 8,
  hunger_rating: 5,
  recovery_rating: 8,
  soreness_rating: 3,
  stress_rating: 3,
  coach_status: 'ON TRACK',
  coach_summary:
    "You're on track today. Calories are slightly below target (2,320 / 2,450 kcal) but very reasonable. Protein target is almost achieved (114 / 120 g). You completed today's Upper Body A session. Hydration is at 1.9L / 2.5L. If comfortably full, no need to force meals; a small snack like banana + peanut butter can close the calorie gap.",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  todayLog: initialLog,
  todayPlan: null,
  isLoading: false,

  loadDashboard: () => {
    try {
      const log = DailyLogsRepository.getTodayLog();
      const plan = ExerciseRepository.getTodayPlan();
      set({ todayLog: log, todayPlan: plan });
    } catch (e) {
      console.warn('Failed to load dashboard from SQLite, using initial fallback', e);
      set({ todayLog: initialLog });
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
