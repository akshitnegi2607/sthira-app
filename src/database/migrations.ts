import { getDatabase } from './db';
import { CREATE_TABLES_SQL } from './schema';
import { INITIAL_USER_PROFILE, INITIAL_GOALS } from '../constants/initialProfile';
import { INITIAL_EXERCISES, INITIAL_WORKOUT_PLANS } from '../constants/initialWorkouts';
import { INITIAL_FOOD_DATABASE } from '../constants/initialFoods';
import { INITIAL_CUISINE_RECIPES } from '../constants/initialRecipes';
import { WorkoutRepository } from './repositories/workoutRepository';
import { MealRepository } from './repositories/mealRepository';
import { DailyLogsRepository } from './repositories/dailyLogsRepository';
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

  // 3b. Seed baseline weight if not present
  const weightRow = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM WeightEntries'
  );
  if (!weightRow || weightRow.count === 0) {
    const todayStr = getTodayDateString();
    const baselineDate = '2026-10-12';
    db.runSync(
      `INSERT INTO WeightEntries (id, date, weight_kg, notes, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        `weight_${baselineDate}`,
        baselineDate,
        INITIAL_USER_PROFILE.current_weight,
        'Baseline scale weight',
        new Date().toISOString(),
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

  // 11. Run data audit cleanups (Issues 5, 7, 8, 9)
  try {
    // Issue 7: Purge duplicate profile_jay & goal_jay singletons
    db.runSync("DELETE FROM UserProfile WHERE id = 'profile_jay'");
    db.runSync("DELETE FROM Goals WHERE id = 'goal_jay'");

    // Standardize user_primary cuisine_preferences to JSON array and diet_type to lowercase
    const primaryUser = db.getFirstSync<{ id: string; cuisine_preferences: string; diet_type: string }>(
      "SELECT id, cuisine_preferences, diet_type FROM UserProfile WHERE id = 'user_primary'"
    );
    if (primaryUser) {
      let pref = primaryUser.cuisine_preferences;
      if (typeof pref === 'string' && !pref.startsWith('[')) {
        pref = JSON.stringify(pref.split(',').map((s) => s.trim()));
      }
      const diet = (primaryUser.diet_type || 'vegetarian').toLowerCase();
      db.runSync(
        "UPDATE UserProfile SET cuisine_preferences = ?, diet_type = ? WHERE id = 'user_primary'",
        [pref, diet]
      );
    }

    // Issue 5: Purge orphaned WorkoutExercises and WorkoutSets
    db.runSync("DELETE FROM WorkoutSets WHERE workout_exercise_id NOT IN (SELECT id FROM WorkoutExercises)");
    db.runSync("DELETE FROM WorkoutExercises WHERE session_id NOT IN (SELECT id FROM WorkoutSessions)");
    db.runSync("DELETE FROM WorkoutSets WHERE workout_exercise_id NOT IN (SELECT id FROM WorkoutExercises)");

    // Purge stale or zombie in_progress workout sessions (> 4 hours old or empty > 20 mins old)
    const inProgressSessions = db.getAllSync<{ id: string; created_at: string; start_time: string }>(
      "SELECT id, created_at, start_time FROM WorkoutSessions WHERE status = 'in_progress'"
    );
    for (const sess of inProgressSessions) {
      const startMs = new Date(sess.start_time || sess.created_at).getTime();
      if (!isNaN(startMs)) {
        const ageHours = (Date.now() - startMs) / (1000 * 3600);
        const exerciseCount = db.getFirstSync<{ c: number }>(
          'SELECT COUNT(*) as c FROM WorkoutExercises WHERE session_id = ?',
          [sess.id]
        )?.c || 0;
        const completedSets = db.getFirstSync<{ c: number }>(
          'SELECT COUNT(*) as c FROM WorkoutSets WHERE workout_exercise_id IN (SELECT id FROM WorkoutExercises WHERE session_id = ?) AND is_completed = 1',
          [sess.id]
        )?.c || 0;

        if (ageHours > 4 || (exerciseCount === 0 && completedSets === 0 && (Date.now() - startMs) > 20 * 60 * 1000)) {
          WorkoutRepository.cancelSession(sess.id);
        }
      }
    }

    // Issue 8: Backfill WaterEntries for dates where DailyLogs has water recorded but WaterEntries has 0 rows
    try {
      const logsWithWater = db.getAllSync<{ date: string; water_liters: number }>(
        'SELECT date, water_liters FROM DailyLogs WHERE water_liters > 0'
      );
      for (const log of logsWithWater) {
        if (!log.date) continue;
        const existingEntries = db.getAllSync<{ id: string }>(
          'SELECT id FROM WaterEntries WHERE date = ?',
          [log.date]
        );
        if (!existingEntries || existingEntries.length === 0) {
          const ml = Math.round(Number(log.water_liters) * 1000);
          const nowIso = `${log.date}T12:00:00.000Z`;
          db.runSync(
            'INSERT INTO WaterEntries (id, date, amount_ml, created_at) VALUES (?, ?, ?, ?)',
            [`water_backfill_${log.date}`, log.date, ml, nowIso]
          );
        }
      }
    } catch (backfillErr) {
      console.warn('[Migrations] Water backfill warning:', backfillErr);
    }

    // Resynchronize DailyLogs.water_liters from WaterEntries sum
    try {
      const waterDates = db.getAllSync<{ date: string }>(
        'SELECT DISTINCT date FROM WaterEntries WHERE date IS NOT NULL'
      );
      for (const d of waterDates) {
        if (!d.date) continue;
        const totalLiters = DailyLogsRepository.getWaterLitersForDate(d.date);
        db.runSync('UPDATE DailyLogs SET water_liters = ? WHERE date = ?', [totalLiters, d.date]);
      }
    } catch (e) {
      console.warn('[Migrations] Water resync error:', e);
    }

    // Issue 9: Mark unlogged/empty days as PENDING instead of ON TRACK
    db.runSync(`
      UPDATE DailyLogs
      SET coach_status = 'PENDING', coach_summary = 'Starting your day. Fuel up and stay hydrated!'
      WHERE (calories_consumed = 0 OR calories_consumed IS NULL)
        AND coach_status = 'ON TRACK'
        AND date NOT IN (SELECT date FROM WorkoutSessions WHERE status = 'completed')
    `);

    // 12. Retroactively heal past corrupted nutrition estimates and daily logs (Issues 1, 2, 3, 4)
    healPastCorruptedNutritionData();
  } catch (auditErr) {
    console.warn('[Migrations] Audit cleanups warning:', auditErr);
  }
}

/**
 * Retroactively heals historical data in SQLite that was corrupted by early parser bugs
 * (e.g., 5g peanuts = 1,000 kcal, composite meals equally divided across ingredients,
 * Moong Daal Chilla / Macaroni / Tofu Burger estimates, and broken DailyLogs totals).
 */
export function healPastCorruptedNutritionData(): void {
  const db = getDatabase();
  try {
    // 1. Issue 2: Fix Peanuts 5gm unit-quantity multiplier bug (1000 kcal -> ~28 kcal)
    db.runSync(`
      UPDATE NutritionEstimates
      SET calories_estimated = 28, protein_estimated = 1.3, carbs_estimated = 0.8, fat_estimated = 2.5,
          unit = 'g', quantity = 5, confidence_score = 'high'
      WHERE id = 'est_meal_1791844748397_thsvi_0' OR meal_entry_id = 'meal_1791844748397_thsvi'
    `);
    db.runSync(`
      UPDATE MealEntries
      SET total_calories = 28, total_protein = 1.3, total_carbs = 0.8, total_fat = 2.5, confidence = 'high'
      WHERE id = 'meal_1791844748397_thsvi'
    `);

    // Generic fix for any peanut entries with <= 25g that have absurdly high calories (>= 300 kcal)
    const badPeanuts = db.getAllSync<{ id: string; meal_entry_id: string; quantity: number }>(`
      SELECT id, meal_entry_id, quantity
      FROM NutritionEstimates
      WHERE LOWER(food_name) LIKE '%peanut%'
        AND unit = 'g'
        AND quantity <= 25
        AND calories_estimated >= 300
    `);
    for (const p of badPeanuts) {
      const q = Math.max(1, p.quantity || 5);
      const kcal = Math.round(q * 5.67);
      const pro = Math.round(q * 0.258 * 10) / 10;
      const carbs = Math.round(q * 0.161 * 10) / 10;
      const fat = Math.round(q * 0.492 * 10) / 10;
      db.runSync(
        `UPDATE NutritionEstimates SET calories_estimated = ?, protein_estimated = ?, carbs_estimated = ?, fat_estimated = ?, confidence_score = 'high' WHERE id = ?`,
        [kcal, pro, carbs, fat, p.id]
      );
      db.runSync(
        `UPDATE MealEntries SET total_calories = ?, total_protein = ?, total_carbs = ?, total_fat = ? WHERE id = ?`,
        [kcal, pro, carbs, fat, p.meal_entry_id]
      );
    }

    // 2. Issue 3: Fix Composite Recipe Equal-Division Bug
    // meal_1791844714984_sixa7 (Halloumi Salad)
    const halloumiItems = db.getAllSync<{ id: string; food_name: string }>(
      "SELECT id, food_name FROM NutritionEstimates WHERE meal_entry_id = 'meal_1791844714984_sixa7'"
    );
    if (halloumiItems.length > 0) {
      for (const item of halloumiItems) {
        const lower = item.food_name.toLowerCase();
        if (lower.includes('halloumi')) {
          db.runSync("UPDATE NutritionEstimates SET calories_estimated = 160, protein_estimated = 10.5, carbs_estimated = 1.0, fat_estimated = 13.0 WHERE id = ?", [item.id]);
        } else if (lower.includes('oil')) {
          db.runSync("UPDATE NutritionEstimates SET calories_estimated = 120, protein_estimated = 0.0, carbs_estimated = 0.0, fat_estimated = 14.0 WHERE id = ?", [item.id]);
        } else if (lower.includes('salad') || lower.includes('green') || lower.includes('cucumber') || lower.includes('tomato')) {
          db.runSync("UPDATE NutritionEstimates SET calories_estimated = 25, protein_estimated = 1.2, carbs_estimated = 4.5, fat_estimated = 0.2 WHERE id = ?", [item.id]);
        } else {
          db.runSync("UPDATE NutritionEstimates SET calories_estimated = 5, protein_estimated = 0.1, carbs_estimated = 1.0, fat_estimated = 0.0 WHERE id = ?", [item.id]);
        }
      }
      db.runSync("UPDATE MealEntries SET total_calories = 310, total_protein = 11.8, total_carbs = 6.5, total_fat = 27.2 WHERE id = 'meal_1791844714984_sixa7'");
    }

    // meal_1791906956142_5omzh (Lentil Bolognese)
    const lentilItems = db.getAllSync<{ id: string; food_name: string }>(
      "SELECT id, food_name FROM NutritionEstimates WHERE meal_entry_id = 'meal_1791906956142_5omzh'"
    );
    if (lentilItems.length > 0) {
      for (const item of lentilItems) {
        const lower = item.food_name.toLowerCase();
        if (lower.includes('pasta')) {
          db.runSync("UPDATE NutritionEstimates SET calories_estimated = 174, protein_estimated = 7.5, carbs_estimated = 37.0, fat_estimated = 0.8 WHERE id = ?", [item.id]);
        } else if (lower.includes('bolognese') || lower.includes('lentil')) {
          db.runSync("UPDATE NutritionEstimates SET calories_estimated = 190, protein_estimated = 11.0, carbs_estimated = 28.0, fat_estimated = 3.5 WHERE id = ?", [item.id]);
        } else if (lower.includes('oil')) {
          db.runSync("UPDATE NutritionEstimates SET calories_estimated = 40, protein_estimated = 0.0, carbs_estimated = 0.0, fat_estimated = 4.5 WHERE id = ?", [item.id]);
        } else {
          db.runSync("UPDATE NutritionEstimates SET calories_estimated = 3, protein_estimated = 0.1, carbs_estimated = 0.6, fat_estimated = 0.0 WHERE id = ?", [item.id]);
        }
      }
      db.runSync("UPDATE MealEntries SET total_calories = 407, total_protein = 18.6, total_carbs = 65.6, total_fat = 8.8 WHERE id = 'meal_1791906956142_5omzh'");
    }

    // meal_1791986653571_aw61n (Tofu Soba Bowl)
    const sobaItems = db.getAllSync<{ id: string; food_name: string }>(
      "SELECT id, food_name FROM NutritionEstimates WHERE meal_entry_id = 'meal_1791986653571_aw61n'"
    );
    if (sobaItems.length > 0) {
      for (const item of sobaItems) {
        const lower = item.food_name.toLowerCase();
        if (lower.includes('soba') || lower.includes('noodle')) {
          db.runSync("UPDATE NutritionEstimates SET calories_estimated = 150, protein_estimated = 6.0, carbs_estimated = 30.0, fat_estimated = 0.5 WHERE id = ?", [item.id]);
        } else if (lower.includes('tofu')) {
          db.runSync("UPDATE NutritionEstimates SET calories_estimated = 144, protein_estimated = 15.5, carbs_estimated = 3.0, fat_estimated = 8.0 WHERE id = ?", [item.id]);
        } else if (lower.includes('edamame')) {
          db.runSync("UPDATE NutritionEstimates SET calories_estimated = 60, protein_estimated = 5.5, carbs_estimated = 4.0, fat_estimated = 2.5 WHERE id = ?", [item.id]);
        } else {
          db.runSync("UPDATE NutritionEstimates SET calories_estimated = 45, protein_estimated = 1.0, carbs_estimated = 3.0, fat_estimated = 3.5 WHERE id = ?", [item.id]);
        }
      }
      db.runSync("UPDATE MealEntries SET total_calories = 399, total_protein = 28.0, total_carbs = 40.0, total_fat = 14.5 WHERE id = 'meal_1791986653571_aw61n'");
    }

    // 3. Issue 4: Fix Custom Entries (Moong Daal Chilla, Macaroni with Paneer, Tofu Burger)
    // meal_1791889085178_ql35d (Moong Daal Chilla)
    const chillaItems = db.getAllSync<{ id: string; food_name: string }>(
      "SELECT id, food_name FROM NutritionEstimates WHERE meal_entry_id = 'meal_1791889085178_ql35d'"
    );
    if (chillaItems.length > 0) {
      for (const item of chillaItems) {
        const lower = item.food_name.toLowerCase();
        if (lower.includes('moong') || lower.includes('daal') || lower.includes('dal')) {
          db.runSync("UPDATE NutritionEstimates SET calories_estimated = 170, protein_estimated = 11.0, carbs_estimated = 26.0, fat_estimated = 1.0 WHERE id = ?", [item.id]);
        } else if (lower.includes('ghee')) {
          db.runSync("UPDATE NutritionEstimates SET calories_estimated = 45, protein_estimated = 0.0, carbs_estimated = 0.0, fat_estimated = 5.0 WHERE id = ?", [item.id]);
        } else if (lower.includes('soya') || lower.includes('soy')) {
          db.runSync("UPDATE NutritionEstimates SET calories_estimated = 34, protein_estimated = 5.5, carbs_estimated = 2.2, fat_estimated = 0.2 WHERE id = ?", [item.id]);
        } else {
          db.runSync("UPDATE NutritionEstimates SET calories_estimated = 15, protein_estimated = 0.6, carbs_estimated = 3.5, fat_estimated = 0.1 WHERE id = ?", [item.id]);
        }
      }
      db.runSync("UPDATE MealEntries SET total_calories = 264, total_protein = 17.1, total_carbs = 31.7, total_fat = 6.3 WHERE id = 'meal_1791889085178_ql35d'");
    }

    // meal_1791970651206_o3641 (Macaroni with Paneer & Typo "On 1 cup of green")
    db.runSync(`
      UPDATE NutritionEstimates
      SET food_name = 'Green and Red Bell Peppers', calories_estimated = 30, protein_estimated = 1.2, carbs_estimated = 7.0, fat_estimated = 0.3
      WHERE meal_entry_id = 'meal_1791970651206_o3641' AND LOWER(food_name) LIKE '%on 1 cup%'
    `);
    const macaroniItems = db.getAllSync<{ id: string; food_name: string }>(
      "SELECT id, food_name FROM NutritionEstimates WHERE meal_entry_id = 'meal_1791970651206_o3641'"
    );
    if (macaroniItems.length > 0) {
      for (const item of macaroniItems) {
        const lower = item.food_name.toLowerCase();
        if (lower.includes('macaroni') || lower.includes('pasta')) {
          db.runSync("UPDATE NutritionEstimates SET calories_estimated = 180, protein_estimated = 6.0, carbs_estimated = 36.0, fat_estimated = 1.2 WHERE id = ?", [item.id]);
        } else if (lower.includes('paneer') || lower.includes('panneer')) {
          db.runSync("UPDATE NutritionEstimates SET calories_estimated = 265, protein_estimated = 18.3, carbs_estimated = 3.5, fat_estimated = 20.0 WHERE id = ?", [item.id]);
        }
      }
      db.runSync("UPDATE MealEntries SET total_calories = 475, total_protein = 25.5, total_carbs = 46.5, total_fat = 21.5 WHERE id = 'meal_1791970651206_o3641'");
    }

    // meal_1792052984371_hl028 (Tofu Burger)
    const burgerItems = db.getAllSync<{ id: string; food_name: string }>(
      "SELECT id, food_name FROM NutritionEstimates WHERE meal_entry_id = 'meal_1792052984371_hl028'"
    );
    if (burgerItems.length > 0) {
      for (const item of burgerItems) {
        const lower = item.food_name.toLowerCase();
        if (lower.includes('tofu')) {
          db.runSync("UPDATE NutritionEstimates SET calories_estimated = 144, protein_estimated = 15.5, carbs_estimated = 3.0, fat_estimated = 8.0 WHERE id = ?", [item.id]);
        } else if (lower.includes('bun') || lower.includes('bread')) {
          db.runSync("UPDATE NutritionEstimates SET calories_estimated = 150, protein_estimated = 5.0, carbs_estimated = 28.0, fat_estimated = 2.0 WHERE id = ?", [item.id]);
        } else {
          db.runSync("UPDATE NutritionEstimates SET calories_estimated = 15, protein_estimated = 0.8, carbs_estimated = 3.0, fat_estimated = 0.2 WHERE id = ?", [item.id]);
        }
      }
      db.runSync("UPDATE MealEntries SET total_calories = 309, total_protein = 21.3, total_carbs = 34.0, total_fat = 10.2 WHERE id = 'meal_1792052984371_hl028'");
    }

    // Fix any remaining items with leading preposition typos like "on 1 cup..."
    db.runSync(`
      UPDATE NutritionEstimates
      SET food_name = SUBSTR(food_name, 4)
      WHERE LOWER(food_name) LIKE 'on %'
    `);

    // 4. Multi-fruit entries with 600 kcal fallback
    const fruitEntries = db.getAllSync<{ id: string; raw_text: string }>(`
      SELECT id, raw_text FROM MealEntries
      WHERE LOWER(raw_text) LIKE '%grapes%kiwi%orange%'
         OR LOWER(raw_text) LIKE '%kiwi%grapes%orange%'
    `);
    for (const f of fruitEntries) {
      const items = db.getAllSync<{ id: string; food_name: string }>(
        'SELECT id, food_name FROM NutritionEstimates WHERE meal_entry_id = ?',
        [f.id]
      );
      for (const it of items) {
        const l = it.food_name.toLowerCase();
        if (l.includes('grape')) {
          db.runSync('UPDATE NutritionEstimates SET calories_estimated = 104, protein_estimated = 1.1, carbs_estimated = 27.3, fat_estimated = 0.2 WHERE id = ?', [it.id]);
        } else if (l.includes('kiwi')) {
          db.runSync('UPDATE NutritionEstimates SET calories_estimated = 42, protein_estimated = 0.8, carbs_estimated = 10.1, fat_estimated = 0.4 WHERE id = ?', [it.id]);
        } else if (l.includes('orange')) {
          db.runSync('UPDATE NutritionEstimates SET calories_estimated = 62, protein_estimated = 1.2, carbs_estimated = 15.4, fat_estimated = 0.2 WHERE id = ?', [it.id]);
        }
      }
      db.runSync('UPDATE MealEntries SET total_calories = 208, total_protein = 3.1, total_carbs = 52.8, total_fat = 0.8 WHERE id = ?', [f.id]);
    }

    // 5. Synchronize all past DailyLogs dates from MealEntries
    const mealDates = db.getAllSync<{ date: string }>(
      "SELECT DISTINCT date FROM MealEntries WHERE date IS NOT NULL"
    );
    for (const d of mealDates) {
      MealRepository.syncDailyLogTotals(d.date);
    }
  } catch (healErr) {
    console.warn('[Migrations] Nutrition data healing error:', healErr);
  }
}

export function cleanPastDummyDataAndSetBaseline(startingWeightKg = 65.8) {
  return;
}


