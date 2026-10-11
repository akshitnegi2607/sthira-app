/**
 * Sthira — Progress & Analytics Repository
 * SQLite queries and persistence for:
 * - Scale Weight history (WeightEntries)
 * - Goals & Calorie adaptation adjustments (Goals)
 * - Weekly reviews persistence (WeeklyReviews)
 * - Daily logs and workout sessions for correlation computations
 */

import { getDatabase } from '../db';
import {
  WeightEntry,
  WeeklyReview,
  DailyLog,
  Goals,
  UserProfile,
} from '../../types/database';
import { DailyLogsRepository } from './dailyLogsRepository';
import { ProfileRepository } from './profileRepository';

export interface ProgressSummary {
  currentWeight: number;
  startWeight: number;
  targetWeight: number;
  totalGainTarget: number;
  gainedSoFar: number;
  remainingKg: number;
  targetRatePerWeek: number;
}

export const ProgressRepository = {
  /**
   * Retrieves weight entries sorted chronologically (oldest to newest).
   */
  getWeightHistory(days?: number): WeightEntry[] {
    const db = getDatabase();
    let entries = db.getAllSync<WeightEntry>(
      'SELECT * FROM WeightEntries ORDER BY date ASC'
    );

    if (days !== undefined && days > 0) {
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      entries = entries.filter((e) => e.date >= cutoff);
    }

    return entries;
  },

  /**
   * Retrieves the most recent logged weight entry.
   */
  getLatestWeight(): WeightEntry | null {
    const db = getDatabase();
    return db.getFirstSync<WeightEntry>(
      'SELECT * FROM WeightEntries ORDER BY date DESC, created_at DESC LIMIT 1'
    );
  },

  /**
   * Logs a new scale weight measurement.
   * Updates:
   * 1. WeightEntries table
   * 2. DailyLogs.weight for the given date
   * 3. UserProfile.current_weight (if logging for today or latest)
   */
  logWeight(weightKg: number, dateStr?: string, notes?: string): WeightEntry {
    const db = getDatabase();
    const now = new Date().toISOString();
    const targetDate = dateStr || now.split('T')[0];
    const roundedWeight = Math.round(weightKg * 10) / 10;

    // Check if an entry already exists for this exact date
    const existing = db.getFirstSync<WeightEntry>(
      'SELECT * FROM WeightEntries WHERE date = ? LIMIT 1',
      [targetDate]
    );

    let entryId: string;
    if (existing) {
      entryId = existing.id;
      db.runSync(
        `UPDATE WeightEntries SET weight_kg = ?, notes = ? WHERE id = ?`,
        [roundedWeight, notes !== undefined ? notes : existing.notes, existing.id]
      );
    } else {
      entryId = `weight_${targetDate}_${Date.now()}`;
      db.runSync(
        `INSERT INTO WeightEntries (id, date, weight_kg, notes, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [entryId, targetDate, roundedWeight, notes ?? null, now]
      );
    }

    // Synchronize DailyLogs for this date
    DailyLogsRepository.updateDailyLog(targetDate, {
      weight: roundedWeight,
    });

    // If target date is today or latest, update UserProfile.current_weight
    const todayStr = now.split('T')[0];
    if (targetDate >= todayStr) {
      ProfileRepository.updateProfile({
        current_weight: roundedWeight,
      });
    }

    return (
      db.getFirstSync<WeightEntry>('SELECT * FROM WeightEntries WHERE id = ?', [
        entryId,
      ]) || {
        id: entryId,
        date: targetDate,
        weight_kg: roundedWeight,
        notes: notes ?? null,
        created_at: now,
      }
    );
  },

  /**
   * Deletes a weight entry by ID.
   */
  deleteWeight(id: string): void {
    const db = getDatabase();
    db.runSync('DELETE FROM WeightEntries WHERE id = ?', [id]);
  },

  /**
   * Applies an incremental caloric target adjustment to Goals table.
   * E.g. deltaKcal = +125 or -100.
   */
  applyCalorieAdjustment(deltaKcal: number): Goals {
    const goals = ProfileRepository.getGoals();
    if (!goals) throw new Error('Goals record not found');

    const newTarget = Math.round(goals.calories_target + deltaKcal);
    ProfileRepository.updateGoals({
      calories_target: newTarget,
    });

    return ProfileRepository.getGoals()!;
  },

  /**
   * Retrieves daily logs for a given lookback period.
   */
  getDailyLogsForPeriod(days = 30): DailyLog[] {
    const db = getDatabase();
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const logs = db.getAllSync<DailyLog>(
      'SELECT * FROM DailyLogs ORDER BY date ASC'
    );
    return logs.filter((l) => l.date >= cutoff);
  },

  /**
   * Retrieves completed workout sessions with calculated total volume.
   */
  getWorkoutSessionsWithVolume(days = 30): Array<{
    date: string;
    duration_seconds?: number;
    difficulty_perceived?: string | null;
    totalVolumeKg: number;
  }> {
    const db = getDatabase();
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    // Get all completed sessions in period
    const sessions = db.getAllSync<{
      id: string;
      date: string;
      duration_seconds: number;
      difficulty_perceived: string | null;
    }>(
      `SELECT id, date, duration_seconds, difficulty_perceived FROM WorkoutSessions WHERE status = 'completed' ORDER BY date ASC`
    );

    const relevantSessions = sessions.filter((s) => s.date >= cutoff);

    // Compute volume for each session
    return relevantSessions.map((sess) => {
      // Find all completed sets for this session
      const exercises = db.getAllSync<{ id: string }>(
        'SELECT id FROM WorkoutExercises WHERE session_id = ?',
        [sess.id]
      );

      let totalVolume = 0;
      for (const ex of exercises) {
        const sets = db.getAllSync<{ weight_kg: number; reps: number; is_completed: number }>(
          'SELECT weight_kg, reps, is_completed FROM WorkoutSets WHERE workout_exercise_id = ?',
          [ex.id]
        );
        for (const set of sets) {
          if (set.is_completed === 1) {
            totalVolume += set.weight_kg * set.reps;
          }
        }
      }

      return {
        date: sess.date,
        duration_seconds: sess.duration_seconds,
        difficulty_perceived: sess.difficulty_perceived,
        totalVolumeKg: Math.round(totalVolume * 10) / 10,
      };
    });
  },

  /**
   * Retrieves past weekly reviews.
   */
  getWeeklyReviews(): WeeklyReview[] {
    const db = getDatabase();
    return db.getAllSync<WeeklyReview>(
      'SELECT * FROM WeeklyReviews ORDER BY end_date DESC'
    );
  },

  /**
   * Saves a weekly review to the database.
   */
  saveWeeklyReview(
    review: Omit<WeeklyReview, 'id' | 'created_at'>
  ): WeeklyReview {
    const db = getDatabase();
    const now = new Date().toISOString();
    const id = `rev_${review.start_date}_${review.end_date}`;

    db.runSync(
      `INSERT INTO WeeklyReviews (
        id, start_date, end_date, start_weight, end_weight, weight_change,
        avg_calories, avg_protein, workouts_completed, exercises_progressed,
        avg_sleep_hours, coach_summary, calorie_target_recommendation, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        review.start_date,
        review.end_date,
        review.start_weight ?? null,
        review.end_weight ?? null,
        review.weight_change ?? null,
        review.avg_calories ?? null,
        review.avg_protein ?? null,
        review.workouts_completed ?? null,
        review.exercises_progressed ?? null,
        review.avg_sleep_hours ?? null,
        review.coach_summary ?? null,
        review.calorie_target_recommendation ?? null,
        now,
      ]
    );

    return db.getFirstSync<WeeklyReview>(
      'SELECT * FROM WeeklyReviews WHERE id = ?',
      [id]
    )!;
  },
};
