/**
 * Sthira — Biweekly Mesocycle Adaptation & Thinking Verification Test
 */

import { analyzeBiweeklyMesocycle } from '../src/services/mesocycleAdaptation';
import { WorkoutRepository, PopulatedSession } from '../src/database/repositories/workoutRepository';
import { runMigrations } from '../src/database/migrations';
import { Exercise, PainEntry, WorkoutPlan } from '../src/types/database';

declare const process: any;

console.log('====================================================');
console.log('  STHIRA — BIWEEKLY MESOCYCLE ADAPTATION TEST SUITE ');
console.log('====================================================\n');

let passed = 0;
let total = 0;

function assert(condition: boolean, message: string) {
  total++;
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// 1. Initialize Database & Seed
try {
  runMigrations();
  console.log('Database initialized.\n');
} catch (e: any) {
  console.error('Database migration error:', e);
}

const allExercises = WorkoutRepository.getAllExercises();
const plans = WorkoutRepository.getAllPlans();

// TEST 1: Initial state & Review Due calculation
console.log('--- Test 1: Biweekly Cadence & Timing Evaluation ---');
const review = analyzeBiweeklyMesocycle([], [], allExercises, plans, false);
assert(typeof review.isDue === 'boolean', 'Review calculates isDue boolean');
assert(review.totalExercisesReviewed >= 10, `Reviewed ${review.totalExercisesReviewed} exercises across weekly splits`);
assert(review.coachThinkingOverview.length > 50, 'Generates comprehensive coach thinking overview');

// TEST 2: Plateau Detection
console.log('\n--- Test 2: Plateau Detection & AI Coach Thinking ---');
// Simulate 2 sessions where Chest Press Machine is stalled at 30kg x 8 reps
const stalledSessions: PopulatedSession[] = [
  {
    session: {
      id: 'sess_stalled_2',
      date: '2026-11-05',
      title: 'Upper A',
      duration_seconds: 2400,
      status: 'completed',
      created_at: '2026-11-05T10:00:00Z',
    },
    exercises: [
      {
        workoutExercise: {
          id: 'we_1',
          session_id: 'sess_stalled_2',
          exercise_id: 'ex_chest_press_machine',
          order_index: 0,
          created_at: '2026-11-05T10:00:00Z',
        },
        exercise: allExercises.find((e) => e.id === 'ex_chest_press_machine')!,
        sets: [
          {
            id: 's_1',
            workout_exercise_id: 'we_1',
            set_number: 1,
            weight_kg: 30,
            reps: 8,
            rir: 0,
            is_completed: 1,
            created_at: '2026-11-05T10:00:00Z',
          },
          {
            id: 's_2',
            workout_exercise_id: 'we_1',
            set_number: 2,
            weight_kg: 30,
            reps: 8,
            rir: 0,
            is_completed: 1,
            created_at: '2026-11-05T10:00:00Z',
          },
        ],
      },
    ],
    totalVolumeKg: 480,
    completedSetsCount: 2,
  },
  {
    session: {
      id: 'sess_stalled_1',
      date: '2026-10-29',
      title: 'Upper A',
      duration_seconds: 2400,
      status: 'completed',
      created_at: '2026-10-29T10:00:00Z',
    },
    exercises: [
      {
        workoutExercise: {
          id: 'we_2',
          session_id: 'sess_stalled_1',
          exercise_id: 'ex_chest_press_machine',
          order_index: 0,
          created_at: '2026-10-29T10:00:00Z',
        },
        exercise: allExercises.find((e) => e.id === 'ex_chest_press_machine')!,
        sets: [
          {
            id: 's_3',
            workout_exercise_id: 'we_2',
            set_number: 1,
            weight_kg: 30,
            reps: 8,
            rir: 0,
            is_completed: 1,
            created_at: '2026-10-29T10:00:00Z',
          },
          {
            id: 's_4',
            workout_exercise_id: 'we_2',
            set_number: 2,
            weight_kg: 30,
            reps: 8,
            rir: 0,
            is_completed: 1,
            created_at: '2026-10-29T10:00:00Z',
          },
        ],
      },
    ],
    totalVolumeKg: 480,
    completedSetsCount: 2,
  },
];

const plateauReview = analyzeBiweeklyMesocycle(stalledSessions, [], allExercises, plans, true);
const chestAdaptation = plateauReview.adaptations.find((a) => a.currentExerciseId === 'ex_chest_press_machine');

assert(chestAdaptation !== undefined, 'Found chest press adaptation');
assert(chestAdaptation?.status === 'PLATEAU', 'Correctly flagged as PLATEAU');
assert(chestAdaptation?.actionRecommendation === 'SWAP', 'Recommends SWAP for stalled movement');
assert(
  chestAdaptation?.suggestedExerciseName?.includes('Dumbbell') === true,
  `Suggests Dumbbell Flat Bench Press (${chestAdaptation?.suggestedExerciseName})`
);
assert(
  chestAdaptation?.coachThinking.includes('stagnated') === true ||
    chestAdaptation?.coachThinking.includes('plateau') === true,
  'Coach Thinking explains the stagnation and neuromuscular rationale'
);
assert(
  (chestAdaptation?.suggestedStartingWeightKg || 0) > 0,
  `Calculated starting dumbbell load (${chestAdaptation?.suggestedStartingWeightKg} kg)`
);

// TEST 3: Joint Pain Caution
console.log('\n--- Test 3: Joint Pain Caution & Deload Substitution ---');
const painEntries: PainEntry[] = [
  {
    id: 'pain_1',
    date: '2026-11-06',
    body_area: 'Shoulder',
    pain_level: 4,
    notes: 'Mild pinch at front deltoid during heavy pressing',
    created_at: '2026-11-06T12:00:00Z',
  },
];

const painReview = analyzeBiweeklyMesocycle([], painEntries, allExercises, plans, true);
const shoulderExerciseAdaptation = painReview.adaptations.find(
  (a) => a.category.toLowerCase().includes('shoulder') || a.primaryMuscle.toLowerCase().includes('deltoid')
);

assert(shoulderExerciseAdaptation !== undefined, 'Identified shoulder exercise in split');
assert(shoulderExerciseAdaptation?.status === 'JOINT_CAUTION', 'Marked as JOINT_CAUTION due to active shoulder pain');
assert(
  shoulderExerciseAdaptation?.coachThinking.includes('Shoulder') === true ||
    shoulderExerciseAdaptation?.coachThinking.includes('discomfort') === true,
  'Coach Thinking explains joint deload rationale'
);

// TEST 4: Routine Evolution Persistence & Plan Updates
console.log('\n--- Test 4: Repository Plan Updates & Evolution Application ---');
const upperAPlan = plans.find((p) => p.name.includes('Upper A'))!;
const originalUpperAIds = WorkoutRepository.getPlanExerciseIds(upperAPlan.id);
assert(originalUpperAIds.includes('ex_chest_press_machine'), 'Upper A originally contains Chest Press Machine');

// Apply evolution: swap Chest Press Machine -> Dumbbell Flat Bench Press
WorkoutRepository.applyBiweeklyExerciseEvolution([
  {
    planId: upperAPlan.id,
    oldExerciseId: 'ex_chest_press_machine',
    newExerciseId: 'ex_db_bench_press',
  },
]);

const updatedUpperAIds = WorkoutRepository.getPlanExerciseIds(upperAPlan.id);
assert(!updatedUpperAIds.includes('ex_chest_press_machine'), 'Chest Press Machine removed from active plan');
assert(updatedUpperAIds.includes('ex_db_bench_press'), 'Dumbbell Flat Bench Press added to active plan');

// Verify getExercisesForPlan returns the updated exercise
const updatedExercises = WorkoutRepository.getExercisesForPlan(upperAPlan.id);
assert(
  updatedExercises.some((e) => e.id === 'ex_db_bench_press'),
  'getExercisesForPlan returns Dumbbell Flat Bench Press dynamically'
);

// Verify last review date was recorded
const lastDate = WorkoutRepository.getLastMesocycleReviewDate();
assert(lastDate !== null && lastDate.length > 0, `Recorded review date in AppSettings: ${lastDate}`);

// Clean up: reset plan to original
WorkoutRepository.updatePlanExercises(upperAPlan.id, originalUpperAIds);
const restoredIds = WorkoutRepository.getPlanExerciseIds(upperAPlan.id);
assert(restoredIds.includes('ex_chest_press_machine'), 'Restored original Upper A plan cleanly');

console.log(`\n====================================================`);
console.log(`Result: ${passed}/${total} assertions passed!`);
console.log(`====================================================\n`);
