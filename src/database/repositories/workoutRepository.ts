/**
 * Sthira — Workout Repository
 * Manages WorkoutPlans, WorkoutSessions, WorkoutExercises, WorkoutSets,
 * Exercise progressions, and PainEntries with SQLite.
 */

import { getDatabase } from '../db';
import {
  Exercise,
  WorkoutPlan,
  WorkoutSession,
  WorkoutExercise,
  WorkoutSet,
  PainEntry,
} from '../../types/database';
import { INITIAL_WORKOUT_PLANS } from '../../constants/initialWorkouts';
import { calculateProgressiveOverload, parseRepRange } from '../../services/progressiveOverload';
import { getAssociatedBodyArea } from '../../services/exerciseSubstitution';
import { getTodayDateString, shiftDateString } from '../../utils/date';

export interface PopulatedSet extends WorkoutSet {}

export interface PopulatedWorkoutExercise {
  workoutExercise: WorkoutExercise;
  exercise: Exercise;
  sets: PopulatedSet[];
}

export interface PopulatedSession {
  session: WorkoutSession;
  exercises: PopulatedWorkoutExercise[];
  totalVolumeKg: number;
  completedSetsCount: number;
}

export interface ExerciseSetRecord {
  setNumber: number;
  weightKg: number;
  reps: number;
  rir: number | null;
}

export interface ExerciseLastPerformance {
  hasHistory: boolean;
  lastDate?: string;
  lastSessionTitle?: string;
  lastSets: ExerciseSetRecord[];
  maxWeightKg?: number;
  bestSetText?: string;
  summaryText: string;
}

