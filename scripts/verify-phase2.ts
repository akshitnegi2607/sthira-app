import { analyzeMeal, checkDietaryViolations } from '../src/services/mealParser';
import { INITIAL_CUISINE_RECIPES } from '../src/constants/initialRecipes';
import { RecipeRepository } from '../src/database/repositories/recipeRepository';
import { MealRepository } from '../src/database/repositories/mealRepository';
import { runMigrations } from '../src/database/migrations';
import { DailyLogsRepository } from '../src/database/repositories/dailyLogsRepository';

console.log('========================================');
console.log('     STHIRA - PHASE 2 VERIFICATION      ');
console.log('========================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passCount++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    if (detail) console.error(`   Detail: ${detail}`);
    failCount++;
  }
}

// ----------------------------------------------------
// 1. Run migrations to initialize and seed database
// ----------------------------------------------------
console.log('[1/4] Testing Migrations & Seed Data...');
try {
  runMigrations();
  assert(true, 'Database migrations and initial seeds executed successfully.');
} catch (e: any) {
  assert(false, 'Database migrations failed.', e.message);
}

// ----------------------------------------------------
// 2. Test Cuisine Recipes & Seed Data Integrity
// ----------------------------------------------------
console.log('\n[2/4] Testing Cuisine Recipes Integrity & Preferences...');

// Check cuisine diversity
const cuisines = new Set(INITIAL_CUISINE_RECIPES.map((r) => r.cuisine));
assert(cuisines.has('Indian'), 'Seed contains Indian recipes');
assert(cuisines.has('Mexican'), 'Seed contains Mexican recipes');
assert(cuisines.has('Mediterranean'), 'Seed contains Mediterranean recipes');
assert(cuisines.has('Italian'), 'Seed contains Italian recipes');
assert(cuisines.has('Asian'), 'Seed contains Asian recipes');
assert(cuisines.has('Middle Eastern'), 'Seed contains Middle Eastern recipes');

// Check Jay's dietary constraints (Vegetarian, NO Eggs, NO Mushrooms)
const eggViolations = INITIAL_CUISINE_RECIPES.filter((r) => r.has_eggs !== 0);
const mushroomViolations = INITIAL_CUISINE_RECIPES.filter((r) => r.has_mushrooms !== 0);
const vegViolations = INITIAL_CUISINE_RECIPES.filter((r) => r.is_vegetarian !== 1);

assert(eggViolations.length === 0, 'Zero recipes contain eggs (Jay excludes eggs)');
assert(mushroomViolations.length === 0, 'Zero recipes contain mushrooms (Jay excludes mushrooms)');
assert(vegViolations.length === 0, 'All recipes are 100% vegetarian');

// Test RecipeRepository filtering
const allDbRecipes = RecipeRepository.getAllRecipes();
assert(allDbRecipes.length >= INITIAL_CUISINE_RECIPES.length, `Database has ${allDbRecipes.length} recipes loaded`);

const indianRecipes = RecipeRepository.getRecipesByCuisine('Indian');
assert(indianRecipes.length > 0 && indianRecipes.every((r) => r.cuisine === 'Indian'), 'RecipeRepository filters by Indian cuisine correctly');

const highProtein = RecipeRepository.filterRecipes({ minProtein: 24 });
assert(highProtein.length > 0 && highProtein.every((r) => r.estimated_protein >= 24), 'RecipeRepository filters by minProtein >= 24g');

// ----------------------------------------------------
// 3. Test Natural Language Food Parser (analyzeMeal)
// ----------------------------------------------------
console.log('\n[3/4] Testing Natural Language Food Parser & Rules Engine...');

// Test 3.1: Complex multi-item breakfast parsing
const breakfastText = '2 besan chillas with 100g paneer, 1 cup curd and 1 banana';
const breakfastResult = analyzeMeal(breakfastText, 'breakfast');

assert(breakfastResult.items.length === 4, `Parsed 4 distinct items from complex string (got ${breakfastResult.items.length})`);
assert(breakfastResult.totalCalories >= 600 && breakfastResult.totalCalories <= 750, `Calorie estimation realistic (${breakfastResult.totalCalories} kcal)`);
assert(breakfastResult.totalProtein >= 30, `Protein estimation realistic (${breakfastResult.totalProtein}g)`);
assert(breakfastResult.confidence === 'high', `Confidence is HIGH when explicit quantities & food matches exist (got ${breakfastResult.confidence})`);
assert(breakfastResult.warnings.length === 0, 'No warnings for compliant vegetarian meal');

