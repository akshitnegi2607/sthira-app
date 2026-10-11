/**
 * Sthira — Daily Journal & Reflection Store
 * Zustand state for readiness scores, morning/evening reflections,
 * subjective fatigue ratings, and holistic AI coach reviews.
 */

import { create } from 'zustand';
import { JournalEntry, DailyLog } from '../types/database';
import {
  calculateReadinessScore,
  generateDailyCoachReview,
  ReadinessBreakdown,
  DailyCoachReviewResult,
} from '../services/journalAnalytics';
import { JournalRepository } from '../database/repositories/journalRepository';
import { DailyLogsRepository } from '../database/repositories/dailyLogsRepository';
import { ProfileRepository } from '../database/repositories/profileRepository';
import { WorkoutRepository } from '../database/repositories/workoutRepository';
import { useDashboardStore } from './useDashboardStore';

interface JournalState {
  selectedDate: string;
  dailyLog: DailyLog | null;
  morningEntry: JournalEntry | null;
  eveningEntry: JournalEntry | null;
  recentHistory: JournalEntry[];
  readiness: ReadinessBreakdown;
  aiReview: DailyCoachReviewResult | null;
  isMorningModalOpen: boolean;
  isEveningModalOpen: boolean;
  isLoading: boolean;

  // Actions
  setSelectedDate: (date: string) => void;
  loadJournalData: (date?: string) => void;
  saveMorningCheckIn: (params: {
    sleepHours: number;
    energyRating: number;
    moodRating: number;
    sorenessRating: number;
    notes?: string;
  }) => Promise<void>;
  saveEveningReflection: (params: {
    hungerRating: number;
    stressRating: number;
    notes: string;
  }) => Promise<void>;
  generateAndSaveDailyReview: (date?: string) => Promise<void>;
  setMorningModalOpen: (open: boolean) => void;
  setEveningModalOpen: (open: boolean) => void;
}

const defaultReadiness = calculateReadinessScore({});

