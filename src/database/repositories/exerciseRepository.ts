import { getDatabase } from '../db';
import { Exercise, WorkoutPlan } from '@/types/database';

export const ExerciseRepository = {
  getAllExercises(): Exercise[] {
    const db = getDatabase();
    return db.getAllSync<Exercise>('SELECT * FROM Exercises ORDER BY category ASC, name ASC');
  },

  getExercisesByCategory(category: string): Exercise[] {
    const db = getDatabase();
    return db.getAllSync<Exercise>('SELECT * FROM Exercises WHERE category = ?', [category]);
  },

  getAllWorkoutPlans(): WorkoutPlan[] {
    const db = getDatabase();
    return db.getAllSync<WorkoutPlan>('SELECT * FROM WorkoutPlans ORDER BY day_of_week ASC');
  },

  getTodayPlan(): WorkoutPlan | null {
    const db = getDatabase();
    const dayOfWeek = new Date().getDay(); // 0 is Sunday, 1 is Monday...
    return db.getFirstSync<WorkoutPlan>(
      'SELECT * FROM WorkoutPlans WHERE day_of_week = ? LIMIT 1',
      [dayOfWeek]
    );
  },
};
