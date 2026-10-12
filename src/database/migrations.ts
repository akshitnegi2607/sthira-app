import { getDatabase } from './db';
import { CREATE_TABLES_SQL } from './schema';
import { INITIAL_USER_PROFILE, INITIAL_GOALS } from '../constants/initialProfile';
import { INITIAL_EXERCISES, INITIAL_WORKOUT_PLANS } from '../constants/initialWorkouts';
import { INITIAL_FOOD_DATABASE } from '../constants/initialFoods';
import { INITIAL_CUISINE_RECIPES } from '../constants/initialRecipes';
import { WorkoutRepository } from './repositories/workoutRepository';

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

  // 4. Seed exercises if not present
  const exercisesRow = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM Exercises'
  );

  if (!exercisesRow || exercisesRow.count === 0) {
    const now = new Date().toISOString();
    for (const ex of INITIAL_EXERCISES) {
      db.runSync(
        `INSERT INTO Exercises (
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
  }

  // 5. Seed workout plans if not present
  const plansRow = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM WorkoutPlans'
  );

  if (!plansRow || plansRow.count === 0) {
    const now = new Date().toISOString();
    for (const plan of INITIAL_WORKOUT_PLANS) {
      db.runSync(
        `INSERT INTO WorkoutPlans (
          id, name, day_of_week, description, is_active, created_at
        ) VALUES (?, ?, ?, ?, 1, ?)`,
        [plan.id, plan.name, plan.day_of_week, plan.description, now]
      );
    }
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
}

/**
 * Ensures the database has zero fake historical data before today
 * and establishes today as the clean official Day 1 with Jay's scale weight (65.8 kg).
 */
export function cleanPastDummyDataAndSetBaseline(startingWeightKg = 65.8) {
  const db = getDatabase();
  const now = new Date().toISOString();
  const todayStr = now.split('T')[0];

  try {
    // 1. Wipe all mock past entries before today
    db.runSync('DELETE FROM WeightEntries WHERE date < ?', [todayStr]);
    db.runSync('DELETE FROM DailyLogs WHERE date < ?', [todayStr]);
    db.runSync('DELETE FROM MealEntries WHERE date < ?', [todayStr]);
    db.runSync('DELETE FROM NutritionEstimates WHERE meal_entry_id NOT IN (SELECT id FROM MealEntries)');
    db.runSync('DELETE FROM WaterEntries WHERE date < ?', [todayStr]);
    db.runSync('DELETE FROM SleepEntries WHERE date < ?', [todayStr]);
    db.runSync('DELETE FROM JournalEntries WHERE date < ?', [todayStr]);
    db.runSync('DELETE FROM PainEntries WHERE date < ?', [todayStr]);
    db.runSync("DELETE FROM WorkoutSessions WHERE id LIKE 'sess_hist_%' OR date < ?", [todayStr]);
    db.runSync("DELETE FROM WorkoutExercises WHERE session_id NOT IN (SELECT id FROM WorkoutSessions)");
    db.runSync("DELETE FROM WorkoutSets WHERE workout_exercise_id NOT IN (SELECT id FROM WorkoutExercises)");

    // 2. Set Jay's real starting baseline in UserProfile
    db.runSync(
      `UPDATE UserProfile SET
        current_weight = ?,
        target_weight = 67.0,
        updated_at = ?
       WHERE id = 'user_primary'`,
      [startingWeightKg, now]
    );

    // 3. Set or update today's scale weight marker in WeightEntries
    const existingWeight = db.getFirstSync<{ id: string }>(
      'SELECT id FROM WeightEntries WHERE date = ?',
      [todayStr]
    );
    if (existingWeight) {
      db.runSync(
        'UPDATE WeightEntries SET weight_kg = ?, notes = ? WHERE date = ?',
        [startingWeightKg, 'Evening scale weigh-in marker (Day 1 baseline)', todayStr]
      );
    } else {
      db.runSync(
        `INSERT INTO WeightEntries (id, date, weight_kg, notes, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [`weight_${todayStr}`, todayStr, startingWeightKg, 'Evening scale weigh-in marker (Day 1 baseline)', now]
      );
    }

    // 4. Ensure DailyLogs for today has Jay's 65.8 kg weight
    const existingTodayLog = db.getFirstSync<{ id: string }>(
      'SELECT id FROM DailyLogs WHERE date = ?',
      [todayStr]
    );
    if (existingTodayLog) {
      db.runSync('UPDATE DailyLogs SET weight = ?, updated_at = ? WHERE date = ?', [startingWeightKg, now, todayStr]);
    } else {
      db.runSync(
        `INSERT INTO DailyLogs (
          id, date, calories_consumed, protein_consumed, carbs_consumed,
          fat_consumed, water_liters, weight, energy_rating, coach_status,
          coach_summary, created_at, updated_at
        ) VALUES (?, ?, 0, 0, 0, 0, 0, ?, 8, 'ON TRACK', 'Day 1 of Sthira. Starting strong at 65.8 kg!', ?, ?)`,
        [`log_${todayStr}`, todayStr, startingWeightKg, now, now]
      );
    }
  } catch (e) {
    console.warn('cleanPastDummyDataAndSetBaseline error:', e);
  }
}
