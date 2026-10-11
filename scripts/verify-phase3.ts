/**
 * Sthira — Phase 3 Verification Test Suite
 * Tests progressive overload engine, exercise substitutions,
 * active workout logging, volume calculations, and joint pain tracking.
 */

import {
  calculateProgressiveOverload,
  parseRepRange,
  getWeightIncrementKg,
} from '../src/services/progressiveOverload';
import {
  getSubstitutesForExercise,
  getAssociatedBodyArea,
} from '../src/services/exerciseSubstitution';
import { WorkoutRepository } from '../src/database/repositories/workoutRepository';
import { runMigrations } from '../src/database/migrations';
import { Exercise } from '../src/types/database';

declare const process: any;

console.log('========================================');
console.log('     STHIRA - PHASE 3 VERIFICATION      ');
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
console.log('[1/4] Testing Database Initial Setup...');
try {
  runMigrations();
  assert(true, 'Database migrations executed successfully.');
} catch (e: any) {
  assert(false, 'Database migrations failed.', e.message);
}

const allExercises = WorkoutRepository.getAllExercises();
assert(allExercises.length >= 10, `Loaded ${allExercises.length} exercises from database.`);

const plans = WorkoutRepository.getAllPlans();
assert(plans.length === 7, `Loaded 7 weekly training split days (got ${plans.length}).`);

// ----------------------------------------------------
// 2. Progressive Overload Engine & Sports Science Logic
// ----------------------------------------------------
console.log('\n[2/4] Testing Progressive Overload Engine...');

// Test 2.1: Rep range parsing
const r1 = parseRepRange('8–12');
assert(r1.minReps === 8 && r1.maxReps === 12, 'Parsed "8–12" as min:8, max:12');

const r2 = parseRepRange('10-15');
assert(r2.minReps === 10 && r2.maxReps === 15, 'Parsed "10-15" as min:10, max:15');

// Test 2.2: Weight increment logic
const incUpper = getWeightIncrementKg('Chest', 30);
assert(incUpper === 2.5, `Upper compound increment is 2.5 kg (got ${incUpper})`);

const incArm = getWeightIncrementKg('Arms', 12);
assert(incArm === 1.25, `Arm isolation increment is 1.25 kg (got ${incArm})`);

const incLegHeavy = getWeightIncrementKg('Legs', 80);
assert(incLegHeavy === 5.0, `Heavy leg compound increment is 5.0 kg (got ${incLegHeavy})`);

// Test 2.3: Overload trigger: all sets hit top reps with RIR in reserve
const hitTargetResult = calculateProgressiveOverload({
  exerciseId: 'ex_chest_press_machine',
  exerciseName: 'Chest Press Machine',
  category: 'Chest',
  primaryMuscle: 'Pectoralis Major',
  targetSets: 3,
  targetRepRange: '8–12',
  lastWeightKg: 30,
  completedSets: [
    { setNumber: 1, weightKg: 30, reps: 12, rir: 2, isCompleted: true },
    { setNumber: 2, weightKg: 30, reps: 12, rir: 2, isCompleted: true },
    { setNumber: 3, weightKg: 30, reps: 12, rir: 1, isCompleted: true },
  ],
});

assert(hitTargetResult.action === 'increase', 'Progression action is "increase" when all sets reach 12 reps with RIR');
assert(hitTargetResult.recommendedWeightKg === 32.5, `Recommended weight increased from 30kg to 32.5kg (got ${hitTargetResult.recommendedWeightKg})`);
assert(hitTargetResult.recommendedReps === '8 reps', `Rep target resets to bottom of range: 8 reps (got ${hitTargetResult.recommendedReps})`);
assert(hitTargetResult.isEstimated === true, 'Strictly marked as isEstimated: true (Measured vs Estimated principle)');

