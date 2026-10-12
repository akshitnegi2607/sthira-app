/**
 * Sthira — Phase 4 Verification Test Suite
 * Tests:
 * 1. Database schema and historical seed migrations
 * 2. Exponential Moving Average (EMA) mathematical filter & rate velocity
 * 3. Calorie Adaptation Engine (compliance, surplus adapt, temper gain, sweet spot)
 * 4. Sleep & Recovery vs Gym Volume Correlation Engine
 * 5. Lean Bulk Trajectory Modeling (64.0 kg -> 67.0 kg @ +0.15 kg/week)
 * 6. SQLite Repository persistence (weights, daily sync, goal target adjustment, weekly reviews)
 */

import {
  calculateWeightEma,
  calculateWeeklyGainRate,
  calculateCalorieAdaptation,
  correlateSleepAndWorkout,
  calculateLeanBulkTrajectory,
  WeightDataPoint,
} from '../src/services/progressAnalytics';
import { ProgressRepository } from '../src/database/repositories/progressRepository';
import { ProfileRepository } from '../src/database/repositories/profileRepository';
import { runMigrations } from '../src/database/migrations';

declare const process: any;

console.log('========================================');
console.log('     STHIRA - PHASE 4 VERIFICATION      ');
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
// 1. Database Migrations & Initial Setup
// ----------------------------------------------------
console.log('[1/6] Testing Database Initial Setup & Seed Data...');
try {
  runMigrations();
  assert(true, 'Database migrations executed successfully.');
} catch (e: any) {
  assert(false, 'Database migrations failed.', e.message);
}

const history = ProgressRepository.getWeightHistory();
assert(history.length >= 1, `Loaded ${history.length} scale weight entries (Day 1 baseline: ${history[0]?.weight_kg} kg).`);

const profile = ProfileRepository.getProfile();
assert(profile !== null && profile.target_weight === 67.0, 'Profile loaded with 67.0 kg lean bulk target.');

const goals = ProfileRepository.getGoals();
assert(goals !== null && goals.calories_target >= 2400, `Goals loaded with calories target ${goals?.calories_target}.`);

// ----------------------------------------------------
// 2. Exponential Moving Average (EMA) Engine
// ----------------------------------------------------
console.log('\n[2/6] Testing Exponential Moving Average (EMA) Filter...');

const emptyEma = calculateWeightEma([]);
assert(emptyEma.length === 0, 'Empty data returns empty EMA series.');

const singlePoint: WeightDataPoint[] = [{ date: '2026-10-01', weightKg: 64.0 }];
const singleEma = calculateWeightEma(singlePoint);
assert(
  singleEma.length === 1 && singleEma[0].emaKg === 64.0 && singleEma[0].weightKg === 64.0,
  'Single point returns identical raw weight and EMA trend.'
);

// 3-point test with transient water spike
// Day 1: 64.0, Day 2: 64.0, Day 3: 65.0 (+1kg sodium/water spike)
// Day 1 EMA = 64.0
// Day 2 EMA = 0.1 * 64.0 + 0.9 * 64.0 = 64.0
// Day 3 EMA = 0.1 * 65.0 + 0.9 * 64.0 = 6.5 + 57.6 = 64.10
const spikeData: WeightDataPoint[] = [
  { date: '2026-10-01', weightKg: 64.0 },
  { date: '2026-10-02', weightKg: 64.0 },
  { date: '2026-10-03', weightKg: 65.0 },
];
const spikeEma = calculateWeightEma(spikeData, 0.1);
assert(spikeEma[2].weightKg === 65.0, 'Raw measured scale reflects exact spike (65.0 kg).');
assert(
  spikeEma[2].emaKg === 64.1,
  `EMA mathematically dampened transient 1.0kg water spike to +0.10kg (got ${spikeEma[2].emaKg} kg).`
);

// Weekly rate calculation
// 7-day delta from 64.0 to 64.15 = +0.15 kg/week
const ratePoints = [
  { date: '2026-10-01', weightKg: 64.0, emaKg: 64.0 },
  { date: '2026-10-08', weightKg: 64.2, emaKg: 64.15 },
];
const calculatedRate = calculateWeeklyGainRate(ratePoints, 7);
assert(
  calculatedRate === 0.15,
  `Weekly velocity calculated accurately: +${calculatedRate} kg/week (expected +0.15 kg/week).`
);

// ----------------------------------------------------
// 3. Calorie Adaptation Engine
// ----------------------------------------------------
console.log('\n[3/6] Testing Calorie Adaptation Sports Science Logic...');

