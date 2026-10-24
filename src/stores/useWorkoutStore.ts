/**
 * Sthira — Workout & Training Store
 * Manages active workout session state, live session clock,
 * rest countdown timer, progressive overload, and pain tracking.
 */

import { create } from 'zustand';
import {
  WorkoutRepository,
  PopulatedSession,
  PopulatedWorkoutExercise,
} from '@/database/repositories/workoutRepository';
import { Exercise, WorkoutPlan, WorkoutSession, PainEntry, WorkoutSet } from '@/types/database';
import { useDashboardStore } from './useDashboardStore';
import { getTodayDateString } from '@/utils/date';
import { isSupabaseConfigured, getSupabaseClient } from '@/services/supabaseClient';
import { SupabaseSyncService } from '@/services/supabaseSyncService';

interface WorkoutStoreState {
  // Plans & Library
  plans: WorkoutPlan[];
  exercises: Exercise[];
  todayPlan: WorkoutPlan | null;
  history: PopulatedSession[];
  recentPain: PainEntry[];
  isLoading: boolean;

  // Active Session State
  activeSession: PopulatedSession | null;
  isSessionActive: boolean;
  elapsedSeconds: number;
  isTimerPaused: boolean;
  sessionStartTimestamp: number | null;
  sessionPausedDurationMs: number;
  lastPauseTimestamp: number | null;

  // Built-in Rest Timer
  restTimeRemaining: number;
  restTimeTotal: number;
  isRestTimerActive: boolean;
  autoRestTimerEnabled: boolean;

  // UI Modals
  isSubstitutionModalOpen: boolean;
  substitutingWorkoutExerciseId: string | null;
  selectedExerciseForInfo: Exercise | null;
  isFinishModalOpen: boolean;
  isPainModalOpen: boolean;
  selectedHistorySession: PopulatedSession | null;
  isHistoryModalOpen: boolean;

  // Actions
  init: () => void;
  loadData: () => void;
  startWorkout: (planId?: string | null, title?: string, dateStr?: string) => PopulatedSession;
  switchTodayPlan: (plan: WorkoutPlan) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  tickSessionTimer: () => void;

  // Rest Timer Actions
  startRestTimer: (seconds?: number) => void;
  stopRestTimer: () => void;
  addRestSeconds: (seconds: number) => void;
  tickRestTimer: () => void;
  setAutoRestTimer: (enabled: boolean) => void;

  // Active Session Modifications
  addSet: (workoutExerciseId: string) => void;
  updateSet: (setId: string, data: Partial<WorkoutSet>) => void;
  toggleCompleteSet: (setId: string, targetRestSeconds?: number) => void;
  deleteSet: (setId: string) => void;
  substituteExercise: (workoutExerciseId: string, newExerciseId: string) => void;
  addExerciseToWorkout: (exerciseId: string) => void;
  createCustomExercise: (data: {
    name: string;
    category?: string;
    primary_muscle?: string;
    equipment?: string;
    target_sets?: number;
    target_rep_range?: string;
    starting_weight_kg?: number;
  }) => Exercise;

  // Finish & Cancel
  removeExerciseFromWorkout: (workoutExerciseId: string) => void;
  finishWorkout: (data: {
    difficulty?: 'Easy' | 'Good' | 'Hard' | 'Very hard';
    notes?: string;
    painEntry?: { bodyArea: string; painLevel: number; notes?: string };
  }) => void;
  cancelWorkout: () => void;

  // Pain Logging
  logPain: (bodyArea: string, painLevel: number, notes?: string) => void;

  // Modal Controls
  openSubstitutionModal: (workoutExerciseId: string) => void;
  closeSubstitutionModal: () => void;
  openExerciseInfo: (exercise: Exercise) => void;
  closeExerciseInfo: () => void;
  openFinishModal: () => void;
  closeFinishModal: () => void;
  openPainModal: () => void;
  closePainModal: () => void;
  openHistoryModal: (session: PopulatedSession) => void;
  closeHistoryModal: () => void;
  deleteHistorySession: (sessionId: string) => void;
}

