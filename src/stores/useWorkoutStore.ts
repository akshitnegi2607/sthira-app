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
  startWorkout: (planId?: string | null, title?: string) => PopulatedSession;
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

  // Finish & Cancel
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
      const activeSession = WorkoutRepository.getActiveSession();

      set({
        plans,
        exercises,
        todayPlan,
        history,
        recentPain,
        activeSession,
        isSessionActive: activeSession !== null,
        elapsedSeconds: activeSession ? activeSession.session.duration_seconds || 0 : 0,
        isLoading: false,
      });
    } catch (e) {
      console.warn('Error loading workout data:', e);
      set({ isLoading: false });
    }
  },

  startWorkout: (planId, title) => {
    const defaultTitle =
      title ||
      (planId ? get().plans.find((p) => p.id === planId)?.name : 'Custom Workout') ||
      'Workout Session';

    const populated = WorkoutRepository.startSession({
      planId: planId ?? null,
      title: defaultTitle,
    });

    set({
      activeSession: populated,
      isSessionActive: true,
      elapsedSeconds: 0,
      isTimerPaused: false,
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

  pauseTimer: () => set({ isTimerPaused: true }),
  resumeTimer: () => set({ isTimerPaused: false }),

  tickSessionTimer: () => {
    const { isSessionActive, isTimerPaused, elapsedSeconds } = get();
    if (isSessionActive && !isTimerPaused) {
      set({ elapsedSeconds: elapsedSeconds + 1 });
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
  },

  cancelWorkout: () => {
    const active = get().activeSession;
    if (active) {
      WorkoutRepository.cancelSession(active.session.id);
    }
    set({
      activeSession: null,
      isSessionActive: false,
      elapsedSeconds: 0,
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

  deleteHistorySession: (sessionId) => {
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
  },
}));