// Case A: Optimal Lean Bulk (+0.14 kg/wk)
const optimalAdapt = calculateCalorieAdaptation({
  currentEmaKg: 64.14,
  pastEmaKg: 64.0,
  daysBetween: 7,
  targetGainRateKgPerWeek: 0.15,
  currentCalorieTarget: 2450,
  averageCalorieIntake: 2430,
  averageProteinIntake: 120,
  targetProteinMin: 110,
});
assert(optimalAdapt.action === 'maintain', 'Optimal rate (0.14 kg/wk) action is maintain.');
assert(optimalAdapt.recommendedCalorieDelta === 0, 'No calorie change recommended when on track.');
assert(optimalAdapt.statusBadge === 'ON TRACK', 'Status badge is ON TRACK.');
assert(optimalAdapt.isEstimated === true, 'Strict isEstimated distinction flag set to true.');

// Case B: Stalling (< 0.10 kg/wk, e.g. +0.02 kg/wk) with compliant eating
const stallAdapt = calculateCalorieAdaptation({
  currentEmaKg: 64.02,
  pastEmaKg: 64.0,
  daysBetween: 7,
  targetGainRateKgPerWeek: 0.15,
  currentCalorieTarget: 2450,
  averageCalorieIntake: 2410,
  averageProteinIntake: 118,
  targetProteinMin: 110,
});
assert(stallAdapt.action === 'increase', 'Stalling rate action is increase.');
assert(stallAdapt.recommendedCalorieDelta === 125, 'Recommends conservative +125 kcal surplus adjustment.');
assert(stallAdapt.newRecommendedCalories === 2575, `New target recommended is 2,575 kcal (got ${stallAdapt.newRecommendedCalories}).`);
assert(stallAdapt.statusBadge === 'ADAPT SURPLUS', 'Status badge is ADAPT SURPLUS.');

// Case C: Gaining too fast (> 0.20 kg/wk, e.g. +0.28 kg/wk)
const fastAdapt = calculateCalorieAdaptation({
  currentEmaKg: 64.28,
  pastEmaKg: 64.0,
  daysBetween: 7,
  targetGainRateKgPerWeek: 0.15,
  currentCalorieTarget: 2575,
  averageCalorieIntake: 2600,
  averageProteinIntake: 125,
  targetProteinMin: 110,
});
assert(fastAdapt.action === 'decrease', 'Gaining too fast (>0.20 kg/wk) action is decrease.');
assert(fastAdapt.recommendedCalorieDelta === -100, 'Recommends -100 kcal reduction to temper fat accretion.');
assert(fastAdapt.statusBadge === 'TEMPER GAIN', 'Status badge is TEMPER GAIN.');

// Case D: Stalling due to compliance (user ate only 1,800 kcal vs 2,450 kcal target)
const complianceAdapt = calculateCalorieAdaptation({
  currentEmaKg: 64.02,
  pastEmaKg: 64.0,
  daysBetween: 7,
  targetGainRateKgPerWeek: 0.15,
  currentCalorieTarget: 2450,
  averageCalorieIntake: 1800, // < 85% of target
  averageProteinIntake: 90,
  targetProteinMin: 110,
});
assert(complianceAdapt.action === 'maintain', 'Compliance check keeps calories unchanged instead of raising them.');
assert(complianceAdapt.statusBadge === 'COMPLIANCE CHECK', 'Status badge flags COMPLIANCE CHECK.');
assert(complianceAdapt.recommendedCalorieDelta === 0, 'Delta is 0 until user hits current target.');

// ----------------------------------------------------
// 4. Sleep & Gym Performance Correlation Engine
// ----------------------------------------------------
console.log('\n[4/6] Testing Sleep & Gym Volume Correlation Engine...');

// Test with sufficient historical data
const dummySleepLogs = [
  { date: '2026-10-01', sleep_hours: 8.0 },
  { date: '2026-10-03', sleep_hours: 8.2 },
  { date: '2026-10-05', sleep_hours: 6.2 },
  { date: '2026-10-07', sleep_hours: 6.5 },
];

const dummyWorkouts = [
  { date: '2026-10-01', totalVolumeKg: 8500 },
  { date: '2026-10-03', totalVolumeKg: 8800 },
  { date: '2026-10-05', totalVolumeKg: 7200 },
  { date: '2026-10-07', totalVolumeKg: 7400 },
];

