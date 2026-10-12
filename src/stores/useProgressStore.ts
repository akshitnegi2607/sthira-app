/**
 * Sthira — Progress & Analytics Store
 * State management for weight trends, EMA smoothing, calorie adaptation,
 * sleep/workout correlations, and lean bulk trajectory modeling.
 */

import { create } from 'zustand';
import {
  WeightEntry,
  Goals,
  UserProfile,
} from '../types/database';
import {
  calculateWeightEma,
  calculateWeeklyGainRate,
  calculateCalorieAdaptation,
  correlateSleepAndWorkout,
  calculateLeanBulkTrajectory,
  EmaWeightPoint,
  CalorieAdaptationResult,
  SleepWorkoutCorrelationResult,
  LeanBulkTrajectoryResult,
  WeightDataPoint,
} from '../services/progressAnalytics';
import { ProgressRepository } from '../database/repositories/progressRepository';
import { ProfileRepository } from '../database/repositories/profileRepository';
import { useProfileStore } from './useProfileStore';
import { useDashboardStore } from './useDashboardStore';

export type ProgressTimeframe = '7d' | '30d' | '90d' | 'all';

interface ProgressState {
  timeframe: ProgressTimeframe;
  weightHistory: WeightEntry[];
  emaSeries: EmaWeightPoint[];
  weeklyGainRate: number;
  calorieAdaptation: CalorieAdaptationResult | null;
  sleepCorrelation: SleepWorkoutCorrelationResult | null;
  leanBulkTrajectory: LeanBulkTrajectoryResult | null;
  isLogWeightModalVisible: boolean;
  isLoading: boolean;

  // Key summary numbers
  currentWeight: number;
  currentEmaWeight: number;
  startWeight: number;
  targetWeight: number;
  currentCalorieTarget: number;

  // Actions
  loadProgressData: () => void;
  setTimeframe: (tf: ProgressTimeframe) => void;
  logScaleWeight: (weightKg: number, dateStr?: string, notes?: string) => Promise<void>;
  deleteWeightEntry: (id: string) => Promise<void>;
  applyCalorieAdjustment: (deltaKcal: number) => Promise<void>;
  setLogWeightModalVisible: (visible: boolean) => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  timeframe: '30d',
  weightHistory: [],
  emaSeries: [],
  weeklyGainRate: 0,
  calorieAdaptation: null,
  sleepCorrelation: null,
  leanBulkTrajectory: null,
  isLogWeightModalVisible: false,
  isLoading: false,

  currentWeight: 65.8,
  currentEmaWeight: 65.8,
  startWeight: 65.8,
  targetWeight: 67.0,
  currentCalorieTarget: 2450,

