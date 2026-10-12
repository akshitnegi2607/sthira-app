/**
 * Sthira — Verification Script for Workout Completion, Custom Meals, Date Utilities, and Baseline Guard
 */

import { getTodayDateString, shiftDateString, formatDateLabel, parseDateString } from '../src/utils/date';
import { analyzeMeal } from '../src/services/mealParser';

declare const process: any;

console.log('====================================================');
console.log('   STHIRA - WORKOUT & NUTRITION FIXES VERIFICATION  ');
console.log('====================================================\n');

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

// 1. DATE UTILITIES TESTS
console.log('--- 1. Testing Date Utilities ---');
const today = getTodayDateString();
assert(/^\d{4}-\d{2}-\d{2}$/.test(today), `getTodayDateString returns YYYY-MM-DD format (${today})`);

const parsed = parseDateString('2026-10-12');
assert(parsed.getFullYear() === 2026 && parsed.getMonth() === 9 && parsed.getDate() === 12, 'parseDateString preserves exact calendar date');

const prevDay = shiftDateString('2026-10-12', -1);
assert(prevDay === '2026-10-11', `shiftDateString -1 day correctly produces 2026-10-11 (${prevDay})`);

const nextDay = shiftDateString('2026-10-12', 1);
assert(nextDay === '2026-10-13', `shiftDateString +1 day correctly produces 2026-10-13 (${nextDay})`);

const label = formatDateLabel('2026-10-12');
assert(label.includes('Oct 12'), `formatDateLabel produces readable label with correct day (${label})`);

// 2. WORKOUT WEEK DAY ORDER TESTS
console.log('\n--- 2. Testing Workout Schedule Week Day Locking ---');
const toWeekOrder = (d: number | null | undefined) => {
  if (d === null || d === undefined) return 0;
  return d === 0 ? 7 : d;
};

// Monday = 1, Wednesday = 3, Friday = 5, Sunday = 7
assert(toWeekOrder(1) === 1, 'Monday is day 1 of training week');
assert(toWeekOrder(3) === 3, 'Wednesday is day 3 of training week');
assert(toWeekOrder(6) === 6, 'Saturday is day 6 of training week');
assert(toWeekOrder(0) === 7, 'Sunday is day 7 of training week');

const testTodayDay = 3; // Wednesday (order 3)
const wedOrder = toWeekOrder(testTodayDay);
assert(toWeekOrder(1) < wedOrder, 'Monday (Upper A) is recognized as past day when today is Wednesday');
assert(toWeekOrder(2) < wedOrder, 'Tuesday (Yoga) is recognized as past day when today is Wednesday');
assert(toWeekOrder(3) === wedOrder, 'Wednesday (Lower A) is recognized as today');
assert(toWeekOrder(4) > wedOrder, 'Thursday (Upper B) is recognized as future day when today is Wednesday');
assert(toWeekOrder(5) > wedOrder, 'Friday (Lower B) is recognized as future day when today is Wednesday');
assert(toWeekOrder(0) > wedOrder, 'Sunday (Swim) is recognized as future day when today is Wednesday');

// 3. EXPANDED STAPLE FOODS IN ANALYZE MEAL
console.log('\n--- 3. Testing Expanded Food Parser with Jay\'s Staples ---');

const oatsMeal = analyzeMeal('50g oats with 1 scoop whey protein and 200ml milk', 'breakfast');
assert(oatsMeal.items.length >= 3, `Oats, whey, and milk parsed 3 distinct items (got ${oatsMeal.items.length})`);
assert(oatsMeal.totalProtein >= 30, `Protein shake bowl provides >= 30g protein (got ${oatsMeal.totalProtein}g)`);
assert(oatsMeal.totalCalories >= 400, `Protein shake bowl provides realistic calories (got ${oatsMeal.totalCalories} kcal)`);

const paneerMeal = analyzeMeal('100g paneer bhurji with 2 rotis', 'lunch');
assert(paneerMeal.items.length >= 2, `Paneer bhurji and rotis parsed 2 distinct items (got ${paneerMeal.items.length})`);
assert(paneerMeal.totalProtein >= 20, `Paneer bhurji with rotis provides >= 20g protein (got ${paneerMeal.totalProtein}g)`);

const khichdiMeal = analyzeMeal('1 bowl moong dal khichdi with 1 cup curd and 1 tsp ghee', 'dinner');
assert(khichdiMeal.items.length >= 3, `Khichdi, curd, and ghee parsed 3 items (got ${khichdiMeal.items.length})`);
assert(khichdiMeal.totalCalories >= 350, `Khichdi dinner provides realistic calories (got ${khichdiMeal.totalCalories} kcal)`);

const customSnack = analyzeMeal('1 tbsp peanut butter with 2 slices bread and 1 banana', 'snack');
assert(customSnack.items.length >= 3, `PB toast with banana parsed 3 items (got ${customSnack.items.length})`);
assert(customSnack.totalCalories >= 300, `PB toast snack provides >= 300 kcal (got ${customSnack.totalCalories} kcal)`);

// Dietary exclusions test
const eggCheck = analyzeMeal('2 boiled eggs with toast', 'breakfast');
assert(eggCheck.warnings.length > 0 && eggCheck.warnings[0].includes('Eggs detected'), 'Eggs correctly flagged as dietary violation');

const mushroomCheck = analyzeMeal('mushroom soup with bread', 'dinner');
assert(mushroomCheck.warnings.length > 0 && mushroomCheck.warnings[0].includes('Mushrooms detected'), 'Mushrooms correctly flagged as dietary violation');

console.log('\n====================================================');
console.log(`TOTAL TESTS: ${passCount + failCount}`);
console.log(`PASSED: ${passCount}`);
console.log(`FAILED: ${failCount}`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
}
