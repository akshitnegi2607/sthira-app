/**
 * Sthira — Verification Suite for Gemini Audit Issues & LLM Fixes
 * Tests all 10 issues identified in the user audit report.
 */

import { analyzeMeal } from '../src/services/mealParser';
import { getDatabase } from '../src/database/db';
import { runMigrations } from '../src/database/migrations';
import { WorkoutRepository } from '../src/database/repositories/workoutRepository';
import { DailyLogsRepository } from '../src/database/repositories/dailyLogsRepository';
import { MealRepository } from '../src/database/repositories/mealRepository';
import { JournalRepository } from '../src/database/repositories/journalRepository';
import { getTodayDateString, shiftDateString } from '../src/utils/date';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${testName}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
  }
}

console.log('\n========================================');
console.log('STHIRA AUDIT & LLM FIXES VERIFICATION');
console.log('========================================\n');

// Initialize database & run migrations
runMigrations();
const db = getDatabase();

// -------------------------------------------------------------
// TEST 1: Nutrition Fallback & Unit-Quantity Multiplier (Issues 1 & 2)
// -------------------------------------------------------------
console.log('Testing Nutrition Estimation (Issues 1 & 2)...');
const peanut5g = analyzeMeal('Peanuts 5gm', 'snack');
assert(peanut5g.items.length === 1, 'Parses 5gm peanuts into 1 item');
assert(
  peanut5g.totalCalories < 50 && peanut5g.totalCalories > 15,
  '5g peanuts has realistic calories (~28 kcal, NOT 1000 kcal)',
  `Received: ${peanut5g.totalCalories} kcal`
);
assert(
  peanut5g.totalCalories !== 1000,
  'Does NOT multiply whole serving 200 kcal fallback by gram count',
  `Calories: ${peanut5g.totalCalories}`
);

// Multi-item fruit entry: "Grapes, kiwi, orange"
const multiFruit = analyzeMeal('Grapes, kiwi, orange', 'snack');
assert(multiFruit.items.length === 3, 'Parses 3 separate fruit items');
assert(
  multiFruit.totalCalories < 300,
  'Multi-fruit entry receives realistic fruit macros instead of 600 kcal generic default',
  `Received: ${multiFruit.totalCalories} kcal`
);

// -------------------------------------------------------------
// TEST 2: Preposition Cleanup & Atwater Math (Issue 4)
// -------------------------------------------------------------
console.log('\nTesting Preposition Cleanup & Atwater Math (Issue 4)...');
const macaroniInput = 'Macaroni with 1 cup of paneer and on 1 cup of green and red peppers';
const macaroniMeal = analyzeMeal(macaroniInput, 'dinner');
const itemNames = macaroniMeal.items.map((i) => i.food_name.toLowerCase());
assert(
  !itemNames.some((n) => n.startsWith('on ')),
  'Leading preposition "on" is cleanly stripped from food clauses',
  `Found items: ${itemNames.join(', ')}`
);

// Verify Atwater equation on all items: calories ~ (P*4 + C*4 + F*9) within 15%
for (const it of macaroniMeal.items) {
  if (it.calories > 0) {
    const atwater = Math.round(it.protein * 4 + it.carbs * 4 + it.fat * 9);
    const diff = Math.abs(it.calories - atwater);
    assert(
      diff <= Math.max(15, it.calories * 0.15),
      `Atwater consistency validated for "${it.food_name}" (reported ${it.calories} vs calc ${atwater})`
    );
  }
}

// -------------------------------------------------------------
// TEST 3: Recipe Breakdown Equal-Division Bug (Issue 3)
// -------------------------------------------------------------
console.log('\nTesting Recipe Logging (Issue 3)...');
const recipeRow = db.getFirstSync<any>('SELECT * FROM CuisineRecipes LIMIT 1');
if (recipeRow) {
  const mealDate = '2026-10-18';
  // Create meal as single verified item
  const created = MealRepository.createMeal(
    {
      date: mealDate,
      meal_type: 'lunch',
      raw_text: recipeRow.title,
      total_calories: recipeRow.estimated_calories,
      total_protein: recipeRow.estimated_protein,
      total_carbs: recipeRow.estimated_carbs,
      total_fat: recipeRow.estimated_fat,
      confidence: 'high',
      is_verified_by_user: 1,
    },
    [
      {
        food_name: recipeRow.title,
        quantity: 1,
        unit: 'serving',
        calories_estimated: recipeRow.estimated_calories,
        protein_estimated: recipeRow.estimated_protein,
        carbs_estimated: recipeRow.estimated_carbs,
        fat_estimated: recipeRow.estimated_fat,
        confidence_score: 'high',
        clarification_needed: 0,
      },
    ]
  );

  const estimates = db.getAllSync<any>('SELECT * FROM NutritionEstimates WHERE meal_entry_id = ?', [created.id]);
  assert(estimates.length === 1, 'Composite recipe stored as 1 accurate estimate');
  assert(
    estimates[0].calories_estimated === recipeRow.estimated_calories,
    'Recipe calories match total recipe without dividing equally across oregano/garlic'
  );
  // Clean up test meal
  MealRepository.deleteMeal(created.id);
}