  loadProgressData: () => {
    try {
      set({ isLoading: true });

      const profile = ProfileRepository.getProfile();
      const goals = ProfileRepository.getGoals();
      const currentCalorieTarget = goals?.calories_target || 2450;
      const targetGainRate = profile?.target_rate_kg_per_week || 0.15;
      const targetWeight = profile?.target_weight || 67.0;

      // 1. Load full weight history
      const allWeights = ProgressRepository.getWeightHistory();

      // Convert to format for EMA calculations
      const rawPoints: WeightDataPoint[] = allWeights.map((w) => ({
        date: w.date,
        weightKg: w.weight_kg,
      }));

      // Calculate full EMA series
      const fullEma = calculateWeightEma(rawPoints, 0.1);

      // Initial start weight, latest weight and EMA
      const startWeight = allWeights.length > 0 ? allWeights[0].weight_kg : profile?.current_weight || 65.8;
      const latestRaw = allWeights.length > 0 ? allWeights[allWeights.length - 1].weight_kg : profile?.current_weight || 65.8;
      const latestEma = fullEma.length > 0 ? fullEma[fullEma.length - 1].emaKg : latestRaw;

      // 2. Weekly rate of change
      const weeklyGainRate = calculateWeeklyGainRate(fullEma, 7);

      // Average calorie & protein intake from recent daily logs
      const recentLogs = ProgressRepository.getDailyLogsForPeriod(14);
      const activeLogs = recentLogs.filter((l) => (l.calories_consumed || 0) > 0);
      const avgCalories =
        activeLogs.length > 0
          ? activeLogs.reduce((sum, l) => sum + (l.calories_consumed || 0), 0) / activeLogs.length
          : currentCalorieTarget;
      const avgProtein =
        activeLogs.length > 0
          ? activeLogs.reduce((sum, l) => sum + (l.protein_consumed || 0), 0) / activeLogs.length
          : 115;

      // 3. Calorie adaptation calculation
      // If we have fewer than 7 days of real weigh-ins, we are in initial baseline period
      let calorieAdaptation: CalorieAdaptationResult;
      if (fullEma.length < 7) {
        calorieAdaptation = {
          actualRateKgPerWeek: weeklyGainRate,
          targetRateKgPerWeek: targetGainRate,
          rateDeltaKgPerWeek: 0,
          recommendedCalorieDelta: 0,
          newRecommendedCalories: currentCalorieTarget,
          action: 'maintain',
          statusBadge: 'ON TRACK',
          rationale: `Baseline established at ${latestRaw.toFixed(1)} kg. Log daily weights over your first week to begin adaptive calorie optimization toward your 67.0 kg goal.`,
          isEstimated: true,
        };
      } else {
        const pastIdx = Math.max(0, fullEma.length - 8);
        const pastEma = fullEma[pastIdx].emaKg;
        const daysBetween = Math.max(1, fullEma.length - 1 - pastIdx);

        calorieAdaptation = calculateCalorieAdaptation({
          currentEmaKg: latestEma,
          pastEmaKg: pastEma,
          daysBetween: daysBetween,
          targetGainRateKgPerWeek: targetGainRate,
          currentCalorieTarget: currentCalorieTarget,
          averageCalorieIntake: avgCalories,
          averageProteinIntake: avgProtein,
          targetProteinMin: goals?.protein_target_min || 110,
        });
      }

      // 4. Sleep & Workout correlation
      const workoutSessions = ProgressRepository.getWorkoutSessionsWithVolume(30);
      const sleepCorrelation = correlateSleepAndWorkout(recentLogs, workoutSessions);

      // 5. Lean bulk trajectory
      const leanBulkTrajectory = calculateLeanBulkTrajectory(
        startWeight,
        latestEma,
        targetWeight,
        targetGainRate
      );

      set({
        weightHistory: allWeights,
        emaSeries: fullEma,
        weeklyGainRate,
        calorieAdaptation,
        sleepCorrelation,
        leanBulkTrajectory,
        currentWeight: latestRaw,
        currentEmaWeight: latestEma,
        startWeight,
        targetWeight,
        currentCalorieTarget,
        isLoading: false,
      });
    } catch (e) {
      console.error('Error loading progress data:', e);
      set({ isLoading: false });
    }
  },

  setTimeframe: (tf: ProgressTimeframe) => {
    set({ timeframe: tf });
  },

  logScaleWeight: async (weightKg: number, dateStr?: string, notes?: string) => {
    try {
      ProgressRepository.logWeight(weightKg, dateStr, notes);

      // Refresh stores
      useProfileStore.getState().loadProfile();
      useDashboardStore.getState().loadDashboard();
      get().loadProgressData();
    } catch (e) {
      console.error('Error logging scale weight:', e);
      throw e;
    }
  },

  deleteWeightEntry: async (id: string) => {
    try {
      ProgressRepository.deleteWeight(id);
      get().loadProgressData();
    } catch (e) {
      console.error('Error deleting weight entry:', e);
    }
  },

  applyCalorieAdjustment: async (deltaKcal: number) => {
    try {
      ProgressRepository.applyCalorieAdjustment(deltaKcal);
      useProfileStore.getState().loadProfile();
      get().loadProgressData();
    } catch (e) {
      console.error('Error applying calorie adjustment:', e);
    }
  },

  setLogWeightModalVisible: (visible: boolean) => {
    set({ isLogWeightModalVisible: visible });
  },
}));
