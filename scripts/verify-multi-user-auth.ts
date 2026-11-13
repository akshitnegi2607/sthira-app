declare const process: any;

import { AuthService } from '../src/services/authService';
import { DEFAULT_ACCOUNTS } from '../src/types/auth';
import { ProfileRepository } from '../src/database/repositories/profileRepository';
import { DailyLogsRepository } from '../src/database/repositories/dailyLogsRepository';
import { MealRepository } from '../src/database/repositories/mealRepository';
import { WorkoutRepository } from '../src/database/repositories/workoutRepository';
import { getActiveDatabaseName, getActiveWebStorageKey } from '../src/database/db';
import { SupabaseSyncService } from '../src/services/supabaseSyncService';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('--- TEST SUITE: Sthira Multi-User Authentication & Trainer Program Verification ---');

// 1. Initial Accounts Verification
console.log('\n[1] Default Accounts Verification');
const accounts = AuthService.getAccounts();
assert(accounts.length === 4, `Found 4 pre-seeded accounts (actual: ${accounts.length})`);

const jay = accounts.find((a) => a.id === 'jay');
assert(jay !== undefined && jay.role === 'master', 'Jay account is marked as MASTER');
assert(jay?.dbName === 'aicoach.db', 'Jay points to master database: aicoach.db');
assert(jay?.webStorageKey === '__aicoach_web_db__', 'Jay points to master web key: __aicoach_web_db__');

const akku = accounts.find((a) => a.id === 'akku');
const ashish = accounts.find((a) => a.id === 'ashish');
const div = accounts.find((a) => a.id === 'div');
assert(akku !== undefined && akku.role === 'friend', 'Akku account is marked as FRIEND');
assert(ashish !== undefined && ashish.role === 'friend', 'Ashish account is marked as FRIEND');
assert(div !== undefined && div.role === 'friend', 'Div account is marked as FRIEND');

// 2. Case-Insensitive Username & Password Authentication
console.log('\n[2] Case-Insensitive Username & Password Authentication');
const wrongPassRes = AuthService.login('Jay', 'WrongPassword');
assert(!wrongPassRes.success, 'Wrong password for Jay rejected');

// Jay with lowercase 'jay'
const validJayLower = AuthService.login('jay', 'Quercus2026');
assert(validJayLower.success && validJayLower.account?.id === 'jay', 'Jay logs in with lowercase "jay"');
assert(getActiveDatabaseName() === 'aicoach.db', 'Active database set to aicoach.db');

// Jay with UPPERCASE 'JAY'
const validJayUpper = AuthService.login('JAY', 'Quercus2026');
assert(validJayUpper.success && validJayUpper.account?.id === 'jay', 'Jay logs in with UPPERCASE "JAY"');

// Akku
const validAkku = AuthService.login('Akku', 'Akku1234');
assert(validAkku.success && validAkku.account?.id === 'akku', 'Akku logs in with "Akku"');
assert(getActiveDatabaseName() === 'aicoach_akku.db', 'Active database set to aicoach_akku.db');

// Akku lowercase
const validAkkuLower = AuthService.login('akku', 'Akku1234');
assert(validAkkuLower.success, 'Akku logs in with lowercase "akku"');

// Ashish
const validAshish = AuthService.login('ashish', 'Ashish1234');
assert(validAshish.success && validAshish.account?.id === 'ashish', 'Ashish logs in with "ashish"');

// Div
const validDiv = AuthService.login('DIV', 'Isha1234');
assert(validDiv.success && validDiv.account?.id === 'div', 'Div logs in with "DIV" and password "Isha1234"');

// 3. Master Data Isolation Verification
console.log('\n[3] Master Data Isolation & Segregation');

// Switch to Jay
AuthService.login('Jay', 'Quercus2026');
const initialJayProfile = ProfileRepository.getProfile();
assert(initialJayProfile !== null, 'Jay profile retrieved');

