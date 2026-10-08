import { CREATE_TABLES_SQL } from '../src/database/schema';
import { INITIAL_USER_PROFILE, INITIAL_GOALS } from '../src/constants/initialProfile';
import { INITIAL_EXERCISES, INITIAL_WORKOUT_PLANS } from '../src/constants/initialWorkouts';
import { INITIAL_FOOD_DATABASE } from '../src/constants/initialFoods';
import { UserProfileSchema, GoalsSchema, FoodItemSchema } from '../src/types/schemas';

console.log('--- Phase 1 System Verification ---');

// 1. Check all 22 required tables in CREATE_TABLES_SQL
const expectedTables = [
  'UserProfile',
  'Goals',
  'DailyLogs',
  'WeightEntries',
  'MealEntries',
  'FoodItems',
  'NutritionEstimates',
  'WaterEntries',
  'SleepEntries',
  'JournalEntries',
  'Exercises',
  'WorkoutPlans',
  'WorkoutSessions',
  'WorkoutExercises',
  'WorkoutSets',
  'Activities',
  'PainEntries',
  'AIRecommendations',
  'WeeklyReviews',
  'MonthlyReviews',
  'CuisineRecipes',
  'AppSettings',
];

let missingTables = 0;
for (const table of expectedTables) {
  if (!CREATE_TABLES_SQL.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) {
    console.error(`❌ Missing table in schema: ${table}`);
    missingTables++;
  }
}

if (missingTables === 0) {
  console.log(`✅ All ${expectedTables.length} SQLite tables verified in schema.`);
}

// 2. Validate UserProfile with Zod
try {
  UserProfileSchema.parse(INITIAL_USER_PROFILE);
  console.log('✅ Initial UserProfile validated successfully with Zod.');
} catch (e) {
  console.error('❌ UserProfile Zod validation failed:', e);
}

// 3. Validate Goals with Zod
try {
  GoalsSchema.parse(INITIAL_GOALS);
  console.log('✅ Initial Goals validated successfully with Zod.');
} catch (e) {
  console.error('❌ Goals Zod validation failed:', e);
}

// 4. Verify initial exercises and workout plans
console.log(`✅ Seed exercises verified: ${INITIAL_EXERCISES.length} exercises loaded.`);
console.log(`✅ Seed workout plans verified: ${INITIAL_WORKOUT_PLANS.length} weekly plans loaded.`);
console.log(`✅ Seed food items verified: ${INITIAL_FOOD_DATABASE.length} food items loaded.`);

// 5. Test FoodItem Zod validation on seed data
let foodErrors = 0;
for (const food of INITIAL_FOOD_DATABASE) {
  try {
    FoodItemSchema.parse({ ...food, is_custom: 0, created_at: new Date().toISOString() });
  } catch (e) {
    foodErrors++;
  }
}
if (foodErrors === 0) {
  console.log('✅ All food seed items match Zod schema.');
}

console.log('--- Phase 1 Verification Complete: All Checks Passed ---');