export const WorkoutRepository = {
  /**
   * Retrieves all exercises from database.
   */
  getAllExercises(): Exercise[] {
    const db = getDatabase();
    return db.getAllSync<Exercise>('SELECT * FROM Exercises ORDER BY category ASC, name ASC');
  },

  /**
   * Retrieves a single exercise by ID.
   */
  getExerciseById(id: string): Exercise | null {
    const db = getDatabase();
    return db.getFirstSync<Exercise>('SELECT * FROM Exercises WHERE id = ? LIMIT 1', [id]);
  },

  /**
   * Retrieves the actual last completed set performance for an exercise from past completed sessions.
   * Gives measured previous weights, reps, and sets instead of generic/hardcoded fallbacks.
   */
  getLastPerformanceForExercise(exerciseId: string): ExerciseLastPerformance {
    const db = getDatabase();
    try {
      // Find the most recent completed session containing this exercise
      const latestSession = db.getFirstSync<{
        sessionId: string;
        sessionDate: string;
        sessionTitle: string;
      }>(
        `SELECT ws.id as sessionId, ws.date as sessionDate, ws.title as sessionTitle
         FROM WorkoutSets s
         JOIN WorkoutExercises we ON s.workout_exercise_id = we.id
         JOIN WorkoutSessions ws ON we.session_id = ws.id
         WHERE we.exercise_id = ?
           AND ws.status = 'completed'
           AND (s.is_completed = 1 OR s.reps > 0)
         ORDER BY ws.date DESC, ws.created_at DESC
         LIMIT 1`,
        [exerciseId]
      );

      if (!latestSession) {
        return {
          hasHistory: false,
          lastSets: [],
          summaryText: 'No previous sets recorded',
        };
      }

      // Fetch all completed sets from that session for this exercise
      const sets = db.getAllSync<{
        set_number: number;
        weight_kg: number;
        reps: number;
        rir: number | null;
      }>(
        `SELECT s.set_number, s.weight_kg, s.reps, s.rir
         FROM WorkoutSets s
         JOIN WorkoutExercises we ON s.workout_exercise_id = we.id
         WHERE we.session_id = ?
           AND we.exercise_id = ?
           AND (s.is_completed = 1 OR s.reps > 0)
         ORDER BY s.set_number ASC`,
        [latestSession.sessionId, exerciseId]
      );

      if (!sets || sets.length === 0) {
        return {
          hasHistory: false,
          lastSets: [],
          summaryText: 'No previous sets recorded',
        };
      }

      const lastSets: ExerciseSetRecord[] = sets.map((s) => ({
        setNumber: s.set_number,
        weightKg: s.weight_kg,
        reps: s.reps,
        rir: s.rir,
      }));

      const maxWeightKg = Math.max(...lastSets.map((s) => s.weightKg));
      const bestSet = [...lastSets].sort((a, b) => {
        if (b.weightKg !== a.weightKg) return b.weightKg - a.weightKg;
        return b.reps - a.reps;
      })[0];

      const bestSetText = `${bestSet.weightKg} kg × ${bestSet.reps}`;
      const summaryText = `Last: ${bestSetText} (${latestSession.sessionDate})`;

      return {
        hasHistory: true,
        lastDate: latestSession.sessionDate,
        lastSessionTitle: latestSession.sessionTitle,
        lastSets,
        maxWeightKg,
        bestSetText,
        summaryText,
      };
    } catch (e) {
      console.warn('getLastPerformanceForExercise error:', e);
      return {
        hasHistory: false,
        lastSets: [],
        summaryText: 'No previous sets recorded',
      };
    }
  },

  /**
   * Creates a custom exercise in SQLite.
   */
  createCustomExercise(data: {
    name: string;
    category?: string;
    primary_muscle?: string;
    equipment?: string;
    target_sets?: number;
    target_rep_range?: string;
    starting_weight_kg?: number;
  }): Exercise {
    const db = getDatabase();
    const id = `ex_custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();
    const sets = data.target_sets || 3;
    const reps = data.target_rep_range || '8–12';
    const weight = data.starting_weight_kg ?? 20;

    db.runSync(
      `INSERT INTO Exercises (
        id, name, category, primary_muscle, secondary_muscles,
        equipment, difficulty_level, target_sets, target_rep_range,
        rest_seconds, instructions, common_mistakes, substitutions,
        starting_weight_kg, last_weight_kg, current_recommended_weight_kg,
        is_custom, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'intermediate', ?, ?, 90, 'Custom exercise added by user.', 'Maintain proper form and control.', '', ?, ?, ?, 1, ?)`,
      [
        id,
        data.name.trim(),
        data.category?.trim() || 'Strength',
        data.primary_muscle?.trim() || 'General',
        'Various',
        data.equipment?.trim() || 'Machine / Free Weight',
        sets,
        reps,
        weight,
        weight,
        weight,
        now,
      ]
    );

    const created = db.getFirstSync<Exercise>('SELECT * FROM Exercises WHERE id = ?', [id]);
    if (!created) throw new Error('Failed to create custom exercise');
    return created;
  },

  /**
   * Retrieves all workout plans.
   */
  getAllPlans(): WorkoutPlan[] {
    const db = getDatabase();
    return db.getAllSync<WorkoutPlan>('SELECT * FROM WorkoutPlans ORDER BY day_of_week ASC');
  },

  /**
   * Retrieves the scheduled plan for today.
   */
  getTodayPlan(): WorkoutPlan | null {
    const db = getDatabase();
    const dayOfWeek = new Date().getDay(); // 0 = Sunday, 1 = Monday...
    return db.getFirstSync<WorkoutPlan>(
      'SELECT * FROM WorkoutPlans WHERE day_of_week = ? LIMIT 1',
      [dayOfWeek]
    );
  },

  /**
   * Retrieves exercises associated with a workout plan by plan ID.
   */
  getExercisesForPlan(planId: string): Exercise[] {
    const seedPlan = INITIAL_WORKOUT_PLANS.find((p: { id: string }) => p.id === planId);
    if (!seedPlan || !seedPlan.exercise_ids || seedPlan.exercise_ids.length === 0) {
      return [];
    }

    const db = getDatabase();
    const placeholders = seedPlan.exercise_ids.map(() => '?').join(',');
    const found = db.getAllSync<Exercise>(
      `SELECT * FROM Exercises WHERE id IN (${placeholders})`,
      seedPlan.exercise_ids
    );

    // Maintain seed plan ordering
    const idMap = new Map<string, Exercise>(found.map((e: Exercise) => [e.id, e]));
    return seedPlan.exercise_ids
      .map((id: string) => idMap.get(id))
      .filter((e: Exercise | undefined): e is Exercise => e !== undefined);
  },

  /**
   * Gets currently active/in-progress workout session, if any.
   */
  getActiveSession(): PopulatedSession | null {
    const db = getDatabase();
    const session = db.getFirstSync<WorkoutSession>(
      `SELECT * FROM WorkoutSessions WHERE status = 'in_progress' ORDER BY created_at DESC LIMIT 1`
    );
    if (!session) return null;
    return this.getPopulatedSession(session.id);
  },

  /**
   * Loads full populated session hierarchy by session ID.
   */
  getPopulatedSession(sessionId: string): PopulatedSession | null {
    const db = getDatabase();
    const session = db.getFirstSync<WorkoutSession>(
      'SELECT * FROM WorkoutSessions WHERE id = ? LIMIT 1',
      [sessionId]
    );
    if (!session) return null;

    const workoutExercises = db.getAllSync<WorkoutExercise>(
      'SELECT * FROM WorkoutExercises WHERE session_id = ? ORDER BY order_index ASC',
      [sessionId]
    );

    let totalVolumeKg = 0;
    let completedSetsCount = 0;

    const populatedExercises: PopulatedWorkoutExercise[] = workoutExercises.map((we) => {
      const exercise =
        db.getFirstSync<Exercise>('SELECT * FROM Exercises WHERE id = ? LIMIT 1', [
          we.exercise_id,
        ]) || {
          id: we.exercise_id,
          name: 'Exercise',
          category: 'General',
          primary_muscle: 'Full Body',
          secondary_muscles: '',
          equipment: 'Standard',
          difficulty_level: 'beginner',
          target_sets: 3,
          target_rep_range: '8–12',
          rest_seconds: 90,
          instructions: '',
          common_mistakes: '',
          substitutions: '',
          is_custom: 0,
          created_at: new Date().toISOString(),
        };

      const sets = db.getAllSync<WorkoutSet>(
        'SELECT * FROM WorkoutSets WHERE workout_exercise_id = ? ORDER BY set_number ASC',
        [we.id]
      );

      for (const s of sets) {
        if (s.is_completed) {
          completedSetsCount++;
          totalVolumeKg += (s.weight_kg || 0) * (s.reps || 0);
        }
      }

      return {
        workoutExercise: we,
        exercise,
        sets,
      };
    });

    return {
      session,
      exercises: populatedExercises,
      totalVolumeKg: Math.round(totalVolumeKg * 10) / 10,
      completedSetsCount,
    };
  },

  /**
   * Starts a new workout session from a plan or custom title.
   */
  startSession(data: {
    planId?: string | null;
    title: string;
    exerciseIds?: string[];
  }): PopulatedSession {
    const db = getDatabase();
    const now = new Date().toISOString();
    const todayStr = getTodayDateString();
    const sessionId = `sess_${Date.now()}`;

    db.runSync(
      `INSERT INTO WorkoutSessions (
        id, date, workout_plan_id, title, start_time, duration_seconds,
        status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [sessionId, todayStr, data.planId ?? null, data.title, now, 0, 'in_progress', now]
    );

    // Resolve exercises to populate
    let exercisesToLoad: Exercise[] = [];
    if (data.planId) {
      exercisesToLoad = this.getExercisesForPlan(data.planId);
    } else if (data.exerciseIds && data.exerciseIds.length > 0) {
      const placeholders = data.exerciseIds.map(() => '?').join(',');
      exercisesToLoad = db.getAllSync<Exercise>(
        `SELECT * FROM Exercises WHERE id IN (${placeholders})`,
        data.exerciseIds
      );
    }

    // Insert WorkoutExercises and initial default sets
    exercisesToLoad.forEach((ex, idx) => {
      const weId = `we_${sessionId}_${idx + 1}`;
      db.runSync(
        `INSERT INTO WorkoutExercises (id, session_id, exercise_id, order_index, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [weId, sessionId, ex.id, idx + 1, now]
      );

      const targetSets = ex.target_sets || 3;
      const { minReps } = parseRepRange(ex.target_rep_range);
      const fallbackWeight = ex.current_recommended_weight_kg ?? ex.starting_weight_kg ?? 20;

      // Look up actual historical sets performed from last completed workout
      const prevPerf = this.getLastPerformanceForExercise(ex.id);

      for (let s = 1; s <= targetSets; s++) {
        const setId = `set_${weId}_${s}`;
        let initialWeight = fallbackWeight;
        let initialReps = minReps;
        let initialRir = 2;

        if (prevPerf.hasHistory && prevPerf.lastSets.length > 0) {
          const matchingPrevSet = prevPerf.lastSets.find((ls) => ls.setNumber === s) ||
            prevPerf.lastSets[prevPerf.lastSets.length - 1];
          if (matchingPrevSet) {
            initialWeight = matchingPrevSet.weightKg;
            initialReps = matchingPrevSet.reps;
            if (matchingPrevSet.rir !== null) initialRir = matchingPrevSet.rir;
          }
        }

        db.runSync(
          `INSERT INTO WorkoutSets (
            id, workout_exercise_id, set_number, weight_kg, reps, rir, is_completed, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [setId, weId, s, initialWeight, initialReps, initialRir, 0, now]
        );
      }
    });

    const populated = this.getPopulatedSession(sessionId);
    if (!populated) throw new Error('Failed to create workout session');
    return populated;
  },

  /**
   * Adds a new set to an active workout exercise.
   */
  addSet(workoutExerciseId: string): WorkoutSet {
    const db = getDatabase();
    const now = new Date().toISOString();

    const existingSets = db.getAllSync<WorkoutSet>(
      'SELECT * FROM WorkoutSets WHERE workout_exercise_id = ? ORDER BY set_number DESC',
      [workoutExerciseId]
    );

    const nextSetNumber = existingSets.length > 0 ? existingSets[0].set_number + 1 : 1;
    const lastSet = existingSets[0];
    const defaultWeight = lastSet ? lastSet.weight_kg : 20;
    const defaultReps = lastSet ? lastSet.reps : 10;
    const defaultRir = lastSet && lastSet.rir !== null ? lastSet.rir : 2;

    const newSetId = `set_${workoutExerciseId}_${nextSetNumber}_${Date.now()}`;
    db.runSync(
      `INSERT INTO WorkoutSets (
        id, workout_exercise_id, set_number, weight_kg, reps, rir, is_completed, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [newSetId, workoutExerciseId, nextSetNumber, defaultWeight, defaultReps, defaultRir, 0, now]
    );

    return db.getFirstSync<WorkoutSet>('SELECT * FROM WorkoutSets WHERE id = ?', [newSetId])!;
  },

  /**
   * Updates an existing workout set (weight, reps, rir, is_completed).
   */
  updateSet(setId: string, data: Partial<WorkoutSet>): void {
    const db = getDatabase();
    const existing = db.getFirstSync<WorkoutSet>('SELECT * FROM WorkoutSets WHERE id = ?', [setId]);
    if (!existing) return;

    const weight = data.weight_kg !== undefined ? data.weight_kg : existing.weight_kg;
    const reps = data.reps !== undefined ? data.reps : existing.reps;
    const rir = data.rir !== undefined ? data.rir : existing.rir;
    const isCompleted =
      data.is_completed !== undefined ? (data.is_completed ? 1 : 0) : existing.is_completed;
    const difficulty =
      data.perceived_difficulty !== undefined ? data.perceived_difficulty : existing.perceived_difficulty;

    db.runSync(
      `UPDATE WorkoutSets SET
        weight_kg = ?, reps = ?, rir = ?, is_completed = ?, perceived_difficulty = ?
       WHERE id = ?`,
      [weight, reps, rir, isCompleted, difficulty, setId]
    );
  },

  /**
   * Deletes a set from an exercise.
   */
  deleteSet(setId: string): void {
    const db = getDatabase();
    db.runSync('DELETE FROM WorkoutSets WHERE id = ?', [setId]);
  },

  /**
   * Substitutes an exercise in an active session with an alternative exercise.
   */
  substituteExercise(workoutExerciseId: string, newExerciseId: string): void {
    const db = getDatabase();
    const newEx = db.getFirstSync<Exercise>('SELECT * FROM Exercises WHERE id = ? LIMIT 1', [
      newExerciseId,
    ]);
    if (!newEx) return;

    db.runSync('UPDATE WorkoutExercises SET exercise_id = ? WHERE id = ?', [
      newExerciseId,
      workoutExerciseId,
    ]);

    // Update uncompleted sets to new recommended weight
    const defaultWeight = newEx.current_recommended_weight_kg ?? newEx.starting_weight_kg ?? 20;
    db.runSync(
      'UPDATE WorkoutSets SET weight_kg = ? WHERE workout_exercise_id = ? AND is_completed = 0',
      [defaultWeight, workoutExerciseId]
    );
  },

  /**
   * Updates duration_seconds of an ongoing workout session.
   */
  updateSessionDuration(sessionId: string, durationSeconds: number): void {
    const db = getDatabase();
    try {
      db.runSync('UPDATE WorkoutSessions SET duration_seconds = ? WHERE id = ?', [
        durationSeconds,
        sessionId,
      ]);
    } catch {}
  },

  /**
   * Appends an exercise to an active session.
   */
  addExerciseToSession(sessionId: string, exerciseId: string): PopulatedWorkoutExercise {
    const db = getDatabase();
    const now = new Date().toISOString();
    const existing = db.getAllSync<WorkoutExercise>(
      'SELECT * FROM WorkoutExercises WHERE session_id = ?',
      [sessionId]
    );
    const orderIndex = existing.length + 1;
    const weId = `we_${sessionId}_${orderIndex}_${Date.now()}`;

    db.runSync(
      `INSERT INTO WorkoutExercises (id, session_id, exercise_id, order_index, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [weId, sessionId, exerciseId, orderIndex, now]
    );

    const exercise = db.getFirstSync<Exercise>('SELECT * FROM Exercises WHERE id = ?', [
      exerciseId,
    ])!;
    const fallbackWeight = exercise.current_recommended_weight_kg ?? exercise.starting_weight_kg ?? 20;
    const { minReps } = parseRepRange(exercise.target_rep_range);

    // Look up actual historical sets performed from last completed workout
    const prevPerf = this.getLastPerformanceForExercise(exerciseId);

    const sets: PopulatedSet[] = [];
    for (let s = 1; s <= (exercise.target_sets || 3); s++) {
      const setId = `set_${weId}_${s}`;
      let initialWeight = fallbackWeight;
      let initialReps = minReps;
      let initialRir = 2;

      if (prevPerf.hasHistory && prevPerf.lastSets.length > 0) {
        const matchingPrevSet = prevPerf.lastSets.find((ls) => ls.setNumber === s) ||
          prevPerf.lastSets[prevPerf.lastSets.length - 1];
        if (matchingPrevSet) {
          initialWeight = matchingPrevSet.weightKg;
          initialReps = matchingPrevSet.reps;
          if (matchingPrevSet.rir !== null) initialRir = matchingPrevSet.rir;
        }
      }

      db.runSync(
        `INSERT INTO WorkoutSets (
          id, workout_exercise_id, set_number, weight_kg, reps, rir, is_completed, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [setId, weId, s, initialWeight, initialReps, initialRir, 0, now]
      );
      sets.push({
        id: setId,
        workout_exercise_id: weId,
        set_number: s,
        weight_kg: initialWeight,
        reps: initialReps,
        rir: initialRir,
        is_completed: 0,
        created_at: now,
      });
    }

    const we = db.getFirstSync<WorkoutExercise>('SELECT * FROM WorkoutExercises WHERE id = ?', [
      weId,
    ])!;
    return {
      workoutExercise: we,
      exercise,
      sets,
    };
  },

  /**
   * Finishes and archives an active workout session.
   * Runs the progressive overload calculations, updates Exercises records,
   * and synchronizes the session with DailyLogs.
   */
  finishSession(
    sessionId: string,
    data: {
      durationSeconds: number;
      difficultyPerceived?: 'Easy' | 'Good' | 'Hard' | 'Very hard' | null;
      notes?: string | null;
      painEntry?: {
        bodyArea: string;
        painLevel: number;
        notes?: string;
      };
    }
  ): PopulatedSession {
    const db = getDatabase();
    const now = new Date().toISOString();

    // 1. Auto-complete any sets that have reps > 0 for this session
    db.runSync(
      `UPDATE WorkoutSets SET is_completed = 1
       WHERE workout_exercise_id IN (SELECT id FROM WorkoutExercises WHERE session_id = ?)
       AND reps > 0`,
      [sessionId]
    );

    // 2. Calculate wall-clock duration from start_time if backgrounded / screen locked
    const sessionRow = db.getFirstSync<{ start_time: string }>(
      'SELECT start_time FROM WorkoutSessions WHERE id = ? LIMIT 1',
      [sessionId]
    );
    let finalDuration = data.durationSeconds;
    if (sessionRow?.start_time) {
      const startTimeMs = new Date(sessionRow.start_time).getTime();
      const endTimeMs = new Date(now).getTime();
      const elapsedWallClockSec = Math.round((endTimeMs - startTimeMs) / 1000);
      if (elapsedWallClockSec > finalDuration && elapsedWallClockSec < 43200) {
        finalDuration = elapsedWallClockSec;
      }
    }

    // Update session status
    db.runSync(
      `UPDATE WorkoutSessions SET
        status = 'completed',
        end_time = ?,
        duration_seconds = ?,
        difficulty_perceived = ?,
        notes = ?
       WHERE id = ?`,
      [
        now,
        finalDuration,
        data.difficultyPerceived ?? null,
        data.notes ?? null,
        sessionId,
      ]
    );

    // 3. Log pain if user reported discomfort
    if (data.painEntry && data.painEntry.painLevel > 0) {
      this.logPainEntry({
        date: getTodayDateString(),
        body_area: data.painEntry.bodyArea,
        pain_level: data.painEntry.painLevel,
        activity_context: 'Post-workout log',
        notes: data.painEntry.notes,
      });
    }

    // 4. Load full session and recent pain
    const populated = this.getPopulatedSession(sessionId);
    if (!populated) throw new Error('Session not found');

    const recentPain = this.getRecentPainEntries(7);

    // 4. Run progressive overload calculations for each exercise
    for (const item of populated.exercises) {
      const ex = item.exercise;
      const associatedBodyArea = getAssociatedBodyArea(ex.primary_muscle, ex.category);
      const matchingPain = recentPain.find(
        (p) => p.body_area.toLowerCase() === associatedBodyArea.toLowerCase()
      );

      const completedSets = item.sets
        .filter((s) => s.is_completed === 1)
        .map((s) => ({
          setNumber: s.set_number,
          weightKg: s.weight_kg,
          reps: s.reps,
          rir: s.rir ?? null,
          isCompleted: true,
        }));

      if (completedSets.length > 0) {
        const lastWeight = Math.max(...completedSets.map((s) => s.weightKg));
        const overloadResult = calculateProgressiveOverload({
          exerciseId: ex.id,
          exerciseName: ex.name,
          category: ex.category,
          primaryMuscle: ex.primary_muscle,
          targetSets: ex.target_sets,
          targetRepRange: ex.target_rep_range,
          lastWeightKg: lastWeight,
          completedSets,
          recentPainLevel: matchingPain ? matchingPain.pain_level : undefined,
          recentPainArea: matchingPain ? matchingPain.body_area : undefined,
        });

        // Update Exercises table with new progression recommendations
        db.runSync(
          `UPDATE Exercises SET
            last_weight_kg = ?,
            current_recommended_weight_kg = ?
           WHERE id = ?`,
          [lastWeight, overloadResult.recommendedWeightKg, ex.id]
        );
      }
    }

    // 5. Update DailyLogs for today to mark workout completed
    const sessionDate = populated.session.date;
    const existingLog = db.getFirstSync<{ id: string; soreness_rating: number }>(
      'SELECT id, soreness_rating FROM DailyLogs WHERE date = ? LIMIT 1',
      [sessionDate]
    );

    if (existingLog) {
      db.runSync(
        `UPDATE DailyLogs SET
          energy_rating = 8,
          updated_at = ?
         WHERE id = ?`,
        [now, existingLog.id]
      );
    }

    return populated;
  },

  /**
   * Removes an individual exercise and all its sets from an active session.
   */
  removeExerciseFromSession(workoutExerciseId: string): void {
    const db = getDatabase();
    db.runSync('DELETE FROM WorkoutSets WHERE workout_exercise_id = ?', [workoutExerciseId]);
    db.runSync('DELETE FROM WorkoutExercises WHERE id = ?', [workoutExerciseId]);
  },

  /**
   * Cancels and removes an active workout session.
   */
  cancelSession(sessionId: string): void {
    const db = getDatabase();
    db.runSync('DELETE FROM WorkoutSets WHERE workout_exercise_id IN (SELECT id FROM WorkoutExercises WHERE session_id = ?)', [sessionId]);
    db.runSync('DELETE FROM WorkoutExercises WHERE session_id = ?', [sessionId]);
    db.runSync('DELETE FROM WorkoutSessions WHERE id = ?', [sessionId]);
  },

  /**
   * Cancels and purges all active/in_progress sessions and their orphaned exercises and sets.
   */
  cancelAllActiveSessions(): void {
    const db = getDatabase();
    const activeSessions = db.getAllSync<{ id: string }>(
      "SELECT id FROM WorkoutSessions WHERE status = 'in_progress'"
    );
    for (const sess of activeSessions) {
      this.cancelSession(sess.id);
    }
    db.runSync("DELETE FROM WorkoutSets WHERE workout_exercise_id NOT IN (SELECT id FROM WorkoutExercises)");
    db.runSync("DELETE FROM WorkoutExercises WHERE session_id NOT IN (SELECT id FROM WorkoutSessions)");
  },

  /**
   * Retrieves past completed workout sessions.
   */
  getCompletedHistory(limit = 20): WorkoutSession[] {
    const db = getDatabase();
    return db.getAllSync<WorkoutSession>(
      `SELECT * FROM WorkoutSessions WHERE status = 'completed' ORDER BY date DESC, created_at DESC LIMIT ?`,
      [limit]
    );
  },

  /**
   * Retrieves past completed workout sessions fully populated with exercises, sets, volume, and reps.
   */
  getCompletedHistoryWithDetails(limit = 20): PopulatedSession[] {
    const sessions = this.getCompletedHistory(limit);
    return sessions
      .map((s) => this.getPopulatedSession(s.id))
      .filter((p): p is PopulatedSession => p !== null);
  },

  /**
   * Permanently deletes a workout session and its child exercises/sets.
   */
  deleteSession(sessionId: string): void {
    const db = getDatabase();
    db.runSync('DELETE FROM WorkoutSets WHERE workout_exercise_id IN (SELECT id FROM WorkoutExercises WHERE session_id = ?)', [sessionId]);
    db.runSync('DELETE FROM WorkoutExercises WHERE session_id = ?', [sessionId]);
    db.runSync('DELETE FROM WorkoutSessions WHERE id = ?', [sessionId]);
  },

  /**
   * Self-healing migration utility:
   * 1. Purges orphaned exercises and sets.
   * 2. Marks any sets with reps > 0 in completed sessions as completed.
   * 3. Recalculates and updates Exercises (last_weight_kg & recommended weight)
   *    so all completed exercises from previous workouts are properly reflected.
   */
  healCompletedWorkoutSets(): void {
    const db = getDatabase();
    try {
      // Purge phantom orphaned records from unstarted or abandoned sessions
      db.runSync('DELETE FROM WorkoutSets WHERE workout_exercise_id NOT IN (SELECT id FROM WorkoutExercises)');
      db.runSync('DELETE FROM WorkoutExercises WHERE session_id NOT IN (SELECT id FROM WorkoutSessions)');
      db.runSync('DELETE FROM WorkoutSets WHERE workout_exercise_id NOT IN (SELECT id FROM WorkoutExercises)');

      db.runSync(
        `UPDATE WorkoutSets SET is_completed = 1
         WHERE reps > 0
         AND (is_completed = 0 OR is_completed IS NULL)
         AND workout_exercise_id IN (
           SELECT we.id FROM WorkoutExercises we
           JOIN WorkoutSessions ws ON we.session_id = ws.id
           WHERE ws.status = 'completed'
         )`
      );

      const completed = this.getCompletedHistory(10);
      for (const sess of completed) {
        const pop = this.getPopulatedSession(sess.id);
        if (pop) {
          for (const item of pop.exercises) {
            const compSets = item.sets.filter((s) => s.is_completed === 1);
            if (compSets.length > 0) {
              const lastWeight = Math.max(...compSets.map((s) => s.weight_kg));
              const overload = calculateProgressiveOverload({
                exerciseId: item.exercise.id,
                exerciseName: item.exercise.name,
                category: item.exercise.category,
                primaryMuscle: item.exercise.primary_muscle,
                targetSets: item.exercise.target_sets,
                targetRepRange: item.exercise.target_rep_range,
                lastWeightKg: lastWeight,
                completedSets: compSets.map((s) => ({
                  setNumber: s.set_number,
                  weightKg: s.weight_kg,
                  reps: s.reps,
                  rir: s.rir ?? null,
                  isCompleted: true,
                })),
              });
              db.runSync(
                `UPDATE Exercises SET last_weight_kg = ?, current_recommended_weight_kg = ? WHERE id = ?`,
                [lastWeight, overload.recommendedWeightKg, item.exercise.id]
              );
            }
          }
        }
      }
    } catch (e) {
      console.warn('healCompletedWorkoutSets error:', e);
    }
  },

  /**
   * Logs a pain or fatigue entry.
   */
  logPainEntry(entry: {
    date: string;
    body_area: string;
    pain_level: number;
    activity_context?: string | null;
    notes?: string | null;
  }): PainEntry {
    const db = getDatabase();
    const id = `pain_${Date.now()}`;
    const now = new Date().toISOString();

    db.runSync(
      `INSERT INTO PainEntries (id, date, body_area, pain_level, activity_context, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        entry.date,
        entry.body_area,
        entry.pain_level,
        entry.activity_context ?? null,
        entry.notes ?? null,
        now,
      ]
    );

    return db.getFirstSync<PainEntry>('SELECT * FROM PainEntries WHERE id = ?', [id])!;
  },

  /**
   * Retrieves recent pain entries.
   */
  getRecentPainEntries(days = 14): PainEntry[] {
    const db = getDatabase();
    const cutoff = shiftDateString(getTodayDateString(), -days);
    return db.getAllSync<PainEntry>(
      'SELECT * FROM PainEntries WHERE date >= ? ORDER BY date DESC, created_at DESC',
      [cutoff]
    );
  },
};