// Jay logs test water & weight in Jay's DB
DailyLogsRepository.logWater('2026-11-13', 0.75);
DailyLogsRepository.updateDailyLog('2026-11-13', { weight: 64.3 });
const jayTodayLog = DailyLogsRepository.getOrCreateLog('2026-11-13');
assert(jayTodayLog.weight === 64.3, `Jay logged weight 64.3 kg (actual: ${jayTodayLog.weight})`);
assert(jayTodayLog.water_liters >= 0.75, `Jay water logged (actual: ${jayTodayLog.water_liters} L)`);

// Switch to Akku
AuthService.login('Akku', 'Akku1234');
const akkuProfile = ProfileRepository.getProfile();
assert(akkuProfile?.name === 'Akku', `Akku profile name is Akku (actual: ${akkuProfile?.name})`);

// Check that Akku does NOT see Jay's water or weight for today
const akkuTodayLog = DailyLogsRepository.getOrCreateLog('2026-11-13');
assert(akkuTodayLog.weight !== 64.3, `Akku does NOT have Jay's weight (Akku weight: ${akkuTodayLog.weight})`);

// Akku logs his own weight and meal
DailyLogsRepository.updateDailyLog('2026-11-13', { weight: 69.2 });
DailyLogsRepository.logWater('2026-11-13', 1.5);
MealRepository.createMeal(
  {
    date: '2026-11-13',
    meal_type: 'lunch',
    raw_text: 'Akku High Protein Lunch',
    total_calories: 720,
    total_protein: 48,
    total_carbs: 75,
    total_fat: 20,
    confidence: 'high',
    is_verified_by_user: 1,
  },
  []
);

const akkuMeals = MealRepository.getMealsByDate('2026-11-13');
assert(akkuMeals.length > 0, `Akku has ${akkuMeals.length} meal(s) logged in his database`);
const akkuUpdatedLog = DailyLogsRepository.getOrCreateLog('2026-11-13');
assert(akkuUpdatedLog.weight === 69.2, `Akku weight is 69.2 kg in Akku's database`);

// Switch BACK to Jay (Master Account)
console.log('\n[4] Switching Back to Jay (Master Data Pristine Check)');
AuthService.login('Jay', 'Quercus2026');
const jayRecheckedProfile = ProfileRepository.getProfile();
assert(jayRecheckedProfile?.name === 'Jay', `Jay profile name is Jay (actual: ${jayRecheckedProfile?.name})`);

const jayRecheckedLog = DailyLogsRepository.getOrCreateLog('2026-11-13');
assert(jayRecheckedLog.weight === 64.3, `Jay weight is STILL 64.3 kg (100% untouched by Akku)`);
assert(jayRecheckedLog.weight !== 69.2, `Jay does NOT have Akku's 69.2 kg weight`);

// Check that Jay has NOT received Akku's meal
const jayMeals = MealRepository.getMealsByDate('2026-11-13');
const hasAkkuMeal = jayMeals.some((m: any) => m.raw_text?.includes('Akku'));
assert(!hasAkkuMeal, 'Akku meal is NOT present in Jay master database');

// 5. Trainer Upper A (Cardio Removed) Verification
console.log('\n[5] Personal Trainer Upper A (15m Cardio Removed)');
const trainerUpperAExercises = WorkoutRepository.getExercisesForPlan('plan_trainer_upper_a');
const hasCardio = trainerUpperAExercises.some((e: any) => e.id === 'ex_cardio_15m' || e.name.toLowerCase().includes('cardio'));
assert(!hasCardio, 'Cardio (15 min) is REMOVED from Trainer Upper A');
assert(trainerUpperAExercises.length === 9, `Trainer Upper A has 9 exercises (actual: ${trainerUpperAExercises.length})`);

