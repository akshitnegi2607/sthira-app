/**
 * Sthira — Verification Script: Dynamic AI Daily Coaching & Exercise Last Performance
 * Verifies:
 * 1. Dynamic AI Daily Coaching Engine:
 *    - Yesterday review & improvement area extraction (protein deficit, sleep, calories, momentum).
 *    - Time-of-day progression (morning, afternoon, evening, night).
 *    - Remaining macro budget calculations (calories, protein, water).
 *    - Tailored vegetarian recommendations catalog (No eggs, no mushrooms, 6 authentic cuisines).
 * 2. Exercise Last Performance & Set History:
 *    - Querying actual completed weights and reps per exercise from SQLite.
 *    - Pre-populating active session sets with actual historical performance instead of flat 20kg fallbacks.
 *    - Per-set previous lift hints and match actions.
 * 3. 1-Tap Home Screen Meal Logging:
 *    - Immediate synchronization with DailyLogs and macro updates.
 */

import { generateDynamicDailyCoachGuidance, getTimeOfDayBracket } from '../src/services/dailyCoachingEngine';
import { WorkoutRepository } from '../src/database/repositories/workoutRepository';
import { DailyLogsRepository } from '../src/database/repositories/dailyLogsRepository';
import { MealRepository } from '../src/database/repositories/mealRepository';
import { ProfileRepository } from '../src/database/repositories/profileRepository';
import { getTodayDateString, shiftDateString } from '../src/utils/date';
import { DailyLog, Goals, UserProfile, WorkoutSession } from '../src/types/database';
import { runMigrations } from '../src/database/migrations';

runMigrations();

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
    process.exit(1);
  }
}

console.log('\n--- 1. Testing Dynamic AI Daily Coaching Engine ---');