// Test 2.4: Consolidate reps when top reps reached but RIR is 0 (failure)
const failureRirResult = calculateProgressiveOverload({
  exerciseId: 'ex_chest_press_machine',
  exerciseName: 'Chest Press Machine',
  category: 'Chest',
  primaryMuscle: 'Pectoralis Major',
  targetSets: 3,
  targetRepRange: '8–12',
  lastWeightKg: 30,
  completedSets: [
    { setNumber: 1, weightKg: 30, reps: 12, rir: 0, isCompleted: true },
    { setNumber: 2, weightKg: 30, reps: 12, rir: 0, isCompleted: true },
    { setNumber: 3, weightKg: 30, reps: 12, rir: 0, isCompleted: true },
  ],
});
assert(failureRirResult.action === 'maintain', 'Consolidates weight when RIR is 0 at limit');
assert(failureRirResult.recommendedWeightKg === 30, 'Maintains 30kg to build movement quality');

// Test 2.5: Deload reset when sets fall severely below target
const failedUnderReps = calculateProgressiveOverload({
  exerciseId: 'ex_db_shoulder_press',
  exerciseName: 'Dumbbell Shoulder Press',
  category: 'Shoulders',
  primaryMuscle: 'Deltoids',
  targetSets: 3,
  targetRepRange: '8–12',
  lastWeightKg: 20,
  completedSets: [
    { setNumber: 1, weightKg: 20, reps: 5, rir: 0, isCompleted: true },
    { setNumber: 2, weightKg: 20, reps: 5, rir: 0, isCompleted: true },
    { setNumber: 3, weightKg: 20, reps: 4, rir: 0, isCompleted: true },
  ],
});
assert(failedUnderReps.action === 'deload', 'Triggers deload action when severely under-repping');
assert(failedUnderReps.recommendedWeightKg === 18, `Recommended -10% reset to 18kg (got ${failedUnderReps.recommendedWeightKg})`);

// Test 2.6: Active Pain & Joint Fatigue Safety Deload
const painCautionResult = calculateProgressiveOverload({
  exerciseId: 'ex_db_shoulder_press',
  exerciseName: 'Dumbbell Shoulder Press',
  category: 'Shoulders',
  primaryMuscle: 'Deltoids',
  targetSets: 3,
  targetRepRange: '8–12',
  lastWeightKg: 20,
  completedSets: [
    { setNumber: 1, weightKg: 20, reps: 12, rir: 2, isCompleted: true },
  ],
  recentPainLevel: 6,
  recentPainArea: 'Shoulder',
});
assert(painCautionResult.action === 'caution', 'Triggers safety caution action when active joint pain >= 5');
assert(painCautionResult.statusBadge === 'SAFETY CAUTION', 'Displays "SAFETY CAUTION" badge');
assert(painCautionResult.recommendedWeightKg === 17, `Reduces load by 15% to 17kg to safeguard joints (got ${painCautionResult.recommendedWeightKg})`);

// ----------------------------------------------------
// 3. Exercise Substitution & Joint Muscle Mapping
// ----------------------------------------------------
console.log('\n[3/4] Testing Exercise Substitution & Anatomical Mapping...');

// Test 3.1: Body area mapping
assert(getAssociatedBodyArea('Pectoralis Major', 'Chest') === 'Shoulder', 'Pectoralis mapped to Shoulder joint');
assert(getAssociatedBodyArea('Deltoids', 'Shoulders') === 'Shoulder', 'Deltoids mapped to Shoulder joint');
assert(getAssociatedBodyArea('Quadriceps', 'Legs') === 'Knee', 'Quadriceps mapped to Knee joint');
assert(getAssociatedBodyArea('Erector Spinae', 'Back') === 'Lower Back', 'Erector Spinae mapped to Lower Back');

// Test 3.2: Substitution options
const chestPress = allExercises.find((e) => e.name.toLowerCase().includes('chest press machine')) || allExercises[0];
const substitutes = getSubstitutesForExercise(chestPress, allExercises);
assert(substitutes.length > 0, `Found ${substitutes.length} substitutes for ${chestPress.name}`);
const hasValidReason = substitutes.every((s) => ['explicit_match', 'same_muscle', 'same_category'].includes(s.reason));
assert(hasValidReason, 'Substitutes contain valid matching reasons');