const correlation = correlateSleepAndWorkout(dummySleepLogs, dummyWorkouts);
assert(correlation.hasSufficientData === true, 'Identified sufficient correlation dataset.');
assert(correlation.highSleepAvgVolumeKg === 8650, `High sleep avg volume is 8,650 kg (got ${correlation.highSleepAvgVolumeKg}).`);
assert(correlation.lowSleepAvgVolumeKg === 7300, `Low sleep avg volume is 7,300 kg (got ${correlation.lowSleepAvgVolumeKg}).`);
assert(correlation.volumeDifferentialPercent === 18, `Volume differential is +18% (got +${correlation.volumeDifferentialPercent}%).`);
assert(correlation.highSleepSessionCount === 2, 'High sleep session count is 2.');
assert(correlation.lowSleepSessionCount === 2, 'Low sleep session count is 2.');

// Insufficient data fallback
const emptyCorrelation = correlateSleepAndWorkout([], []);
assert(emptyCorrelation.hasSufficientData === false, 'Handles insufficient data gracefully.');
assert(emptyCorrelation.insight.includes('Log 7+ nights'), 'Returns friendly prompt to log more sleep.');

// ----------------------------------------------------
// 5. Lean Bulk Trajectory Engine
// ----------------------------------------------------
console.log('\n[5/6] Testing Lean Bulk Trajectory Modeling...');

const trajectory = calculateLeanBulkTrajectory(64.0, 64.3, 67.0, 0.15);
assert(trajectory.startWeightKg === 64.0, 'Start weight is 64.0 kg.');
assert(trajectory.targetWeightKg === 67.0, 'Target weight is 67.0 kg.');
assert(trajectory.totalGainTargetKg === 3.0, 'Total gain target is 3.0 kg.');
assert(trajectory.gainedSoFarKg === 0.3, 'Gained so far is 0.3 kg.');
assert(trajectory.remainingKg === 2.7, 'Remaining gain is 2.7 kg.');
assert(trajectory.progressPercent === 10, `Progress percent is 10% (got ${trajectory.progressPercent}%).`);
assert(trajectory.projectedWeeksRemaining === 18.0, `Projected weeks remaining is 18.0 (got ${trajectory.projectedWeeksRemaining}).`);
assert(trajectory.projectedTargetDate.length > 5, `Generated target projected date: ${trajectory.projectedTargetDate}.`);

// ----------------------------------------------------
// 6. SQLite Repository Integration
// ----------------------------------------------------
console.log('\n[6/6] Testing SQLite Progress Repository CRUD & Goal Adjustments...');

// Log new scale weight
const testDate = new Date().toISOString().split('T')[0];
const loggedEntry = ProgressRepository.logWeight(64.2, testDate, 'Morning fasted verification weigh-in');
assert(loggedEntry.weight_kg === 64.2, `Scale weight logged successfully: ${loggedEntry.weight_kg} kg.`);
assert(loggedEntry.date === testDate, `Date matched: ${loggedEntry.date}.`);

// Verify DailyLogs updated
const todayLog = ProgressRepository.getDailyLogsForPeriod(3).find((l) => l.date === testDate);
assert(todayLog?.weight === 64.2, `DailyLogs synchronized with weight: ${todayLog?.weight} kg.`);

// Verify UserProfile updated
const updatedProfile = ProfileRepository.getProfile();
assert(updatedProfile?.current_weight === 64.2, `UserProfile current_weight updated: ${updatedProfile?.current_weight} kg.`);

// Calorie adjustment
const initialTarget = ProfileRepository.getGoals()!.calories_target;
const updatedGoals = ProgressRepository.applyCalorieAdjustment(125);
assert(
  updatedGoals.calories_target === initialTarget + 125,
  `Calorie target incremented from ${initialTarget} to ${updatedGoals.calories_target} kcal (+125 kcal).`
);

// Revert calorie adjustment to keep baseline clean
ProgressRepository.applyCalorieAdjustment(-125);

// Weekly review persistence
const savedReview = ProgressRepository.saveWeeklyReview({
  start_date: '2026-10-01',
  end_date: '2026-10-07',
  start_weight: 64.0,
  end_weight: 64.15,
  weight_change: 0.15,
  avg_calories: 2440,
  avg_protein: 119,
  workouts_completed: 4,
  exercises_progressed: 3,
  avg_sleep_hours: 7.6,
  coach_summary: 'Target velocity achieved at +0.15 kg/week. Maintain calories.',
  calorie_target_recommendation: 'Maintain 2,450 kcal',
});

assert(savedReview !== null && savedReview.id.includes('2026-10-01'), 'WeeklyReview saved to SQLite.');
const allReviews = ProgressRepository.getWeeklyReviews();
assert(allReviews.length >= 1, `Retrieved ${allReviews.length} weekly reviews from database.`);

// Summary
console.log('\n========================================');
console.log(`VERIFICATION COMPLETE: ${passCount} PASSED, ${failCount} FAILED`);
console.log('========================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
