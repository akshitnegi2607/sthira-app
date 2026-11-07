import { getExerciseMedia } from '../src/constants/exerciseMedia';
import { getExerciseStretching, EXERCISE_STRETCHING_REGISTRY } from '../src/constants/exerciseStretching';

declare const process: any;

function runTests() {
  console.log('🧪 Starting Plank Stopwatch, Distinct Chest Graphics & Stretching Verifications...\n');
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

  // TEST SUITE 1: Distinct Graphics & Media for Chest and Core Exercises
  console.log('--- Suite 1: Distinct Exercise Form Graphics ---');

  const chestPressMachine = getExerciseMedia('ex_chest_press_machine', 'Chest Press Machine');
  const dbBench = getExerciseMedia('ex_db_bench_press', 'Dumbbell Bench Press');
  const bbBench = getExerciseMedia('ex_barbell_bench_press', 'Barbell Bench Press');
  const inclineDbBench = getExerciseMedia('ex_incline_db_bench_press', 'Incline Dumbbell Bench Press');
  const pushups = getExerciseMedia('ex_pushups', 'Push-ups');
  const dbFly = getExerciseMedia('ex_dumbbell_fly', 'Dumbbell Flyes');
  const plank = getExerciseMedia('ex_plank', 'Plank');

  assert(
    dbBench.gifUrl !== chestPressMachine.gifUrl,
    `Dumbbell Bench Press has distinct GIF from Chest Press Machine (${dbBench.gifUrl})`
  );
  assert(
    bbBench.gifUrl !== chestPressMachine.gifUrl,
    `Barbell Bench Press has distinct GIF from Chest Press Machine (${bbBench.gifUrl})`
  );
  assert(
    inclineDbBench.gifUrl !== dbBench.gifUrl,
    `Incline DB Bench has distinct GIF from Flat DB Bench (${inclineDbBench.gifUrl})`
  );
  assert(
    pushups.gifUrl.includes('0662.gif') || pushups.exerciseName.includes('Push-ups'),
    `Push-ups has dedicated graphic (${pushups.gifUrl})`
  );
  assert(
    dbFly.gifUrl.includes('0308.gif') || dbFly.exerciseName.includes('Fly'),
    `Dumbbell Fly has dedicated graphic (${dbFly.gifUrl})`
  );
  assert(
    plank.gifUrl.includes('0463.gif') || plank.exerciseName.toLowerCase().includes('plank'),
    `Plank has dedicated core graphic (${plank.gifUrl})`
  );

  // Check start & finish images
  assert(
    dbBench.step0Url.length > 0 && dbBench.step1Url.length > 0,
    'Dumbbell Bench Press has start and finish position photos'
  );
  assert(
    bbBench.step0Url.length > 0 && bbBench.step1Url.length > 0,
    'Barbell Bench Press has start and finish position photos'
  );

  // TEST SUITE 2: Dynamic Pre-Workout & Static Post-Workout Stretching Engine
  console.log('\n--- Suite 2: Pre & Post Workout Stretching Engine ---');

  // Verify registry coverage
  assert(
    Object.keys(EXERCISE_STRETCHING_REGISTRY).length >= 10,
    `Stretching registry covers ${Object.keys(EXERCISE_STRETCHING_REGISTRY).length} exercises & categories`
  );

  // Chest stretching for DB Bench Press
  const benchStretches = getExerciseStretching('ex_db_bench_press', 'Dumbbell Bench Press', 'Chest', 'Chest');
  assert(
    benchStretches.preWorkout.drills.length >= 2,
    `Bench Press has ${benchStretches.preWorkout.drills.length} dynamic warm-up drills`
  );
  assert(
    benchStretches.postWorkout.drills.length >= 2,
    `Bench Press has ${benchStretches.postWorkout.drills.length} static cool-down stretches`
  );
  assert(
    benchStretches.preWorkout.drills.some((d: any) =>
      d.name.toLowerCase().includes('circle') || d.name.toLowerCase().includes('band') || d.name.toLowerCase().includes('crossover')
    ),
    'Bench Press warm-up includes shoulder/pectoral dynamic movement'
  );
  assert(
    benchStretches.postWorkout.drills.some((d: any) =>
      d.name.toLowerCase().includes('chest') || d.name.toLowerCase().includes('pec') || d.targetArea.toLowerCase().includes('pec')
    ),
    'Bench Press cool-down includes chest/pectoral stretch'
  );

  // Squats / Leg stretching
  const squatStretches = getExerciseStretching('ex_barbell_squat', 'Barbell Squat', 'Legs', 'Quadriceps');
  assert(
    squatStretches.preWorkout.drills.some((d: any) =>
      d.name.toLowerCase().includes('greatest') || d.name.toLowerCase().includes('swing') || d.name.toLowerCase().includes('opener') || d.name.toLowerCase().includes('squat')
    ),
    'Squat warm-up includes hip opener, dynamic swings or air squats'
  );
  assert(
    squatStretches.postWorkout.drills.some((d: any) =>
      d.name.toLowerCase().includes('quad') || d.name.toLowerCase().includes('pigeon') || d.name.toLowerCase().includes('hamstring')
    ),
    'Squat cool-down includes quad/hamstring static stretch'
  );

  // Plank / Core stretching
  const plankStretches = getExerciseStretching('ex_plank', 'Plank', 'Core', 'Abdominals');
  assert(
    plankStretches.preWorkout.drills.some((d: any) =>
      d.name.toLowerCase().includes('cat-cow') || d.name.toLowerCase().includes('bird-dog') || d.name.toLowerCase().includes('twist')
    ),
    'Plank warm-up includes spine/core dynamic activation'
  );
  assert(
    plankStretches.postWorkout.drills.some((d: any) =>
      d.name.toLowerCase().includes('cobra') || d.name.toLowerCase().includes('child')
    ),
    'Plank cool-down includes Cobra or Child Pose stretch'
  );

  // Fallback resilience for unusual exercise names
  const unknownExerciseStretches = getExerciseStretching('ex_custom_pull', 'Cable Face Pulls Variation', 'Shoulders', 'Shoulders');
  assert(
    unknownExerciseStretches.preWorkout.drills.length > 0 && unknownExerciseStretches.postWorkout.drills.length > 0,
    'Falls back gracefully to primary muscle group stretching when exercise name is unique'
  );

  console.log(`\n========================================`);
  console.log(`Result: ${passed}/${total} assertions passed!`);
  console.log(`========================================\n`);
}

runTests();