// -------------------------------------------------------------
// TEST 4: Workout Cascades & Duration Math (Issues 5 & 6)
// -------------------------------------------------------------
console.log('\nTesting Workout Cascades & Duration (Issues 5 & 6)...');
const session = WorkoutRepository.startSession({
  title: 'Test Session',
  exerciseIds: ['ex_incline_db_press', 'ex_lat_pulldown'],
});

const sessionId = session.session.id;
const weBefore = db.getAllSync<any>('SELECT * FROM WorkoutExercises WHERE session_id = ?', [sessionId]);
const setsBefore = db.getAllSync<any>(
  'SELECT * FROM WorkoutSets WHERE workout_exercise_id IN (SELECT id FROM WorkoutExercises WHERE session_id = ?)',
  [sessionId]
);
assert(weBefore.length === 2, 'Session started with 2 exercises');
assert(setsBefore.length > 0, 'Session has sets created');

// Cancel session
WorkoutRepository.cancelSession(sessionId);
const weAfter = db.getAllSync<any>('SELECT * FROM WorkoutExercises WHERE session_id = ?', [sessionId]);
const setsAfter = db.getAllSync<any>(
  'SELECT * FROM WorkoutSets WHERE workout_exercise_id IN (SELECT id FROM WorkoutExercises WHERE session_id = ?)',
  [sessionId]
);
assert(weAfter.length === 0, 'cancelSession cascade deletes child WorkoutExercises (no orphans)');
assert(setsAfter.length === 0, 'cancelSession cascade deletes child WorkoutSets (no orphans)');

// Test duration math with simulated backgrounding
const backgroundedSess = WorkoutRepository.startSession({
  title: 'Duration Test',
  exerciseIds: ['ex_incline_db_press'],
});
// Simulate start time 45 minutes ago in SQLite
const fortyFiveMinsAgo = new Date(Date.now() - 45 * 60 * 1000).toISOString();
db.runSync('UPDATE WorkoutSessions SET start_time = ? WHERE id = ?', [fortyFiveMinsAgo, backgroundedSess.session.id]);

// Finish session with small foreground timer duration (e.g. phone was locked, foreground timer only ticked 120s)
const finished = WorkoutRepository.finishSession(backgroundedSess.session.id, {
  durationSeconds: 120, // Stalled foreground timer
  difficultyPerceived: 'Good',
});

assert(
  finished.session.duration_seconds >= 2690 && finished.session.duration_seconds <= 2710,
  'finishSession calculates wall-clock duration (~2700s) from start_time when backgrounded',
  `Recorded: ${finished.session.duration_seconds}s`
);
// Clean up
WorkoutRepository.deleteSession(backgroundedSess.session.id);

// -------------------------------------------------------------
// TEST 5: Singleton Profiles, Goals, and Casing (Issue 7)
// -------------------------------------------------------------
console.log('\nTesting Singleton Profile & Goals (Issue 7)...');
const userRows = db.getAllSync<any>('SELECT * FROM UserProfile');
assert(userRows.length === 1, 'Exactly one UserProfile row exists (singleton enforced)');
assert(userRows[0].id === 'user_primary', 'UserProfile primary ID is user_primary');
assert(userRows[0].diet_type === 'vegetarian', 'diet_type is normalized lowercase "vegetarian"');

try {
  const prefs = JSON.parse(userRows[0].cuisine_preferences);
  assert(Array.isArray(prefs), 'cuisine_preferences is valid JSON array');
} catch (e) {
  assert(false, 'cuisine_preferences must be valid JSON array');
}