// 6. Trainer Lower A Verification
console.log('\n[6] Personal Trainer Lower A Verification');
const trainerLowerAExercises = WorkoutRepository.getExercisesForPlan('plan_trainer_lower_a');
assert(trainerLowerAExercises.length === 8, `Trainer Lower A has 8 exercises (actual: ${trainerLowerAExercises.length})`);
const lowerANames = trainerLowerAExercises.map((e: any) => e.name);
assert(lowerANames.includes('Bodyweight Squats'), 'Trainer Lower A includes Bodyweight Squats');
assert(lowerANames.includes('Seated Leg Curl'), 'Trainer Lower A includes Seated Leg Curl');
assert(lowerANames.includes('Dumbbell Goblet Squats'), 'Trainer Lower A includes Dumbbell Goblet Squats');
assert(lowerANames.includes('45 Degree Leg Press – Shoulder Width Stance'), 'Trainer Lower A includes 45 Degree Leg Press');
assert(lowerANames.includes('Dumbbell Step Ups'), 'Trainer Lower A includes Dumbbell Step Ups');
assert(lowerANames.includes('Smith Machine Calf Raises'), 'Trainer Lower A includes Smith Machine Calf Raises');
assert(lowerANames.includes('Stationary Rowing – 10 Minutes'), 'Trainer Lower A includes Stationary Rowing (10 Minutes)');

// 7. Trainer Lower B Verification
console.log('\n[7] Personal Trainer Lower B Verification');
const trainerLowerBExercises = WorkoutRepository.getExercisesForPlan('plan_trainer_lower_b');
assert(trainerLowerBExercises.length === 9, `Trainer Lower B has 9 exercises (actual: ${trainerLowerBExercises.length})`);
const lowerBNames = trainerLowerBExercises.map((e: any) => e.name);
assert(lowerBNames.includes('Bodyweight Squats'), 'Trainer Lower B includes Bodyweight Squats');
assert(lowerBNames.includes('Dumbbell Sumo Squats'), 'Trainer Lower B includes Dumbbell Sumo Squats');
assert(lowerBNames.includes('Alternating Dumbbell Lunges'), 'Trainer Lower B includes Alternating Dumbbell Lunges');
assert(lowerBNames.includes('Dumbbell Hip Thrust'), 'Trainer Lower B includes Dumbbell Hip Thrust');
assert(lowerBNames.includes('Cable Kickbacks'), 'Trainer Lower B includes Cable Kickbacks');
assert(lowerBNames.includes('Seated Leg Curl'), 'Trainer Lower B includes Seated Leg Curl');
assert(lowerBNames.includes('Single Leg Dumbbell Calf Raises'), 'Trainer Lower B includes Single Leg Dumbbell Calf Raises');
assert(lowerBNames.includes('Side Plank'), 'Trainer Lower B includes Side Plank');

// 8. Logout & Lock Mode
console.log('\n[8] Logout / Lock Mode');
AuthService.logout();
assert(AuthService.getActiveAccount() === null, 'Active account is null after logout');
assert(!AuthService.isAuthenticated(), 'isAuthenticated is false after logout');

// Re-login to Jay
AuthService.login('Jay', 'Quercus2026');
assert(AuthService.isAuthenticated(), 'Re-login to Jay succeeds');

// 9. Cloud Sync Exclusivity to Jay Master Profile
async function runAsyncTests() {
  console.log('\n[9] Cloud Sync Exclusivity to Jay Master Profile');
  // Jay is active
  const jaySync = await SupabaseSyncService.syncAll();
  assert(
    !jaySync.message.includes('exclusive to Jay master profile'),
    'Jay master account is allowed to execute sync (not blocked by exclusivity guard)'
  );

  // Switch to Akku
  AuthService.login('Akku', 'Akku1234');
  const akkuSync = await SupabaseSyncService.syncAll();
  assert(
    akkuSync.message.includes('exclusive to Jay master profile'),
    'Akku sync blocked with exclusivity message'
  );
  assert(akkuSync.pushed === 0 && akkuSync.pulled === 0, 'Akku has 0 pushed and 0 pulled items');

  const akkuConn = await SupabaseSyncService.testConnection();
  assert(!akkuConn.success && akkuConn.message.includes('exclusive to Jay master profile'), 'Akku testConnection blocked');

  // Switch to Div
  AuthService.login('Div', 'Isha1234');
  const divSync = await SupabaseSyncService.syncAll();
  assert(
    divSync.message.includes('exclusive to Jay master profile'),
    'Div sync blocked with exclusivity message'
  );

  // Switch back to Jay
  AuthService.login('Jay', 'Quercus2026');
  assert(AuthService.getActiveAccount()?.id === 'jay', 'Safely returned to Jay master profile');

  console.log(`\n========================================`);
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAsyncTests();
