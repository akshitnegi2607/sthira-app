import { getDatabase } from '../db';
import { UserProfile, Goals } from '@/types/database';

export const ProfileRepository = {
  getProfile(): UserProfile | null {
    const db = getDatabase();
    return db.getFirstSync<UserProfile>('SELECT * FROM UserProfile LIMIT 1');
  },

  getGoals(): Goals | null {
    const db = getDatabase();
    return db.getFirstSync<Goals>('SELECT * FROM Goals LIMIT 1');
  },

  updateProfile(profile: Partial<UserProfile>): void {
    const db = getDatabase();
    const current = this.getProfile();
    if (!current) return;

    const merged = { ...current, ...profile, updated_at: new Date().toISOString() };

    db.runSync(
      `UPDATE UserProfile SET
        name = ?, current_weight = ?, height = ?, target_weight = ?,
        goal_type = ?, target_rate_kg_per_week = ?, diet_type = ?,
        eats_eggs = ?, eats_onion = ?, eats_garlic = ?, eats_mushrooms = ?,
        cuisine_preferences = ?, gym_days_per_week = ?, tuesday_activity = ?,
        sunday_activity = ?, saturday_rest = ?, updated_at = ?
      WHERE id = ?`,
      [
        merged.name,
        merged.current_weight,
        merged.height,
        merged.target_weight,
        merged.goal_type,
        merged.target_rate_kg_per_week,
        merged.diet_type,
        merged.eats_eggs,
        merged.eats_onion,
        merged.eats_garlic,
        merged.eats_mushrooms,
        merged.cuisine_preferences,
        merged.gym_days_per_week,
        merged.tuesday_activity,
        merged.sunday_activity,
        merged.saturday_rest,
        merged.updated_at,
        current.id,
      ]
    );
  },

  updateGoals(goals: Partial<Goals>): void {
    const db = getDatabase();
    const current = this.getGoals();
    if (!current) return;

    const merged = { ...current, ...goals, updated_at: new Date().toISOString() };

    db.runSync(
      `UPDATE Goals SET
        calories_target = ?, protein_target_min = ?, protein_target_max = ?,
        fat_target_min = ?, fat_target_max = ?, carbs_target = ?,
        water_target_liters = ?, sleep_hours_target = ?, workout_days_target = ?,
        updated_at = ?
      WHERE id = ?`,
      [
        merged.calories_target,
        merged.protein_target_min,
        merged.protein_target_max,
        merged.fat_target_min,
        merged.fat_target_max,
        merged.carbs_target,
        merged.water_target_liters,
        merged.sleep_hours_target,
        merged.workout_days_target,
        merged.updated_at,
        current.id,
      ]
    );
  },
};