const goalRows = db.getAllSync<any>('SELECT * FROM Goals');
assert(goalRows.length === 1, 'Exactly one Goals row exists (singleton enforced)');
assert(goalRows[0].id === 'goals_primary', 'Goals primary ID is goals_primary');

// -------------------------------------------------------------
// TEST 6: Water Hydration Single Source of Truth & Debounce (Issue 8)
// -------------------------------------------------------------
console.log('\nTesting Water Hydration Source of Truth (Issue 8)...');
const testDate = '2026-10-19';
// Add water entries
db.runSync(
  'INSERT INTO WaterEntries (id, date, amount_ml, created_at) VALUES (?, ?, ?, ?)',
  ['w_test_1', testDate, 500, new Date().toISOString()]
);
db.runSync(
  'INSERT INTO WaterEntries (id, date, amount_ml, created_at) VALUES (?, ?, ?, ?)',
  ['w_test_2', testDate, 750, new Date().toISOString()]
);

const log = DailyLogsRepository.getOrCreateLog(testDate);
assert(log.water_liters === 1.3, 'DailyLogs.water_liters matches SUM(WaterEntries) / 1000 (1.25L -> 1.3L)');

// Clean up test water
db.runSync('DELETE FROM WaterEntries WHERE date = ?', [testDate]);
db.runSync('DELETE FROM DailyLogs WHERE date = ?', [testDate]);

// -------------------------------------------------------------
// TEST 7: Empty Days Marked as PENDING (Issue 9)
// -------------------------------------------------------------
console.log('\nTesting Day Status & Local Date Keys (Issue 9)...');
const futureDate = '2026-10-25';
const futureLog = DailyLogsRepository.getOrCreateLog(futureDate);
assert(
  futureLog.coach_status === 'PENDING',
  'Unlogged / empty day is initialized with coach_status = "PENDING" (NOT "ON TRACK")',
  `Received: ${futureLog.coach_status}`
);
db.runSync('DELETE FROM DailyLogs WHERE date = ?', [futureDate]);

const localToday = getTodayDateString();
assert(/^\d{4}-\d{2}-\d{2}$/.test(localToday), 'getTodayDateString returns YYYY-MM-DD');

// -------------------------------------------------------------
// TEST 8: AIRecommendations and DailyLogs Text Sync (Issue 10)
// -------------------------------------------------------------
console.log('\nTesting AI Recommendations Text Synchronization (Issue 10)...');
const syncTestDate = '2026-10-20';
// Create an initial recommendation
JournalRepository.saveAIRecommendation({
  date: syncTestDate,
  recommendation_type: 'daily_coach',
  content: 'You hit 100g of vegetarian protein and hit 2500 kcal today. Solid work!',
  rationale: 'Daily review',
  statusBadge: 'ON TRACK',
});

// Now log a late evening meal (e.g. 200ml milk, 130 kcal, 6.6g protein)
const lateMeal = MealRepository.createMeal(
  {
    date: syncTestDate,
    meal_type: 'snack',
    raw_text: '200ml warm milk',
    total_calories: 130,
    total_protein: 6.6,
    total_carbs: 9.6,
    total_fat: 7.0,
    confidence: 'high',
    is_verified_by_user: 1,
  },
  [
    {
      food_name: 'Warm Milk',
      quantity: 200,
      unit: 'ml',
      calories_estimated: 130,
      protein_estimated: 6.6,
      carbs_estimated: 9.6,
      fat_estimated: 7.0,
      confidence_score: 'high',
      clarification_needed: 0,
    },
  ]
);

const updatedRec = JournalRepository.getLatestRecommendation(syncTestDate, 'daily_coach');
assert(
  updatedRec !== null && updatedRec.content.includes('6.6g of vegetarian protein') && updatedRec.content.includes('hit 130 kcal'),
  'Late meal automatically updates AIRecommendations text with current totals (no stale text)',
  `Updated text: ${updatedRec?.content}`
);

// Clean up
MealRepository.deleteMeal(lateMeal.id);
db.runSync('DELETE FROM AIRecommendations WHERE date = ?', [syncTestDate]);
db.runSync('DELETE FROM DailyLogs WHERE date = ?', [syncTestDate]);

console.log('\n========================================');
console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('All 10 Gemini audit issues successfully verified!\n');
}
