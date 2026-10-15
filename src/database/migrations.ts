import { getDatabase } from './db';
import { CREATE_TABLES_SQL } from './schema';
import { INITIAL_USER_PROFILE, INITIAL_GOALS } from '../constants/initialProfile';
import { INITIAL_EXERCISES, INITIAL_WORKOUT_PLANS } from '../constants/initialWorkouts';
import { INITIAL_FOOD_DATABASE } from '../constants/initialFoods';
import { INITIAL_CUISINE_RECIPES } from '../constants/initialRecipes';
import { WorkoutRepository } from './repositories/workoutRepository';
import { getTodayDateString } from '../utils/date';

export function runMigrations() {
  const db = getDatabase();

  // 1. Create all 22 tables and indexes
  db.execSync(CREATE_TABLES_SQL);

  // 2. Seed initial profile if not present
  const profileRow = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM UserProfile'
  );

  if (!profileRow || profileRow.count === 0) {
    db.runSync(
      `INSERT INTO UserProfile (
        id, name, current_weight, height, target_weight, goal_type,
        target_rate_kg_per_week, diet_type, eats_eggs, eats_onion,
        eats_garlic, eats_mushrooms, cuisine_preferences, gym_days_per_week,
        tuesday_activity, sunday_activity, saturday_rest, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        INITIAL_USER_PROFILE.id,
        INITIAL_USER_PROFILE.name,
        INITIAL_USER_PROFILE.current_weight,
        INITIAL_USER_PROFILE.height,
        INITIAL_USER_PROFILE.target_weight,
        INITIAL_USER_PROFILE.goal_type,
        INITIAL_USER_PROFILE.target_rate_kg_per_week,
        INITIAL_USER_PROFILE.diet_type,
        INITIAL_USER_PROFILE.eats_eggs,
        INITIAL_USER_PROFILE.eats_onion,
        INITIAL_USER_PROFILE.eats_garlic,
        INITIAL_USER_PROFILE.eats_mushrooms,
        INITIAL_USER_PROFILE.cuisine_preferences,
        INITIAL_USER_PROFILE.gym_days_per_week,
        INITIAL_USER_PROFILE.tuesday_activity,
        INITIAL_USER_PROFILE.sunday_activity,
        INITIAL_USER_PROFILE.saturday_rest,
        INITIAL_USER_PROFILE.created_at,
        INITIAL_USER_PROFILE.updated_at,
      ]
    );
  }

  // 3. Seed initial goals if not present
  const goalsRow = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM Goals'
  );

  if (!goalsRow || goalsRow.count === 0) {
    db.runSync(
      `INSERT INTO Goals (
        id, calories_target, protein_target_min, protein_target_max,
        fat_target_min, fat_target_max, carbs_target, water_target_liters,
        sleep_hours_target, workout_days_target, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        INITIAL_GOALS.id,
        INITIAL_GOALS.calories_target,
        INITIAL_GOALS.protein_target_min,
        INITIAL_GOALS.protein_target_max,
        INITIAL_GOALS.fat_target_min,
        INITIAL_GOALS.fat_target_max,
        INITIAL_GOALS.carbs_target,
        INITIAL_GOALS.water_target_liters,
        INITIAL_GOALS.sleep_hours_target,
        INITIAL_GOALS.workout_days_target,
        INITIAL_GOALS.created_at,
        INITIAL_GOALS.updated_at,
      ]
    );
  }

  // 4. Seed and sync exercises
  const now = new Date().toISOString();
  for (const ex of INITIAL_EXERCISES) {
    db.runSync(
      `INSERT OR REPLACE INTO Exercises (
        id, name, category, primary_muscle, secondary_muscles,
        equipment, difficulty_level, target_sets, target_rep_range,
        rest_seconds, instructions, common_mistakes, substitutions,
        starting_weight_kg, last_weight_kg, current_recommended_weight_kg,
        is_custom, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
      [
        ex.id,
        ex.name,
        ex.category,
        ex.primary_muscle,
        ex.secondary_muscles,
        ex.equipment,
        ex.difficulty_level,
        ex.target_sets,
        ex.target_rep_range,
        ex.rest_seconds,
        ex.instructions,
        ex.common_mistakes,
        ex.substitutions,
        ex.starting_weight_kg ?? null,
        ex.last_weight_kg ?? null,
        ex.current_recommended_weight_kg ?? null,
        now,
      ]
    );
  }

  // 5. Seed and sync workout plans
  for (const plan of INITIAL_WORKOUT_PLANS) {
    db.runSync(
      `INSERT OR REPLACE INTO WorkoutPlans (
        id, name, day_of_week, description, is_active, created_at
      ) VALUES (?, ?, ?, ?, 1, ?)`,
      [plan.id, plan.name, plan.day_of_week, plan.description, now]
    );
  }

  // 6. Seed initial foods if not present
  const foodsRow = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM FoodItems'
  );

  if (!foodsRow || foodsRow.count === 0) {
    const now = new Date().toISOString();
    for (const food of INITIAL_FOOD_DATABASE) {
      db.runSync(
        `INSERT INTO FoodItems (
          id, name, category, serving_size, serving_unit, serving_grams,
          calories, protein, carbs, fat, fiber, is_custom, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
        [
          food.id,
          food.name,
          food.category,
          food.serving_size,
          food.serving_unit,
          food.serving_grams,
          food.calories,
          food.protein,
          food.carbs,
          food.fat,
          food.fiber,
          now,
        ]
      );
    }
  }

  // 7. Seed initial cuisine recipes if not present
  const recipesRow = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM CuisineRecipes'
  );

  if (!recipesRow || recipesRow.count === 0) {
    const now = new Date().toISOString();
    for (const recipe of INITIAL_CUISINE_RECIPES) {
      db.runSync(
        `INSERT INTO CuisineRecipes (
          id, cuisine, title, description, estimated_calories, estimated_protein,
          estimated_carbs, estimated_fat, ingredients_json, instructions,
          is_vegetarian, has_eggs, has_onion, has_garlic, has_mushrooms, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          recipe.id,
          recipe.cuisine,
          recipe.title,
          recipe.description,
          recipe.estimated_calories,
          recipe.estimated_protein,
          recipe.estimated_carbs,
          recipe.estimated_fat,
          JSON.stringify(recipe.ingredients),
          recipe.instructions.join('\n'),
          recipe.is_vegetarian,
          recipe.has_eggs,
          recipe.has_onion,
          recipe.has_garlic,
          recipe.has_mushrooms,
          now,
        ]
      );
    }
  }

  // 8. Clean any past dummy data and establish today as Day 1 with Jay's baseline (65.8 kg)
  cleanPastDummyDataAndSetBaseline(65.8);

  // 9. Run self-healing check on completed workout sets and progressions
  WorkoutRepository.healCompletedWorkoutSets();

  // 10. Ensure Jay's missed Tuesday Yoga session (2026-10-13) is logged
  try {
    const tuesdayYogaSession = db.getFirstSync<{ id: string }>(
      "SELECT id FROM WorkoutSessions WHERE date = '2026-10-13' AND (workout_plan_id = 'plan_tue_yoga' OR title LIKE '%Yoga%')"
    );

    if (!tuesdayYogaSession) {
      const sessionId = 'session_tue_yoga_20261013';
      const sessionTime = '2026-10-13T08:45:00.000Z';
      db.runSync(
        `INSERT OR REPLACE INTO WorkoutSessions (
          id, date, workout_plan_id, title, start_time, end_time, duration_seconds,
          status, difficulty_perceived, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sessionId,
          '2026-10-13',
          'plan_tue_yoga',
          'Yoga & Mobility',
          '2026-10-13T08:00:00.000Z',
          '2026-10-13T08:45:00.000Z',
          2700, // 45 mins
          'completed',
          'Good',
          'Full body mobility, hip openers, spine decompression and breathing work.',
          sessionTime,
        ]
      );

      try {
        db.runSync(
          `INSERT INTO DailyLogs (date, recovery_rating, coach_status, coach_summary, updated_at)
           VALUES ('2026-10-13', 8, 'on_track', 'Active recovery yoga completed. Restored joint mobility and lowered sympathetic stress.', ?)
           ON CONFLICT(date) DO UPDATE SET
             recovery_rating = COALESCE(DailyLogs.recovery_rating, 8),
             updated_at = excluded.updated_at`,
          [sessionTime]
        );
      } catch {}
    }
  } catch (yogaErr) {
    console.warn('Could not auto-log Tuesday Yoga session:', yogaErr);
  }
}

export function cleanPastDummyDataAndSetBaseline(startingWeightKg = 65.8) {
  // Baseline migration was completed during initial release.
  // Preserving all user data across all dates — never delete real entries!
  return;
}


