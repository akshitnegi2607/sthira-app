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

  // 8. Seed sample daily log for yesterday's history
  const yesterday = new Date(Date.now() - 86400000);
  const sampleDate = yesterday.toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];

  // Clean up any old dummy seed for today so today starts fresh and real
  try {
    db.runSync(
      `DELETE FROM MealEntries WHERE date = ? AND id LIKE 'meal_%'`,
      [todayStr]
    );
    const existingTodayLog = db.getFirstSync<{ id: string; coach_summary?: string }>(
      'SELECT id, coach_summary FROM DailyLogs WHERE date = ? LIMIT 1',
      [todayStr]
    );
    if (existingTodayLog && existingTodayLog.coach_summary && existingTodayLog.coach_summary.includes('2,320 / 2,450')) {
      db.runSync('DELETE FROM DailyLogs WHERE date = ?', [todayStr]);
    }
  } catch (e) {
    // Ignore if tables not yet populated
  }

  const sampleRow = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM DailyLogs WHERE date = ?',
    [sampleDate]
  );

  if (!sampleRow || sampleRow.count === 0) {
    const now = new Date().toISOString();
    db.runSync(
      `INSERT INTO DailyLogs (
        id, date, calories_consumed, protein_consumed, carbs_consumed,
        fat_consumed, water_liters, weight, sleep_hours, energy_rating,
        mood_rating, hunger_rating, recovery_rating, soreness_rating,
        stress_rating, coach_status, coach_summary, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `log_${sampleDate}`,
        sampleDate,
        2320,
        114,
        290,
        68,
        1.9,
        64.2,
        7.25, // 7h 15m
        8,
        8,
        5,
        8,
        3,
        3,
        'ON TRACK',
        "Yesterday's Upper Body session was completed. Calories and protein were on track.",
        now,
        now,
      ]
    );
  }

  // 9. Seed sample meal entries for yesterday if not present
  const mealsRow = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM MealEntries WHERE date = ?',
    [sampleDate]
  );

  if (!mealsRow || mealsRow.count === 0) {
    const now = new Date().toISOString();

    const sampleMeals = [
      {
        id: `meal_${sampleDate}_breakfast`,
        meal_type: 'breakfast',
        raw_text: '2 besan chillas with 100g paneer, 1 cup curd and 1 banana',
        total_calories: 650,
        total_protein: 36.2,
        total_carbs: 70.0,
        total_fat: 29.8,
        confidence: 'high',
        items: [
          { name: 'Besan Chilla', quantity: 2, unit: 'piece', cal: 280, pro: 12.4, carbs: 36, fat: 9, conf: 'high' },
          { name: 'Paneer (Raw / Low Fat)', quantity: 100, unit: 'g', cal: 265, pro: 18.3, carbs: 3.5, fat: 20, conf: 'high' },
          { name: 'Banana (Medium Fresh)', quantity: 1, unit: 'piece', cal: 105, pro: 1.3, carbs: 27, fat: 0.3, conf: 'high' },
        ],
      },
      {
        id: `meal_${sampleDate}_lunch`,
        meal_type: 'lunch',
        raw_text: '1 cup rajma masala with 1 cup basmati rice, 1 cup curd and 1 roti',
        total_calories: 635,
        total_protein: 24.5,
        total_carbs: 104.0,
        total_fat: 11.5,
        confidence: 'high',
        items: [
          { name: 'Rajma Masala (Kidney Beans)', quantity: 1, unit: 'cup', cal: 220, pro: 11.5, carbs: 32, fat: 5, conf: 'high' },
          { name: 'White Basmati Rice', quantity: 1, unit: 'cup', cal: 210, pro: 4.3, carbs: 45, fat: 0.5, conf: 'high' },
          { name: 'Curd / Dahi', quantity: 1, unit: 'cup', cal: 100, pro: 5.5, carbs: 7, fat: 5, conf: 'high' },
          { name: 'Roti / Chapati', quantity: 1, unit: 'piece', cal: 105, pro: 3.2, carbs: 20, fat: 1, conf: 'high' },
        ],
      },
      {
        id: `meal_${sampleDate}_snack`,
        meal_type: 'snack',
        raw_text: 'Greek yogurt 150g with 1 cup steamed edamame',
        total_calories: 318,
        total_protein: 33.4,
        total_carbs: 19.8,
        total_fat: 12.0,
        confidence: 'high',
        items: [
          { name: 'Greek Yogurt (Plain)', quantity: 150, unit: 'g', cal: 130, pro: 15.0, carbs: 6.0, fat: 4.0, conf: 'high' },
          { name: 'Edamame (Steamed)', quantity: 1, unit: 'cup', cal: 188, pro: 18.4, carbs: 13.8, fat: 8.0, conf: 'high' },
        ],
      },
      {
        id: `meal_${sampleDate}_dinner`,
        meal_type: 'dinner',
        raw_text: '100g pan-seared firm tofu with 1 cup whole wheat pasta and lentil bolognese',
        total_calories: 717,
        total_protein: 39.9,
        total_carbs: 96.2,
        total_fat: 14.7,
        confidence: 'high',
        items: [
          { name: 'Firm Tofu (Pan-seared)', quantity: 100, unit: 'g', cal: 144, pro: 15.5, carbs: 3.0, fat: 8.0, conf: 'high' },
          { name: 'Whole Wheat Pasta', quantity: 1.5, unit: 'cup', cal: 261, pro: 11.2, carbs: 55.5, fat: 1.2, conf: 'high' },
          { name: 'Red Lentil Bolognese Sauce', quantity: 1, unit: 'cup', cal: 190, pro: 11.0, carbs: 28.0, fat: 3.5, conf: 'high' },
          { name: 'Grilled Halloumi Cheese', quantity: 40, unit: 'g', cal: 122, pro: 2.2, carbs: 9.7, fat: 2.0, conf: 'medium' },
        ],
      },
    ];

    for (const m of sampleMeals) {
      db.runSync(
        `INSERT INTO MealEntries (
          id, date, meal_type, raw_text, total_calories, total_protein,
          total_carbs, total_fat, confidence, is_verified_by_user, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        [
          m.id,
          sampleDate,
          m.meal_type,
          m.raw_text,
          m.total_calories,
          m.total_protein,
          m.total_carbs,
          m.total_fat,
          m.confidence,
          now,
        ]
      );

      for (let i = 0; i < m.items.length; i++) {
        const item = m.items[i];
        db.runSync(
          `INSERT INTO NutritionEstimates (
            id, meal_entry_id, food_name, quantity, unit,
            calories_estimated, protein_estimated, carbs_estimated, fat_estimated,
            confidence_score, clarification_needed, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
          [
            `est_${m.id}_${i}`,
            m.id,
            item.name,
            item.quantity,
            item.unit,
            item.cal,
            item.pro,
            item.carbs,
            item.fat,
            item.conf,
            now,
          ]
        );
      }
    }
  }

  // 9. Seed realistic historical weight entries and sleep logs if empty
  const weightRow = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM WeightEntries'
  );

  if (!weightRow || weightRow.count === 0) {
    const historicalWeights = [
      { dayOffset: 14, weight: 63.8, sleep: 7.8, note: 'Morning weigh-in after fasting' },
      { dayOffset: 13, weight: 63.9, sleep: 8.0, note: null },
      { dayOffset: 12, weight: 63.7, sleep: 6.5, note: 'Restless night' },
      { dayOffset: 11, weight: 63.9, sleep: 7.5, note: null },
      { dayOffset: 10, weight: 64.0, sleep: 7.8, note: 'Post Lower session water retention' },
      { dayOffset: 9, weight: 63.9, sleep: 8.2, note: null },
      { dayOffset: 8, weight: 64.1, sleep: 7.0, note: null },
      { dayOffset: 7, weight: 64.0, sleep: 8.0, note: 'Weekly weigh-in baseline' },
      { dayOffset: 6, weight: 64.2, sleep: 6.8, note: null },
      { dayOffset: 5, weight: 64.1, sleep: 7.6, note: null },
      { dayOffset: 4, weight: 64.0, sleep: 6.4, note: 'Late night study' },
      { dayOffset: 3, weight: 64.2, sleep: 8.0, note: 'Great recovery night' },
      { dayOffset: 2, weight: 64.1, sleep: 7.5, note: null },
      { dayOffset: 1, weight: 64.15, sleep: 7.8, note: 'Morning weigh-in' },
    ];

    for (const h of historicalWeights) {
      const pastMs = Date.now() - h.dayOffset * 24 * 60 * 60 * 1000;
      const pastDate = new Date(pastMs).toISOString().split('T')[0];
      const entryId = `weight_${pastDate}`;

      db.runSync(
        `INSERT INTO WeightEntries (id, date, weight_kg, notes, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [entryId, pastDate, h.weight, h.note, new Date(pastMs).toISOString()]
      );

      // Also ensure DailyLogs exists for that day with sleep and weight
      const existingDaily = db.getFirstSync<{ id: string }>(
        'SELECT id FROM DailyLogs WHERE date = ?',
        [pastDate]
      );

      if (existingDaily) {
        db.runSync(
          'UPDATE DailyLogs SET weight = ?, sleep_hours = ? WHERE date = ?',
          [h.weight, h.sleep, pastDate]
        );
      } else {
        db.runSync(
          `INSERT INTO DailyLogs (
            id, date, calories_consumed, protein_consumed, carbs_consumed,
            fat_consumed, water_liters, weight, sleep_hours, energy_rating,
            coach_status, coach_summary, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `log_${pastDate}`,
            pastDate,
            2420,
            118,
            330,
            68,
            2.3,
            h.weight,
            h.sleep,
            h.sleep >= 7.5 ? 8 : 6,
            'ON TRACK',
            'Solid adherence day.',
            new Date(pastMs).toISOString(),
            new Date(pastMs).toISOString(),
          ]
        );
      }
    }

    // Seed 4 past completed workout sessions with sets for correlation calculation
    const pastSessions = [
      { dayOffset: 13, title: 'Upper Body A', duration: 3420, diff: 'Good', sets: 18, vol: 7850 },
      { dayOffset: 11, title: 'Lower Body A', duration: 3780, diff: 'Hard', sets: 17, vol: 8900 },
      { dayOffset: 6, title: 'Upper Body B', duration: 3300, diff: 'Good', sets: 18, vol: 7920 },
      { dayOffset: 4, title: 'Lower Body B', duration: 3600, diff: 'Very hard', sets: 16, vol: 7100 },
    ];

    for (const ps of pastSessions) {
      const pastMs = Date.now() - ps.dayOffset * 24 * 60 * 60 * 1000;
      const pastDate = new Date(pastMs).toISOString().split('T')[0];
      const sessId = `sess_hist_${pastDate}`;

      db.runSync(
        `INSERT INTO WorkoutSessions (
          id, date, workout_plan_id, title, duration_seconds, status, difficulty_perceived, created_at
        ) VALUES (?, ?, null, ?, ?, 'completed', ?, ?)`,
        [sessId, pastDate, ps.title, ps.duration, ps.diff, new Date(pastMs).toISOString()]
      );

      // Create a workout exercise and sets so totalVolumeKg is computed accurately
      const weId = `we_hist_${sessId}`;
      db.runSync(
        `INSERT INTO WorkoutExercises (id, session_id, exercise_id, order_index, created_at)
         VALUES (?, ?, 'ex_bench_press', 1, ?)`,
        [weId, sessId, new Date(pastMs).toISOString()]
      );

      // Split total volume across 4 sets
      const reps = 10;
      const weightPerSet = Math.round((ps.vol / 4 / reps) * 10) / 10;
      for (let s = 1; s <= 4; s++) {
        db.runSync(
          `INSERT INTO WorkoutSets (
            id, workout_exercise_id, set_number, weight_kg, reps, rir, is_completed, created_at
          ) VALUES (?, ?, ?, ?, ?, 2, 1, ?)`,
          [`set_hist_${weId}_${s}`, weId, s, weightPerSet, reps, new Date(pastMs).toISOString()]
        );
      }
    }
  }

  // 12. Run self-healing check on completed workout sets and progressions
  WorkoutRepository.healCompletedWorkoutSets();
}
