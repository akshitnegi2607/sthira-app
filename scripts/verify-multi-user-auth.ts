declare const process: any;

import { AuthService } from '../src/services/authService';
import { DEFAULT_ACCOUNTS } from '../src/types/auth';
import { ProfileRepository } from '../src/database/repositories/profileRepository';
import { DailyLogsRepository } from '../src/database/repositories/dailyLogsRepository';
import { MealRepository } from '../src/database/repositories/mealRepository';
import { getActiveDatabaseName, getActiveWebStorageKey } from '../src/database/db';

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

console.log('--- TEST SUITE: Sthira Multi-User Authentication & Master Data Isolation ---');

// 1. Initial Accounts Verification
console.log('\n[1] Default Accounts Verification');
const accounts = AuthService.getAccounts();
assert(accounts.length === 4, `Found 4 pre-seeded accounts (actual: ${accounts.length})`);

const jay = accounts.find((a) => a.id === 'jay');
assert(jay !== undefined && jay.role === 'master', 'Jay account is marked as MASTER');
assert(jay?.dbName === 'aicoach.db', 'Jay points to master database: aicoach.db');
assert(jay?.webStorageKey === '__aicoach_web_db__', 'Jay points to master web key: __aicoach_web_db__');

const arjun = accounts.find((a) => a.id === 'arjun');
const rohan = accounts.find((a) => a.id === 'rohan');
const priya = accounts.find((a) => a.id === 'priya');
assert(arjun !== undefined && arjun.role === 'friend', 'Arjun account is marked as FRIEND');
assert(rohan !== undefined && rohan.role === 'friend', 'Rohan account is marked as FRIEND');
assert(priya !== undefined && priya.role === 'friend', 'Priya account is marked as FRIEND');

// 2. PIN Authentication Tests
console.log('\n[2] PIN Authentication & Validation');
const wrongPinRes = AuthService.login('jay', '9999');
assert(!wrongPinRes.success, 'Wrong PIN for Jay rejected');

const validJayRes = AuthService.login('jay', '1234');
assert(validJayRes.success && validJayRes.account?.id === 'jay', 'Jay logs in with PIN 1234');
assert(getActiveDatabaseName() === 'aicoach.db', 'Active database set to aicoach.db');

const validArjunRes = AuthService.login('arjun', '1111');
assert(validArjunRes.success && validArjunRes.account?.id === 'arjun', 'Arjun logs in with PIN 1111');
assert(getActiveDatabaseName() === 'aicoach_arjun.db', 'Active database set to aicoach_arjun.db');

const validRohanRes = AuthService.login('rohan', '2222');
assert(validRohanRes.success && validRohanRes.account?.id === 'rohan', 'Rohan logs in with PIN 2222');

const validPriyaRes = AuthService.login('priya', '3333');
assert(validPriyaRes.success && validPriyaRes.account?.id === 'priya', 'Priya logs in with PIN 3333');

// 3. Master Data Isolation Verification
console.log('\n[3] Master Data Isolation & Segregation');

// Switch to Jay
AuthService.login('jay', '1234');
const initialJayProfile = ProfileRepository.getProfile();
assert(initialJayProfile !== null, 'Jay profile retrieved');

// Jay logs test water & weight in Jay's DB
DailyLogsRepository.logWater('2026-11-13', 0.5);
DailyLogsRepository.updateDailyLog('2026-11-13', { weight: 64.2 });
const jayTodayLog = DailyLogsRepository.getOrCreateLog('2026-11-13');
assert(jayTodayLog.weight === 64.2, `Jay logged weight 64.2 kg (actual: ${jayTodayLog.weight})`);
assert(jayTodayLog.water_liters >= 0.5, `Jay water logged (actual: ${jayTodayLog.water_liters} L)`);

// Switch to Arjun
AuthService.login('arjun', '1111');
const arjunProfile = ProfileRepository.getProfile();
assert(arjunProfile?.name === 'Arjun', `Arjun profile name is Arjun (actual: ${arjunProfile?.name})`);

// Check that Arjun does NOT see Jay's water or weight for today
const arjunTodayLog = DailyLogsRepository.getOrCreateLog('2026-11-13');
assert(arjunTodayLog.weight !== 64.2, `Arjun does NOT have Jay's weight (Arjun weight: ${arjunTodayLog.weight})`);

// Arjun logs his own weight and meal
DailyLogsRepository.updateDailyLog('2026-11-13', { weight: 68.8 });
DailyLogsRepository.logWater('2026-11-13', 1.0);
MealRepository.createMeal(
  {
    date: '2026-11-13',
    meal_type: 'lunch',
    raw_text: 'Arjun Protein Bowl',
    total_calories: 650,
    total_protein: 42,
    total_carbs: 70,
    total_fat: 18,
    confidence: 'high',
    is_verified_by_user: 1,
  },
  []
);

const arjunMeals = MealRepository.getMealsByDate('2026-11-13');
assert(arjunMeals.length > 0, `Arjun has ${arjunMeals.length} meal(s) logged in his database`);
const arjunUpdatedLog = DailyLogsRepository.getOrCreateLog('2026-11-13');
assert(arjunUpdatedLog.weight === 68.8, `Arjun weight is 68.8 kg in Arjun's database`);

// Switch BACK to Jay (Master Account)
console.log('\n[4] Switching Back to Jay (Master Data Pristine Check)');
AuthService.login('jay', '1234');
const jayRecheckedProfile = ProfileRepository.getProfile();
assert(jayRecheckedProfile?.name === 'Jay', `Jay profile name is Jay (actual: ${jayRecheckedProfile?.name})`);

const jayRecheckedLog = DailyLogsRepository.getOrCreateLog('2026-11-13');
assert(jayRecheckedLog.weight === 64.2, `Jay weight is STILL 64.2 kg (100% untouched by Arjun)`);
assert(jayRecheckedLog.weight !== 68.8, `Jay does NOT have Arjun's 68.8 kg weight`);

// Check that Jay has NOT received Arjun's meal
const jayMeals = MealRepository.getMealsByDate('2026-11-13');
const hasArjunMeal = jayMeals.some((m: any) => m.raw_text?.includes('Arjun'));
assert(!hasArjunMeal, 'Arjun meal is NOT present in Jay master database');

// 5. PIN Modification
console.log('\n[5] Custom PIN Updates');
const pinUpdateSuccess = AuthService.updateAccountPin('arjun', '5555');
assert(pinUpdateSuccess, 'Arjun PIN successfully updated to 5555');
assert(!AuthService.login('arjun', '1111').success, 'Old PIN 1111 fails');
assert(AuthService.login('arjun', '5555').success, 'New PIN 5555 succeeds');

// Restore Arjun PIN to 1111 for test consistency
AuthService.updateAccountPin('arjun', '1111');

// 6. Logout / Lock App
console.log('\n[6] Logout / Lock Mode');
AuthService.logout();
assert(AuthService.getActiveAccount() === null, 'Active account is null after logout');
assert(!AuthService.isAuthenticated(), 'isAuthenticated is false after logout');

// Re-login to Jay
AuthService.login('jay', '1234');
assert(AuthService.isAuthenticated(), 'Re-login to Jay succeeds');

console.log(`\n========================================`);
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