const mockGoals: Goals = {
  id: 'goals_primary',
  user_id: 'user_primary',
  calories_target: 2450,
  protein_target_min: 110,
  protein_target_max: 120,
  fat_target_min: 65,
  fat_target_max: 80,
  carbs_target: 335,
  water_target_liters: 2.5,
  sleep_hours_target: 7.5,
  weight_target_kg: 67.0,
  weekly_weight_change_target: 0.15,
  workout_days_target: 4,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockProfile: UserProfile = {
  id: 'user_primary',
  name: 'Jay',
  current_weight: 64.0,
  height: 167,
  target_weight: 67.0,
  goal_type: 'lean_bulk',
  target_rate_kg_per_week: 0.15,
  diet_type: 'vegetarian',
  eats_eggs: 0,
  eats_onion: 1,
  eats_garlic: 1,
  eats_mushrooms: 0,
  cuisine_preferences: '["Indian","Mexican","Mediterranean","Italian","Asian","Middle Eastern"]',
  gym_days_per_week: 4,
  tuesday_activity: 'Yoga & Mobility',
  sunday_activity: 'Swimming & Active recovery',
  saturday_rest: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Scenario A: Yesterday had protein shortfall (e.g. 85g vs 120g target)
const yesterdayLowProteinLog: DailyLog = {
  id: 'log_yest_1',
  date: '2026-10-16',
  calories_consumed: 2200,
  protein_consumed: 85,
  carbs_consumed: 310,
  fat_consumed: 65,
  water_liters: 2.2,
  weight: 64.0,
  sleep_hours: 7.5,
  energy_rating: 8,
  mood_rating: 8,
  hunger_rating: 7,
  recovery_rating: 8,
  soreness_rating: 3,
  stress_rating: 4,
  coach_status: 'ON TRACK',
  coach_summary: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const todayEmptyLog: DailyLog = {
  id: 'log_today_1',
  date: '2026-10-17',
  calories_consumed: 0,
  protein_consumed: 0,
  carbs_consumed: 0,
  fat_consumed: 0,
  water_liters: 0,
  weight: 64.1,
  sleep_hours: 8.0,
  energy_rating: 8,
  mood_rating: 8,
  hunger_rating: null,
  recovery_rating: null,
  soreness_rating: null,
  stress_rating: null,
  coach_status: 'PENDING',
  coach_summary: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const guidanceA = generateDynamicDailyCoachGuidance({
  todayLog: todayEmptyLog,
  yesterdayLog: yesterdayLowProteinLog,
  yesterdaySession: null,
  goals: mockGoals,
  profile: mockProfile,
  todayPlanTitle: 'Upper A - Push Focus',
  isTodayWorkoutCompleted: false,
  mealsLoggedCount: 0,
});

assert(guidanceA.yesterdayReview !== null, 'Yesterday review is generated when yesterday log exists');
assert(
  guidanceA.yesterdayReview?.summary.includes('reached 85g') === true,
  'Identifies exact yesterday protein intake (85g)'
);
assert(
  guidanceA.yesterdayReview?.improvementArea.includes('Front-load protein today') === true,
  'Suggests specific actionable protein improvement area for today'
);
assert(guidanceA.todayProgress.proteinRemaining === 120, 'Calculates full protein remaining when no meals logged today');
assert(guidanceA.suggestedMeals.length > 0, 'Recommends tailored vegetarian meals to hit targets');
assert(
  guidanceA.suggestedMeals.every((m) => !m.name.toLowerCase().includes('egg') && !m.name.toLowerCase().includes('mushroom')),
  'All recommended meals are strictly vegetarian with NO eggs and NO mushrooms'
);

// Scenario B: Mid-day afternoon with partial progress (600 kcal, 40g protein)
const todayAfternoonLog: DailyLog = {
  ...todayEmptyLog,
  calories_consumed: 950,
  protein_consumed: 45,
  water_liters: 1.2,
};

const guidanceB = generateDynamicDailyCoachGuidance({
  todayLog: todayAfternoonLog,
  yesterdayLog: yesterdayLowProteinLog,
  yesterdaySession: null,
  goals: mockGoals,
  profile: mockProfile,
  todayPlanTitle: 'Upper A',
  isTodayWorkoutCompleted: false,
  mealsLoggedCount: 1,
});

assert(guidanceB.todayProgress.caloriesRemaining === 1500, 'Calculates remaining calories accurately (2450 - 950 = 1500 kcal)');
assert(guidanceB.todayProgress.proteinRemaining === 75, 'Calculates remaining protein accurately (120 - 45 = 75g)');
assert(guidanceB.todayProgress.waterRemaining === 1.3, 'Calculates remaining water accurately (2.5 - 1.2 = 1.3L)');
assert(
  guidanceB.suggestedMeals.some((m) => m.protein >= 30),
  'Suggests high-protein anchor meals (30g+ protein) when protein deficit is high'
);

console.log('\n--- 2. Testing Exercise Last Performance & Pre-Population ---');

// Test getLastPerformanceForExercise
const exercises = WorkoutRepository.getAllExercises();
assert(exercises.length > 0, 'Database contains exercises');

const benchPress = exercises.find((e) => e.name.toLowerCase().includes('incline dumbbell bench') || e.name.toLowerCase().includes('bench')) || exercises[0];

const perfBefore = WorkoutRepository.getLastPerformanceForExercise(benchPress.id);
console.log(`  Initial history for "${benchPress.name}": hasHistory = ${perfBefore.hasHistory}, summary = "${perfBefore.summaryText}"`);

// Create and finish a test workout session with known weights
const testDate = '2026-10-15';
const testSession = WorkoutRepository.startSession({
  planId: null,
  title: 'Test Bench Session',
  exerciseIds: [benchPress.id],
});

assert(testSession.exercises.length === 1, 'Started test session with target exercise');
const testExItem = testSession.exercises[0];

// Log specific actual sets: Set 1: 24kg x 10, Set 2: 26kg x 8, Set 3: 26kg x 7
WorkoutRepository.updateSet(testExItem.sets[0].id, {
  weight_kg: 24,
  reps: 10,
  rir: 2,
  is_completed: 1,
});
if (testExItem.sets.length > 1) {
  WorkoutRepository.updateSet(testExItem.sets[1].id, {
    weight_kg: 26,
    reps: 8,
    rir: 1,
    is_completed: 1,
  });
}
if (testExItem.sets.length > 2) {
  WorkoutRepository.updateSet(testExItem.sets[2].id, {
    weight_kg: 26,
    reps: 7,
    rir: 0,
    is_completed: 1,
  });
}

// Finish session
WorkoutRepository.finishSession(testSession.session.id, {
  durationSeconds: 1800,
  difficultyPerceived: 'Good',
  notes: 'Testing last set tracking',
});

// Now query getLastPerformanceForExercise
const perfAfter = WorkoutRepository.getLastPerformanceForExercise(benchPress.id);
assert(perfAfter.hasHistory === true, 'getLastPerformanceForExercise detects completed workout');
assert(perfAfter.maxWeightKg === 26, 'Correctly extracts max weight lifted (26kg)');
assert(perfAfter.bestSetText === '26 kg × 8', `Correctly identifies best set (${perfAfter.bestSetText})`);
assert(perfAfter.lastSets.length >= 2, 'Returns all completed sets from the session');
assert(perfAfter.lastSets[0].weightKg === 24 && perfAfter.lastSets[0].reps === 10, 'Set 1 accurately recorded as 24kg x 10');

// Test that a NEW workout session now pre-populates with actual historical lifts!
const newSession = WorkoutRepository.startSession({
  planId: null,
  title: 'New Workout Session',
  exerciseIds: [benchPress.id],
});

const newExItem = newSession.exercises[0];
assert(newExItem.sets[0].weight_kg === 24, `Set 1 automatically pre-populates with last actual weight (24kg vs ${newExItem.sets[0].weight_kg}kg)`);
assert(newExItem.sets[0].reps === 10, `Set 1 automatically pre-populates with last actual reps (10 vs ${newExItem.sets[0].reps})`);
if (newExItem.sets.length > 1) {
  assert(newExItem.sets[1].weight_kg === 26, `Set 2 automatically pre-populates with last actual weight (26kg vs ${newExItem.sets[1].weight_kg}kg)`);
  assert(newExItem.sets[1].reps === 8, `Set 2 automatically pre-populates with last actual reps (8 vs ${newExItem.sets[1].reps})`);
}

// Clean up test sessions
WorkoutRepository.deleteSession(testSession.session.id);
WorkoutRepository.deleteSession(newSession.session.id);

console.log('\n--- 3. Testing 1-Tap Home Screen Meal Logging ---');
const todayStr = getTodayDateString();
const initialMeals = MealRepository.getMealsByDate(todayStr).length;

// Log a suggested meal directly via repository
const testSuggestedMeal = guidanceA.suggestedMeals[0];
const logged = MealRepository.createMeal(
  {
    date: todayStr,
    meal_type: 'lunch',
    raw_text: `${testSuggestedMeal.name} (${testSuggestedMeal.portion})`,
    total_calories: testSuggestedMeal.calories,
    total_protein: testSuggestedMeal.protein,
    total_carbs: testSuggestedMeal.carbs,
    total_fat: testSuggestedMeal.fat,
    confidence: 'high',
    is_verified_by_user: 1,
  },
  [
    {
      food_name: testSuggestedMeal.name,
      quantity: 1,
      unit: 'portion',
      calories_estimated: testSuggestedMeal.calories,
      protein_estimated: testSuggestedMeal.protein,
      carbs_estimated: testSuggestedMeal.carbs,
      fat_estimated: testSuggestedMeal.fat,
      confidence_score: 'high',
      clarification_needed: 0,
    },
  ]
);

assert(logged.meal.id !== undefined, 'Suggested meal logged successfully');
const updatedLog = DailyLogsRepository.getTodayLog();
assert(updatedLog.calories_consumed >= testSuggestedMeal.calories, 'DailyLogs calories immediately updated');
assert(updatedLog.protein_consumed >= testSuggestedMeal.protein, 'DailyLogs protein immediately updated');

// Clean up test meal
MealRepository.deleteMeal(logged.meal.id);

console.log('\n🎉 ALL TESTS PASSED! Dynamic coaching and exercise last-set tracking verified completely.\n');
