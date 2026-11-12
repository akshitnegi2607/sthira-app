/**
 * Sthira — Personal Trainer Exercises & Routine Switching Verification Test Suite
 */

import { WorkoutRepository } from '../src/database/repositories/workoutRepository';
import { runMigrations } from '../src/database/migrations';
import { getExerciseMedia, getExerciseVideoUrl, EXERCISE_MEDIA_REGISTRY } from '../src/constants/exerciseMedia';
import { INITIAL_WORKOUT_PLANS } from '../src/constants/initialWorkouts';

declare const process: any;

console.log('================================================================');
console.log('  STHIRA — PERSONAL TRAINER (PT HUB) WORKOUT & VIDEO TEST SUITE ');
console.log('================================================================\n');

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
  console.log('Database migrated & initialized successfully.\n');
} catch (e: any) {
  console.error('Database migration error:', e);
}

// TEST 1: Verify Personal Trainer Exercises in Database
console.log('--- Test 1: Personal Trainer Exercises in Database ---');
const trainerExercises = WorkoutRepository.getAllExercises('Personal Trainer');
assert(trainerExercises.length >= 15, `Found ${trainerExercises.length} Personal Trainer exercises in database`);

const expectedExerciseIds = [
  'ex_chest_press_machine',
  'ex_leverage_shoulder_press',
  'ex_wide_grip_lat_pulldown',
  'ex_db_shrugs',
  'ex_alt_hammer_curl',
  'ex_cable_pushdown_bar',
  'ex_toe_touches',
  'ex_plank_core',
  'ex_bicycle_crunches',
  'ex_cardio_15m',
  'ex_underhand_cable_pulldown',
  'ex_db_lateral_raise',
  'ex_pec_deck',
  'ex_rear_delt_machine_flyes',
  'ex_cable_curls',
  'ex_overhead_tricep_extension',
  'ex_incline_treadmill_walking',
];

for (const id of expectedExerciseIds) {
  const ex = WorkoutRepository.getExerciseById(id);
  assert(!!ex, `Exercise ${id} is populated in SQLite`);
  assert(
    ex?.exercise_group === 'Personal Trainer',
    `Exercise ${id} has exercise_group = 'Personal Trainer'`
  );
  assert(
    !!ex?.video_url && ex.video_url.includes('youtube.com'),
    `Exercise ${id} has valid YouTube video URL (${ex?.video_url})`
  );
}

// TEST 2: Verify Month 1 Trainer Workout Plans
console.log('\n--- Test 2: Month 1 Personal Trainer Workout Plans ---');
const allPlans = WorkoutRepository.getAllPlans();
const trainerPlans = allPlans.filter((p) => p.program_group === 'trainer');
assert(trainerPlans.length >= 4, `Found ${trainerPlans.length} Trainer workout plans`);

const trainerUpperA = trainerPlans.find((p) => p.id === 'plan_trainer_upper_a');
assert(!!trainerUpperA, 'Trainer Upper A plan exists');
assert(trainerUpperA?.day_of_week === 1, 'Trainer Upper A scheduled on Monday (day 1)');

const trainerUpperAExercises = WorkoutRepository.getExercisesForPlan('plan_trainer_upper_a');
assert(
  trainerUpperAExercises.length === 10,
  `Trainer Upper A has all 10 prescribed exercises (actual: ${trainerUpperAExercises.length})`
);

const expectedUpperANames = [
  'Chest Press Machine',
  'Leverage Shoulder Press',
  'Wide Grip Lat Pulldown',
  'Dumbbell Shrugs',
  'Standing Alternate Hammer Curl',
  'Cable Pushdown – Bar Attachment',
  'Toe Touches',
  'Plank',
  'Bicycle Crunches',
  'Cardio: 15 Minutes',
];
expectedUpperANames.forEach((name, i) => {
  const actualName = trainerUpperAExercises[i]?.name || '';
  const isMatch =
    actualName.toLowerCase().includes(name.toLowerCase().slice(0, 6)) ||
    (name.toLowerCase().includes('cardio') && actualName.toLowerCase().includes('cardio'));
  assert(
    isMatch,
    `Upper A exercise ${i + 1} matches "${name}" (got: ${actualName})`
  );
});