// Test 3.2: Scaling test (150g tofu vs 100g base)
const tofuText = '150g firm tofu';
const tofuResult = analyzeMeal(tofuText, 'lunch');
assert(tofuResult.items.length === 1, 'Parsed 150g firm tofu');
const tofuItem = tofuResult.items[0];
assert(tofuItem.quantity === 150 && tofuItem.unit === 'g', 'Quantity correctly extracted as 150g');
assert(tofuItem.calories === 216, `150g tofu scaled correctly: expected 216 kcal, got ${tofuItem.calories}`);
assert(tofuItem.protein > 23 && tofuItem.protein < 24, `150g tofu protein scaled correctly (~23.3g, got ${tofuItem.protein})`);

// Test 3.3: Ambiguous portion inference (medium confidence)
const mediumText = 'yellow dal and rice';
const mediumResult = analyzeMeal(mediumText, 'lunch');
assert(mediumResult.confidence === 'medium', `Inferred portions set confidence to MEDIUM (got ${mediumResult.confidence})`);
assert(mediumResult.items.some((it) => it.clarification_needed === 1), 'Clarification flag set when portion size is assumed');

// Test 3.4: Dietary Violation Detection
const eggTest = checkDietaryViolations('2 boiled eggs with toast');
assert(eggTest.length > 0 && eggTest[0].includes('Eggs detected'), 'Egg exclusion warning triggered');

const mushroomTest = checkDietaryViolations('creamy mushroom pasta');
assert(mushroomTest.length > 0 && mushroomTest[0].includes('Mushrooms detected'), 'Mushroom exclusion warning triggered');

const chickenTest = checkDietaryViolations('grilled chicken and salad');
assert(chickenTest.length > 0 && chickenTest[0].includes('Non-vegetarian food detected'), 'Non-vegetarian warning triggered');

// ----------------------------------------------------
// 4. Test MealRepository CRUD & DailyLog Macro Sync
// ----------------------------------------------------
console.log('\n[4/4] Testing MealRepository CRUD & Macro Totals Synchronization...');

const testDate = '2026-09-01'; // Isolated test date
const createdMeal = MealRepository.createMeal(
  {
    date: testDate,
    meal_type: 'breakfast',
    raw_text: '100g paneer with 2 rotis',
    total_calories: 475,
    total_protein: 24.7,
    total_carbs: 43.5,
    total_fat: 22.0,
    confidence: 'high',
    is_verified_by_user: 1,
  },
  [
    {
      food_name: 'Paneer (Raw / Low Fat)',
      quantity: 100,
      unit: 'g',
      calories_estimated: 265,
      protein_estimated: 18.3,
      carbs_estimated: 3.5,
      fat_estimated: 20.0,
      confidence_score: 'high',
    },
    {
      food_name: 'Roti / Chapati (Whole Wheat)',
      quantity: 2,
      unit: 'piece',
      calories_estimated: 210,
      protein_estimated: 6.4,
      carbs_estimated: 40.0,
      fat_estimated: 2.0,
      confidence_score: 'high',
    },
  ]
);

assert(createdMeal.id.startsWith('meal_'), 'Meal created with valid ID');
assert(createdMeal.items.length === 2, 'Child estimates created and attached');

// Verify DailyLog synced
const logForDate = DailyLogsRepository.getLogByDate(testDate);
assert(logForDate !== null, 'DailyLog created/found for test date');
assert(logForDate?.calories_consumed === 475, `DailyLog calories_consumed synced to 475 (got ${logForDate?.calories_consumed})`);
assert(logForDate?.protein_consumed === 24.7, `DailyLog protein_consumed synced to 24.7 (got ${logForDate?.protein_consumed})`);

// Test estimate adjustment
const estimateToUpdate = createdMeal.items[0];
MealRepository.updateEstimate(estimateToUpdate.id, {
  quantity: 150,
  calories_estimated: 398,
  protein_estimated: 27.5,
});

const updatedMeal = MealRepository.getMealById(createdMeal.id);
assert(updatedMeal !== null && updatedMeal.total_calories === 608, `Parent meal total calories recalculated after estimate update (expected 608, got ${updatedMeal?.total_calories})`);

const logAfterUpdate = DailyLogsRepository.getLogByDate(testDate);
assert(logAfterUpdate?.calories_consumed === 608, `DailyLog calories updated after estimate edit (expected 608, got ${logAfterUpdate?.calories_consumed})`);

// Test deletion
MealRepository.deleteMeal(createdMeal.id);
const mealsAfterDelete = MealRepository.getMealsByDate(testDate);
assert(mealsAfterDelete.length === 0, 'Meal and child estimates deleted cleanly');

const logAfterDelete = DailyLogsRepository.getLogByDate(testDate);
assert(logAfterDelete?.calories_consumed === 0, 'DailyLog calories synced back to 0 after meal deletion');

// ----------------------------------------------------
// Summary
// ----------------------------------------------------
console.log('\n========================================');
console.log(`Phase 2 Verification Complete: ${passCount} Passed, ${failCount} Failed.`);
console.log('========================================');

if (failCount > 0) {
  throw new Error(`Verification failed with ${failCount} errors.`);
}