// ----------------------------------------------------
// 4. Workout Repository: Active Session, Sets & Persistence
// ----------------------------------------------------
console.log('\n[4/4] Testing Workout Repository CRUD & Volume Synchronization...');

// Test 4.1: Start session
const testPlan = plans.find((p) => p.name === 'Upper A') || plans[0];
const session = WorkoutRepository.startSession({
  planId: testPlan.id,
  title: 'Test Live Upper A',
});

assert(!!session.session.id, `Created session with ID ${session.session.id}`);
assert(session.session.status === 'in_progress', 'Session initial status is "in_progress"');
assert(session.exercises.length > 0, `Session has ${session.exercises.length} exercises pre-populated`);

const firstEx = session.exercises[0];
assert(firstEx.sets.length > 0, `First exercise has ${firstEx.sets.length} sets pre-generated`);

// Test 4.2: Add set
const newSet = WorkoutRepository.addSet(firstEx.workoutExercise.id);
assert(!!newSet.id, `Added set with ID ${newSet.id}`);

// Test 4.3: Update set & Complete
WorkoutRepository.updateSet(firstEx.sets[0].id, {
  weight_kg: 35,
  reps: 12,
  rir: 2,
  is_completed: 1,
});

const refreshed = WorkoutRepository.getPopulatedSession(session.session.id)!;
assert(refreshed.completedSetsCount >= 1, `Refreshed session has ${refreshed.completedSetsCount} completed set(s)`);
assert(refreshed.totalVolumeKg >= 420, `Calculated volume is >= 420 kg (got ${refreshed.totalVolumeKg} kg)`);

// Test 4.4: Substitution in session
if (allExercises.length >= 2) {
  const otherEx = allExercises.find((e) => e.id !== firstEx.exercise.id)!;
  WorkoutRepository.substituteExercise(firstEx.workoutExercise.id, otherEx.id);
  const afterSwap = WorkoutRepository.getPopulatedSession(session.session.id)!;
  const swappedEx = afterSwap.exercises.find((e) => e.workoutExercise.id === firstEx.workoutExercise.id);
  assert(swappedEx?.exercise.id === otherEx.id, `Successfully swapped exercise to ${otherEx.name}`);
}

// Test 4.5: Finish session with progressive overload update & pain tracking
const finishedSession = WorkoutRepository.finishSession(session.session.id, {
  durationSeconds: 2700, // 45 mins
  difficultyPerceived: 'Good',
  notes: 'Felt strong, good pump on chest',
  painEntry: {
    bodyArea: 'Shoulder',
    painLevel: 2,
    notes: 'Mild tightness on right front delt',
  },
});

assert(finishedSession.session.status === 'completed', 'Session status marked as "completed"');
assert(finishedSession.session.duration_seconds === 2700, 'Session duration saved accurately (2700s)');
assert(finishedSession.session.difficulty_perceived === 'Good', 'Perceived difficulty saved as "Good"');

// Test 4.6: Verify pain entry persistence
const recentPainList = WorkoutRepository.getRecentPainEntries(7);
assert(recentPainList.length > 0, `Found ${recentPainList.length} pain entry logged in database`);
assert(recentPainList[0].body_area === 'Shoulder', 'Pain entry recorded for Shoulder');
assert(recentPainList[0].pain_level === 2, 'Pain level recorded as 2');

// Test 4.7: Verify history query
const history = WorkoutRepository.getCompletedHistory(5);
assert(history.some((h) => h.id === session.session.id), 'Finished session appears in completed history list');

console.log('========================================');
console.log(`Phase 3 Verification Complete: ${passCount} Passed, ${failCount} Failed.`);
console.log('========================================');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