const trainerUpperB = trainerPlans.find((p) => p.id === 'plan_trainer_upper_b');
assert(!!trainerUpperB, 'Trainer Upper B plan exists');
assert(trainerUpperB?.day_of_week === 4, 'Trainer Upper B scheduled on Thursday (day 4)');

const trainerUpperBExercises = WorkoutRepository.getExercisesForPlan('plan_trainer_upper_b');
assert(
  trainerUpperBExercises.length === 8,
  `Trainer Upper B has all 8 prescribed exercises (actual: ${trainerUpperBExercises.length})`
);

const expectedUpperBNames = [
  'Chest Press Machine',
  'Underhand Cable Pulldown',
  'Standing Dumbbell Lateral Raises',
  'Pec Deck',
  'Rear Delt Machine Flyes',
  'Cable Curls',
  'Overhead Tricep Extension',
  'Incline Treadmill Walking',
];
expectedUpperBNames.forEach((name, i) => {
  const actualName = trainerUpperBExercises[i]?.name || '';
  const isMatch =
    actualName.toLowerCase().includes(name.toLowerCase().slice(0, 6)) ||
    (name.toLowerCase().includes('lateral') && actualName.toLowerCase().includes('lateral'));
  assert(
    isMatch,
    `Upper B exercise ${i + 1} matches "${name}" (got: ${actualName})`
  );
});

// TEST 3: Exercise Media & YouTube Tutorial Resolution
console.log('\n--- Test 3: Exercise Media & Video Tutorial Links ---');
for (const id of expectedExerciseIds) {
  const media = getExerciseMedia(id);
  assert(!!media, `Exercise media exists for ${id}`);
  assert(!!media.gifUrl && media.gifUrl.startsWith('http'), `Media has valid animated GIF for ${id}`);
  assert(!!media.step0Url && media.step0Url.startsWith('http'), `Media has step 0 starting photo for ${id}`);
  assert(!!media.step1Url && media.step1Url.startsWith('http'), `Media has step 1 finish photo for ${id}`);
  assert(media.formCues.length >= 3, `Media has at least 3 sports-science form cues for ${id}`);

  const videoUrl = getExerciseVideoUrl(id, media.exerciseName);
  assert(
    videoUrl.includes('youtube.com') && videoUrl.includes('My'),
    `Video URL generates official My PT Hub YouTube link for ${id}`
  );
}

// TEST 4: Routine Program Switching (Trainer <-> Sthira)
console.log('\n--- Test 4: Program Group Switching (Trainer vs Sthira Core) ---');
WorkoutRepository.setActiveProgramGroup('trainer');
assert(WorkoutRepository.getActiveProgramGroup() === 'trainer', 'Active program group set to trainer');

const trainerFilteredPlans = WorkoutRepository.getAllPlans('trainer');
assert(
  trainerFilteredPlans.some((p) => p.id === 'plan_trainer_upper_a'),
  'Trainer filtered plans contains Trainer Upper A'
);
assert(
  trainerFilteredPlans.some((p) => p.name.includes('Yoga')),
  'Trainer filtered plans includes shared recovery day (Yoga)'
);

WorkoutRepository.setActiveProgramGroup('sthira');
assert(WorkoutRepository.getActiveProgramGroup() === 'sthira', 'Active program group switched to sthira');

const sthiraFilteredPlans = WorkoutRepository.getAllPlans('sthira');
assert(
  sthiraFilteredPlans.some((p) => p.id === 'plan_mon_upper_a'),
  'Sthira filtered plans contains Sthira Upper Body A (plan_mon_upper_a)'
);
assert(
  !sthiraFilteredPlans.some((p) => p.id === 'plan_trainer_upper_a'),
  'Sthira filtered plans excludes Trainer Upper A'
);

// Reset back to trainer as preferred by user
WorkoutRepository.setActiveProgramGroup('trainer');
assert(WorkoutRepository.getActiveProgramGroup() === 'trainer', 'Active program restored to trainer');

console.log('\n================================================================');
console.log(`  TRAINER WORKOUT PLAN TEST SUMMARY: ${passed} / ${total} PASSING`);
console.log('================================================================\n');

if (passed === total) {
  console.log('🎉 ALL PERSONAL TRAINER WORKOUT & VIDEO TESTS PASSED CLEANLY!\n');
} else {
  console.error(`⚠️ ${total - passed} TESTS FAILED.`);
  process.exitCode = 1;
}