export const useJournalStore = create<JournalState>((set, get) => ({
  selectedDate: new Date().toISOString().split('T')[0],
  dailyLog: null,
  morningEntry: null,
  eveningEntry: null,
  recentHistory: [],
  readiness: defaultReadiness,
  aiReview: null,
  isMorningModalOpen: false,
  isEveningModalOpen: false,
  isLoading: false,

  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
    get().loadJournalData(date);
  },

  loadJournalData: (dateStr?: string) => {
    try {
      set({ isLoading: true });
      const targetDate = dateStr || get().selectedDate;

      // 1. Get DailyLog
      const log = DailyLogsRepository.getOrCreateLog(targetDate);

      // 2. Get Morning & Evening Journal Entries
      const morning = JournalRepository.getJournalEntry(targetDate, 'morning');
      const evening = JournalRepository.getJournalEntry(targetDate, 'evening');
      const history = JournalRepository.getRecentJournalHistory(14);

      // 3. Calculate Readiness
      const readiness = calculateReadinessScore({
        sleepHours: log.sleep_hours,
        energyRating: log.energy_rating,
        moodRating: log.mood_rating,
        sorenessRating: log.soreness_rating,
      });

      // 4. Resolve Workout session for today if any
      const completedSessions = WorkoutRepository.getCompletedHistory(5);
      const sessionForDay = completedSessions.find((s) => s.date === targetDate);

      let sessionSummary: { title: string; completedSets: number; totalVolumeKg: number } | null = null;
      if (sessionForDay) {
        const populated = WorkoutRepository.getPopulatedSession(sessionForDay.id);
        if (populated) {
          sessionSummary = {
            title: populated.session.title,
            completedSets: populated.completedSetsCount,
            totalVolumeKg: populated.totalVolumeKg,
          };
        }
      }

      // 5. Generate or load AI Coach Review
      const goals = ProfileRepository.getGoals() || {
        id: 'goals_default',
        calories_target: 2450,
        protein_target_min: 110,
        protein_target_max: 125,
        fat_target_min: 65,
        fat_target_max: 80,
        carbs_target: 335,
        water_target_liters: 2.5,
        sleep_hours_target: 8.0,
        workout_days_target: 4,
        created_at: '',
        updated_at: '',
      };

      const existingRec = JournalRepository.getLatestAIRecommendation(targetDate);
      let aiReview: DailyCoachReviewResult;

      if (existingRec) {
        let actionItems: string[] = [];
        try {
          actionItems = existingRec.action_items ? JSON.parse(existingRec.action_items) : [];
        } catch {
          actionItems = [existingRec.action_items || ''];
        }

        aiReview = {
          date: targetDate,
          status: (log.coach_status as any) || 'ON TRACK',
          headline: 'Daily AI Coach Review',
          summary: existingRec.content,
          actionItems,
          readinessScore: readiness.totalScore,
          isEstimated: true,
        };
      } else {
        aiReview = generateDailyCoachReview({
          dailyLog: log,
          goals,
          workoutSession: sessionSummary,
          readinessScore: readiness.totalScore,
          morningNotes: morning?.notes,
          eveningNotes: evening?.notes,
        });
      }

      set({
        selectedDate: targetDate,
        dailyLog: log,
        morningEntry: morning,
        eveningEntry: evening,
        recentHistory: history,
        readiness,
        aiReview,
        isLoading: false,
      });
    } catch (e) {
      console.error('Error loading journal data:', e);
      set({ isLoading: false });
    }
  },

  saveMorningCheckIn: async (params) => {
    try {
      const targetDate = get().selectedDate;
      const { entry, dailyLog } = JournalRepository.saveMorningCheckIn({
        ...params,
        date: targetDate,
      });

      // Update dashboard store
      useDashboardStore.getState().loadDashboard();

      // Recalculate readiness
      const readiness = calculateReadinessScore({
        sleepHours: dailyLog.sleep_hours,
        energyRating: dailyLog.energy_rating,
        moodRating: dailyLog.mood_rating,
        sorenessRating: dailyLog.soreness_rating,
      });

      set({
        dailyLog,
        morningEntry: entry,
        readiness,
        isMorningModalOpen: false,
      });

      // Auto-refresh daily review
      await get().generateAndSaveDailyReview(targetDate);
    } catch (e) {
      console.error('Error saving morning check-in:', e);
      throw e;
    }
  },

  saveEveningReflection: async (params) => {
    try {
      const targetDate = get().selectedDate;
      const { entry, dailyLog } = JournalRepository.saveEveningReflection({
        ...params,
        date: targetDate,
      });

      useDashboardStore.getState().loadDashboard();

      set({
        dailyLog,
        eveningEntry: entry,
        isEveningModalOpen: false,
      });

      await get().generateAndSaveDailyReview(targetDate);
    } catch (e) {
      console.error('Error saving evening reflection:', e);
      throw e;
    }
  },

  generateAndSaveDailyReview: async (dateStr?: string) => {
    try {
      const targetDate = dateStr || get().selectedDate;
      const log = DailyLogsRepository.getOrCreateLog(targetDate);
      const goals = ProfileRepository.getGoals() || {
        id: 'goals_default',
        calories_target: 2450,
        protein_target_min: 110,
        protein_target_max: 125,
        fat_target_min: 65,
        fat_target_max: 80,
        carbs_target: 335,
        water_target_liters: 2.5,
        sleep_hours_target: 8.0,
        workout_days_target: 4,
        created_at: '',
        updated_at: '',
      };

      const completedSessions = WorkoutRepository.getCompletedHistory(5);
      const sessionForDay = completedSessions.find((s) => s.date === targetDate);
      let sessionSummary: { title: string; completedSets: number; totalVolumeKg: number } | null = null;
      if (sessionForDay) {
        const populated = WorkoutRepository.getPopulatedSession(sessionForDay.id);
        if (populated) {
          sessionSummary = {
            title: populated.session.title,
            completedSets: populated.completedSetsCount,
            totalVolumeKg: populated.totalVolumeKg,
          };
        }
      }

      const morning = JournalRepository.getJournalEntry(targetDate, 'morning');
      const evening = JournalRepository.getJournalEntry(targetDate, 'evening');
      const readiness = get().readiness;

      const review = generateDailyCoachReview({
        dailyLog: log,
        goals,
        workoutSession: sessionSummary,
        readinessScore: readiness.totalScore,
        morningNotes: morning?.notes,
        eveningNotes: evening?.notes,
      });

      // Save to AIRecommendations and sync DailyLogs
      JournalRepository.saveAIRecommendation({
        date: targetDate,
        recommendation_type: 'daily_coach',
        content: review.summary,
        action_items: JSON.stringify(review.actionItems),
        rationale: review.headline,
        statusBadge: review.status,
      });

      // Reload dashboard
      useDashboardStore.getState().loadDashboard();

      set({
        aiReview: review,
        dailyLog: DailyLogsRepository.getLogByDate(targetDate) || log,
      });
    } catch (e) {
      console.error('Error generating daily review:', e);
    }
  },

  setMorningModalOpen: (open: boolean) => {
    set({ isMorningModalOpen: open });
  },

  setEveningModalOpen: (open: boolean) => {
    set({ isEveningModalOpen: open });
  },
}));