export const useWorkoutStore = create<WorkoutStoreState>((set, get) => ({
  plans: [],
  exercises: [],
  todayPlan: null,
  history: [],
  recentPain: [],
  isLoading: true,

  activeSession: null,
  isSessionActive: false,
  elapsedSeconds: 0,
  isTimerPaused: false,
  sessionStartTimestamp: null,
  sessionPausedDurationMs: 0,
  lastPauseTimestamp: null,

  restTimeRemaining: 0,
  restTimeTotal: 90,
  isRestTimerActive: false,
  autoRestTimerEnabled: true,

  isSubstitutionModalOpen: false,
  substitutingWorkoutExerciseId: null,
  selectedExerciseForInfo: null,
  isFinishModalOpen: false,
  isPainModalOpen: false,
  selectedHistorySession: null,
  isHistoryModalOpen: false,

  init: () => {
    get().loadData();
  },

  loadData: () => {
    try {
      const plans = WorkoutRepository.getAllPlans();
      const exercises = WorkoutRepository.getAllExercises();
      const todayPlan = WorkoutRepository.getTodayPlan();
      const history = WorkoutRepository.getCompletedHistoryWithDetails(20);
      const recentPain = WorkoutRepository.getRecentPainEntries(14);
      let activeSession = WorkoutRepository.getActiveSession();

      let elapsed = 0;
      let startTs: number | null = null;
      if (activeSession) {
        const startedIso = activeSession.session.start_time || activeSession.session.created_at;
        if (startedIso) {
          const startedAtMs = new Date(startedIso).getTime();
          if (!isNaN(startedAtMs)) {
            const ageSec = Math.floor((Date.now() - startedAtMs) / 1000);
            const isEmpty = activeSession.exercises.length === 0 || activeSession.completedSetsCount === 0;

            // Auto-cancel zombie sessions (> 4 hours or empty > 20 mins)
            if (ageSec > 14400 || (isEmpty && ageSec > 1200)) {
              WorkoutRepository.cancelSession(activeSession.session.id);
              activeSession = null;
            } else {
              startTs = startedAtMs;
              elapsed = Math.min(10800, Math.max(activeSession.session.duration_seconds || 0, ageSec));
            }
          }
        }
      }

      set({
        plans,
        exercises,
        todayPlan,
        history,
        recentPain,
        activeSession,
        isSessionActive: activeSession !== null,
        elapsedSeconds: elapsed,
        sessionStartTimestamp: startTs || (activeSession ? Date.now() - elapsed * 1000 : null),
        sessionPausedDurationMs: 0,
        lastPauseTimestamp: null,
        isTimerPaused: false,
        isLoading: false,
      });
    } catch (e) {
      console.warn('Error loading workout data:', e);
      set({ isLoading: false });
    }
  },

  startWorkout: (planId, title, dateStr) => {
    const defaultTitle =
      title ||
      (planId ? get().plans.find((p) => p.id === planId)?.name : 'Custom Workout') ||
      'Workout Session';

    const populated = WorkoutRepository.startSession({
      planId: planId ?? null,
      title: defaultTitle,
      date: dateStr,
    });

    set({
      activeSession: populated,
      isSessionActive: true,
      elapsedSeconds: 0,
      isTimerPaused: false,
      sessionStartTimestamp: Date.now(),
      sessionPausedDurationMs: 0,
      lastPauseTimestamp: null,
      isRestTimerActive: false,
      restTimeRemaining: 0,
    });

    try {
      useDashboardStore.getState().loadDashboard();
    } catch (e) {
      // Ignore
    }

    return populated;
  },

  switchTodayPlan: (plan: WorkoutPlan) => {
    set({ todayPlan: plan });
  },

  pauseTimer: () => {
    const { isTimerPaused } = get();
    if (isTimerPaused) return;
    set({ isTimerPaused: true, lastPauseTimestamp: Date.now() });
  },

  resumeTimer: () => {
    const { isTimerPaused, lastPauseTimestamp, sessionPausedDurationMs } = get();
    if (!isTimerPaused) return;
    const additionalPause = lastPauseTimestamp ? Date.now() - lastPauseTimestamp : 0;
    set({
      isTimerPaused: false,
      lastPauseTimestamp: null,
      sessionPausedDurationMs: sessionPausedDurationMs + additionalPause,
    });
  },

  tickSessionTimer: () => {
    const { isSessionActive, isTimerPaused, sessionStartTimestamp, sessionPausedDurationMs, activeSession } = get();
    if (!isSessionActive) return;
    if (!isTimerPaused && sessionStartTimestamp) {
      const elapsed = Math.max(0, Math.floor((Date.now() - sessionStartTimestamp - sessionPausedDurationMs) / 1000));
      // Auto-pause if session reaches 3 hours (10,800 seconds)
      if (elapsed >= 10800) {
        set({ elapsedSeconds: 10800, isTimerPaused: true, lastPauseTimestamp: Date.now() });
        return;
      }
      set({ elapsedSeconds: elapsed });
      if (activeSession && elapsed % 10 === 0 && elapsed > 0) {
        try {
          WorkoutRepository.updateSessionDuration(activeSession.session.id, elapsed);
        } catch {}
      }
    }
  },

  startRestTimer: (seconds = 90) => {
    set({
      restTimeRemaining: seconds,
      restTimeTotal: seconds,
      isRestTimerActive: true,
    });
  },

  stopRestTimer: () => {
    set({
      isRestTimerActive: false,
      restTimeRemaining: 0,
    });
  },

  addRestSeconds: (seconds) => {
    const current = get().restTimeRemaining;
    const total = get().restTimeTotal;
    set({
      restTimeRemaining: current + seconds,
      restTimeTotal: total + seconds,
    });
  },

  tickRestTimer: () => {
    const { isRestTimerActive, restTimeRemaining } = get();
    if (!isRestTimerActive) return;

    if (restTimeRemaining <= 1) {
      set({ isRestTimerActive: false, restTimeRemaining: 0 });
    } else {
      set({ restTimeRemaining: restTimeRemaining - 1 });
    }
  },

  setAutoRestTimer: (enabled) => set({ autoRestTimerEnabled: enabled }),

  addSet: (workoutExerciseId) => {
    WorkoutRepository.addSet(workoutExerciseId);
    const active = get().activeSession;
    if (active) {
      const refreshed = WorkoutRepository.getPopulatedSession(active.session.id);
      set({ activeSession: refreshed });
    }
  },

  updateSet: (setId, data) => {
    const enrichedData = { ...data };
    if (enrichedData.reps !== undefined && enrichedData.reps > 0 && enrichedData.is_completed === undefined) {
      enrichedData.is_completed = 1;
    }
    WorkoutRepository.updateSet(setId, enrichedData);
    const active = get().activeSession;
    if (active) {
      const refreshed = WorkoutRepository.getPopulatedSession(active.session.id);
      set({ activeSession: refreshed });
    }
  },

  toggleCompleteSet: (setId, targetRestSeconds = 90) => {
    const active = get().activeSession;
    if (!active) return;

    let wasCompleted = false;
    for (const ex of active.exercises) {
      const s = ex.sets.find((set) => set.id === setId);
      if (s) {
        wasCompleted = s.is_completed === 1;
        break;
      }
    }

    const nextCompleted = !wasCompleted;
    WorkoutRepository.updateSet(setId, { is_completed: nextCompleted ? 1 : 0 });

    const refreshed = WorkoutRepository.getPopulatedSession(active.session.id);
    set({ activeSession: refreshed });

    // If set was just checked as completed, trigger rest timer
    if (nextCompleted && get().autoRestTimerEnabled) {
      get().startRestTimer(targetRestSeconds);
    }
  },

  deleteSet: (setId) => {
    WorkoutRepository.deleteSet(setId);
    const active = get().activeSession;
    if (active) {
      const refreshed = WorkoutRepository.getPopulatedSession(active.session.id);
      set({ activeSession: refreshed });
    }
  },

  substituteExercise: (workoutExerciseId, newExerciseId) => {
    WorkoutRepository.substituteExercise(workoutExerciseId, newExerciseId);
    const active = get().activeSession;
    if (active) {
      const refreshed = WorkoutRepository.getPopulatedSession(active.session.id);
      set({
        activeSession: refreshed,
        isSubstitutionModalOpen: false,
        substitutingWorkoutExerciseId: null,
      });
    }
  },

  addExerciseToWorkout: (exerciseId) => {
    const active = get().activeSession;
    if (!active) return;
    WorkoutRepository.addExerciseToSession(active.session.id, exerciseId);
    const refreshed = WorkoutRepository.getPopulatedSession(active.session.id);
    set({ activeSession: refreshed });
  },

  createCustomExercise: (data) => {
    const created = WorkoutRepository.createCustomExercise(data);
    const exercises = WorkoutRepository.getAllExercises();
    set({ exercises });
    if (isSupabaseConfigured()) {
      SupabaseSyncService.syncAll().catch(() => {});
    }
    return created;
  },

  finishWorkout: (data) => {
    const active = get().activeSession;
    if (!active) return;

    WorkoutRepository.finishSession(active.session.id, {
      durationSeconds: get().elapsedSeconds,
      difficultyPerceived: data.difficulty,
      notes: data.notes,
      painEntry: data.painEntry,
    });

    set({
      activeSession: null,
      isSessionActive: false,
      elapsedSeconds: 0,
      sessionStartTimestamp: null,
      sessionPausedDurationMs: 0,
      lastPauseTimestamp: null,
      isRestTimerActive: false,
      isFinishModalOpen: false,
    });

    // Refresh history, exercises and pain
    get().loadData();
    try {
      useDashboardStore.getState().loadDashboard();
    } catch (e) {
      // Ignore
    }
    if (isSupabaseConfigured()) {
      SupabaseSyncService.syncAll().catch(() => {});
    }
  },

  removeExerciseFromWorkout: (workoutExerciseId) => {
    const active = get().activeSession;
    if (!active) return;
    WorkoutRepository.removeExerciseFromSession(workoutExerciseId);
    const refreshed = WorkoutRepository.getPopulatedSession(active.session.id);
    set({ activeSession: refreshed });
  },

  cancelWorkout: () => {
    const active = get().activeSession;
    if (active) {
      WorkoutRepository.cancelSession(active.session.id);
    }
    WorkoutRepository.cancelAllActiveSessions();
    set({
      activeSession: null,
      isSessionActive: false,
      elapsedSeconds: 0,
      sessionStartTimestamp: null,
      sessionPausedDurationMs: 0,
      lastPauseTimestamp: null,
      isRestTimerActive: false,
      isFinishModalOpen: false,
    });
    try {
      useDashboardStore.getState().loadDashboard();
    } catch (e) {
      // Ignore
    }
  },

  logPain: (bodyArea, painLevel, notes) => {
    const todayStr = getTodayDateString();
    WorkoutRepository.logPainEntry({
      date: todayStr,
      body_area: bodyArea,
      pain_level: painLevel,
      activity_context: 'Manual log',
      notes,
    });

    const recentPain = WorkoutRepository.getRecentPainEntries(14);
    set({ recentPain, isPainModalOpen: false });
    if (isSupabaseConfigured()) {
      SupabaseSyncService.syncAll().catch(() => {});
    }
  },

  openSubstitutionModal: (workoutExerciseId) =>
    set({
      isSubstitutionModalOpen: true,
      substitutingWorkoutExerciseId: workoutExerciseId,
    }),
  closeSubstitutionModal: () =>
    set({
      isSubstitutionModalOpen: false,
      substitutingWorkoutExerciseId: null,
    }),

  openExerciseInfo: (exercise) => set({ selectedExerciseForInfo: exercise }),
  closeExerciseInfo: () => set({ selectedExerciseForInfo: null }),

  openFinishModal: () => set({ isFinishModalOpen: true }),
  closeFinishModal: () => set({ isFinishModalOpen: false }),

  openPainModal: () => set({ isPainModalOpen: true }),
  closePainModal: () => set({ isPainModalOpen: false }),

  openHistoryModal: (session) =>
    set({
      selectedHistorySession: session,
      isHistoryModalOpen: true,
    }),
  closeHistoryModal: () =>
    set({
      selectedHistorySession: null,
      isHistoryModalOpen: false,
    }),

  deleteHistorySession: async (sessionId) => {
    WorkoutRepository.deleteSession(sessionId);
    set({
      selectedHistorySession: null,
      isHistoryModalOpen: false,
    });
    get().loadData();
    try {
      useDashboardStore.getState().loadDashboard();
    } catch (e) {
      // Ignore
    }
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('WorkoutSessions').delete().eq('id', sessionId);
        } catch {}
        SupabaseSyncService.syncAll().catch(() => {});
      }
    }
  },
}));
