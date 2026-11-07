/**
 * Sthira — Biweekly Mesocycle Adaptation & Thinking Engine
 * Analyzes multi-week progression patterns, rep velocity, plateau indicators,
 * and joint pain entries to recommend sports-science routine evolutions.
 * Prompts the user biweekly to either accept intelligent adjustments or continue.
 */

import {
  WorkoutRepository,
  PopulatedSession,
} from '../database/repositories/workoutRepository';
import { Exercise, PainEntry, WorkoutPlan } from '../types/database';
import { getAssociatedBodyArea } from './exerciseSubstitution';

export interface ExerciseBiweeklyAdaptation {
  planId: string;
  planName: string;
  currentExerciseId: string;
  currentExerciseName: string;
  category: string;
  primaryMuscle: string;
  status: 'PLATEAU' | 'JOINT_CAUTION' | 'STIMULUS_VARIATION' | 'PROGRESSING_WELL';
  statusBadge: string;
  actionRecommendation: 'SWAP' | 'KEEP';
  suggestedExerciseId: string | null;
  suggestedExerciseName: string | null;
  suggestedStartingWeightKg: number | null;
  suggestedRepRange: string;
  targetMuscleBenefit: string;
  coachThinking: string;
  patternSummary: string;
  isPreSelected: boolean;
}

export interface BiweeklyMesocycleReview {
  reviewDate: string;
  daysSinceLastReview: number;
  isDue: boolean;
  totalSessionsAnalyzed: number;
  totalExercisesReviewed: number;
  progressingWellCount: number;
  plateauCount: number;
  jointCautionCount: number;
  stimulusVariationCount: number;
  adaptations: ExerciseBiweeklyAdaptation[];
  coachExecutiveSummary: string;
  coachThinkingOverview: string;
}

/**
 * Curated mesocycle rotation pairs with physiological rationale & starting weight multipliers.
 */
interface RotationTarget {
  suggestedId: string;
  targetMuscleBenefit: string;
  coachThinking: string;
  weightMultiplier: number;
  targetRepRange: string;
}

const ROTATION_CATALOG: Record<string, RotationTarget> = {
  ex_chest_press_machine: {
    suggestedId: 'ex_db_bench_press',
    targetMuscleBenefit: 'Convergent pressing arc, rotator cuff stabilization & deeper pec stretch',
    coachThinking:
      'After 2 weeks on the fixed guided machine path, rotating to Dumbbell Flat Bench Press allows your arms to converge naturally at the top. This recruits stabilizing serratus and rotator cuff muscles while unlocking a deeper stretch at the bottom of the rep.',
    weightMultiplier: 0.5, // 30kg machine -> 14-16kg DBs
    targetRepRange: '8–12',
  },
  ex_db_bench_press: {
    suggestedId: 'ex_barbell_bench_press',
    targetMuscleBenefit: 'Higher absolute mechanical tension loading for pectoral and triceps strength',
    coachThinking:
      'Having mastered dumbbell stabilization, transitioning to Barbell Flat Bench Press enables higher progressive loading for peak mechanical tension, accelerating chest and triceps hypertrophy.',
    weightMultiplier: 2.2, // 16kg DBs -> ~35-40kg Barbell
    targetRepRange: '8–10',
  },
  ex_incline_chest_press: {
    suggestedId: 'ex_db_bench_press',
    targetMuscleBenefit: 'Mid-sternal pectoral fiber hypertrophy and compound pressing volume',
    coachThinking:
      'Following focused clavicular head work, rotating to flat dumbbell pressing balances sternal pectoral development and relieves front deltoid tension.',
    weightMultiplier: 0.9,
    targetRepRange: '8–12',
  },
  ex_lat_pulldown: {
    suggestedId: 'ex_seated_cable_row',
    targetMuscleBenefit: 'Rhomboid retraction, lower trap strength & mid-back thickness',
    coachThinking:
      'Rotating from vertical pulling (Lat Pulldown) to horizontal rowing (Seated Cable Row) shifts hypertrophy focus toward the rhomboids and mid-traps, improving posture and creating a balanced, dense back.',
    weightMultiplier: 0.9,
    targetRepRange: '8–12',
  },
  ex_seated_cable_row: {
    suggestedId: 'ex_one_arm_db_row',
    targetMuscleBenefit: 'Unilateral lat activation, greater stretch & core anti-rotational control',
    coachThinking:
      'Single-arm dumbbell rows allow greater elbow excursion past the torso for maximum lat contraction while equalizing strength between your left and right sides.',
    weightMultiplier: 0.5,
    targetRepRange: '8–12',
  },
  ex_db_shoulder_press: {
    suggestedId: 'ex_machine_shoulder_press',
    targetMuscleBenefit: 'Isolated anterior deltoid fatigue with zero lower back shear',
    coachThinking:
      'Switching to machine shoulder press removes the stabilizer bottleneck, letting you take anterior deltoids safely to true muscular failure without lower back arching.',
    weightMultiplier: 1.8,
    targetRepRange: '8–12',
  },
  ex_db_lateral_raise: {
    suggestedId: 'ex_cable_lateral_raise',
    targetMuscleBenefit: 'Constant resistance profile, particularly at the bottom of the movement',
    coachThinking:
      'Dumbbells produce near-zero tension at the bottom of a lateral raise. Cables provide an unbroken tension curve from start to finish, triggering enhanced lateral deltoid growth.',
    weightMultiplier: 0.85,
    targetRepRange: '12–15',
  },
  ex_cable_lateral_raise: {
    suggestedId: 'ex_db_lateral_raise',
    targetMuscleBenefit: 'Peak contraction emphasis in the fully shortened abduction position',
    coachThinking:
      'Rotating back to dumbbells maximizes peak muscular squeeze at 90° abduction, challenging shoulder cap definition.',
    weightMultiplier: 1.1,
    targetRepRange: '12–15',
  },
  ex_triceps_pushdown: {
    suggestedId: 'ex_triceps_pushdown',
    targetMuscleBenefit: 'Triceps long-head stretch and elbow tendon resilience',
    coachThinking:
      'Consolidate elbow hinge stability. When adapting triceps volume, shift hand position (rope vs straight bar) to target lateral vs long heads.',
    weightMultiplier: 1.0,
    targetRepRange: '10–15',
  },
  ex_db_biceps_curl: {
    suggestedId: 'ex_incline_db_curl',
    targetMuscleBenefit: 'Extreme long-head stretch at the shoulder-hyperextended position',
    coachThinking:
      'Incline dumbbell curls place the shoulder in hyperextension, stretching the long head of the biceps under load for superior muscle hypertrophy and peak development.',
    weightMultiplier: 0.85,
    targetRepRange: '10–12',
  },
  ex_hammer_curl: {
    suggestedId: 'ex_incline_db_curl',
    targetMuscleBenefit: 'Biceps peak elongation and fuller arm thickness',
    coachThinking:
      'Alternating between forearm-focused hammer curls and incline curls ensures comprehensive development of both the brachialis and biceps brachii.',
    weightMultiplier: 0.9,
    targetRepRange: '10–12',
  },
  ex_leg_press: {
    suggestedId: 'ex_leg_press',
    targetMuscleBenefit: 'Continuous progressive quad overload with knee safety',
    coachThinking:
      'Leg press provides optimal knee-dominant mechanical tension without spinal axial compression. Continue milking progressive overload with varying foot placements.',
    weightMultiplier: 1.0,
    targetRepRange: '8–12',
  },
  ex_romanian_deadlift: {
    suggestedId: 'ex_hip_thrust',
    targetMuscleBenefit: 'Peak glute contraction without lumbar spine axial shear',
    coachThinking:
      'Rotating from eccentric hamstring hip-hinging (RDL) to horizontal glute bridging (Hip Thrust) provides maximum peak glute tension while giving the lower back erectors a restorative deload.',
    weightMultiplier: 1.2,
    targetRepRange: '8–12',
  },
  ex_hip_thrust: {
    suggestedId: 'ex_romanian_deadlift',
    targetMuscleBenefit: 'Eccentric hamstring elongation and posterior chain strength',
    coachThinking:
      'Transitioning to Romanian Deadlifts challenges the hamstrings and glutes in the lengthened state, building powerful hip-hinge mechanics.',
    weightMultiplier: 0.85,
    targetRepRange: '8–12',
  },
  ex_leg_curl: {
    suggestedId: 'ex_lying_leg_curl',
    targetMuscleBenefit: 'Peak contraction at the knee flexion limit with prone hip angle',
    coachThinking:
      'Lying leg curl alters the angle of hip flexion relative to seated machines, recruiting distal hamstring fibers under a different length-tension curve.',
    weightMultiplier: 1.0,
    targetRepRange: '10–12',
  },
  ex_seated_calf_raise: {
    suggestedId: 'ex_single_leg_calf_raise',
    targetMuscleBenefit: 'Unilateral ankle stabilization & standing gastrocnemius peak contraction',
    coachThinking:
      'Seated calf raises emphasize the deeper soleus. Rotating to standing single-leg calf raises recruits the dominant gastrocnemius head and remedies left/right ankle imbalances.',
    weightMultiplier: 0.2,
    targetRepRange: '12–15',
  },
  ex_calf_raise: {
    suggestedId: 'ex_seated_calf_raise',
    targetMuscleBenefit: 'Soleus muscle hypertrophy through bent-knee calf isolation',
    coachThinking:
      'Bending the knees to 90° slackens the gastrocnemius and isolates the soleus muscle, providing comprehensive lower leg development.',
    weightMultiplier: 0.6,
    targetRepRange: '12–15',
  },
};

/**
 * Analyzes biweekly routine data and yields structured AI Coach recommendations with thinking rationale.
 */
export function analyzeBiweeklyMesocycle(
  completedSessions: PopulatedSession[],
  recentPain: PainEntry[],
  allExercises: Exercise[],
  plans: WorkoutPlan[],
  forceReview = false
): BiweeklyMesocycleReview {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // 1. Determine days since last review
  const lastReviewDateStr = WorkoutRepository.getLastMesocycleReviewDate();
  let daysSinceLastReview = 14;

  if (lastReviewDateStr) {
    const lastReviewMs = new Date(lastReviewDateStr).getTime();
    if (!isNaN(lastReviewMs)) {
      daysSinceLastReview = Math.max(
        0,
        Math.floor((now.getTime() - lastReviewMs) / (1000 * 3600 * 24))
      );
    }
  } else if (completedSessions.length > 0) {
    const oldestSession = completedSessions[completedSessions.length - 1];
    const oldestMs = new Date(oldestSession.session.date).getTime();
    if (!isNaN(oldestMs)) {
      daysSinceLastReview = Math.max(
        0,
        Math.floor((now.getTime() - oldestMs) / (1000 * 3600 * 24))
      );
    }
  }

  // Biweekly trigger is true if 14 days have elapsed, forceReview is requested, or at least 4 sessions completed
  const isDue = forceReview || daysSinceLastReview >= 14 || completedSessions.length >= 4;

  // 2. Filter sessions from biweekly window (past 14 to 28 days)
  const windowSessions = completedSessions.slice(0, 14);

  // Group performance records by exerciseId across the window
  const exercisePerformanceMap = new Map<
    string,
    { date: string; maxWeight: number; totalReps: number; avgReps: number; rir: number | null }[]
  >();

  for (const sess of windowSessions) {
    for (const we of sess.exercises) {
      const exId = we.exercise.id;
      const validSets = we.sets.filter((s) => s.is_completed === 1 || Number(s.reps) > 0);
      if (validSets.length === 0) continue;

      const maxWeight = Math.max(...validSets.map((s) => Number(s.weight_kg) || 0));
      const totalReps = validSets.reduce((sum, s) => sum + (Number(s.reps) || 0), 0);
      const avgReps = validSets.length > 0 ? totalReps / validSets.length : 0;
      const rir = validSets[0]?.rir ?? null;

      if (!exercisePerformanceMap.has(exId)) {
        exercisePerformanceMap.set(exId, []);
      }
      exercisePerformanceMap.get(exId)!.push({
        date: sess.session.date,
        maxWeight,
        totalReps,
        avgReps,
        rir,
      });
    }
  }

  // 3. Evaluate each routine exercise across weekly plans
  const adaptations: ExerciseBiweeklyAdaptation[] = [];
  const exerciseLibraryMap = new Map<string, Exercise>(allExercises.map((e) => [e.id, e]));

  // Focus on the core lifting plans: Upper A, Lower A, Upper B, Lower B
  const liftingPlans = plans.filter((p) => {
    const name = p.name.toLowerCase();
    return name.includes('upper') || name.includes('lower');
  });

  const processedExerciseKeys = new Set<string>();

  for (const plan of liftingPlans) {
    const planExercises = WorkoutRepository.getExercisesForPlan(plan.id);

    for (const ex of planExercises) {
      const uniqueKey = `${plan.id}_${ex.id}`;
      if (processedExerciseKeys.has(uniqueKey)) continue;
      processedExerciseKeys.add(uniqueKey);

      const history = exercisePerformanceMap.get(ex.id) || [];
      const bodyArea = getAssociatedBodyArea(ex.primary_muscle, ex.category);
      const relevantPain = recentPain.find(
        (p) => p.body_area.toLowerCase() === bodyArea.toLowerCase() && p.pain_level >= 3
      );

      let status: 'PLATEAU' | 'JOINT_CAUTION' | 'STIMULUS_VARIATION' | 'PROGRESSING_WELL' =
        'PROGRESSING_WELL';
      let statusBadge = 'ON TRACK';
      let actionRecommendation: 'SWAP' | 'KEEP' = 'KEEP';
      let suggestedExerciseId: string | null = null;
      let suggestedExerciseName: string | null = null;
      let suggestedStartingWeightKg: number | null = ex.current_recommended_weight_kg || ex.starting_weight_kg || 20;
      let suggestedRepRange = ex.target_rep_range || '8–12';
      let targetMuscleBenefit = 'Continuous double-progression hypertrophy';
      let coachThinking = '';
      let patternSummary = 'Awaiting initial workout baseline';
      let isPreSelected = false;

      // Condition 1: Joint Fatigue / Pain Caution
      if (relevantPain) {
        status = 'JOINT_CAUTION';
        statusBadge = `JOINT CAUTION (${relevantPain.body_area} ${relevantPain.pain_level}/10)`;
        actionRecommendation = 'SWAP';
        isPreSelected = true;

        const rotation = ROTATION_CATALOG[ex.id];
        if (rotation && rotation.suggestedId !== ex.id) {
          suggestedExerciseId = rotation.suggestedId;
          const targetEx = exerciseLibraryMap.get(rotation.suggestedId);
          suggestedExerciseName = targetEx ? targetEx.name : 'Joint-Friendly Alternative';
          targetMuscleBenefit = `Alleviates ${relevantPain.body_area} joint shear while preserving ${ex.primary_muscle} tension`;
          suggestedStartingWeightKg = Math.round(((ex.last_weight_kg || 20) * rotation.weightMultiplier) * 2) / 2;
          suggestedRepRange = rotation.targetRepRange;
          coachThinking = `Active joint discomfort (${relevantPain.body_area} rated ${relevantPain.pain_level}/10) was logged. Continuing fixed axial loading risks overuse inflammation. Swapping to ${suggestedExerciseName} safely deloads the ${relevantPain.body_area} joint while keeping weekly hypertrophy stimulus high.`;
        } else {
          suggestedExerciseName = 'Machine / Cable Alternative';
          coachThinking = `Active sensitivity noted in ${relevantPain.body_area}. Reducing free-weight shear with guided machines or cables protects articular cartilage.`;
        }
        patternSummary = `Joint pain ${relevantPain.pain_level}/10 logged for ${relevantPain.body_area}`;
      }
      // Condition 2: Performance Progression or Plateau
      else if (history.length >= 2) {
        const sortedHistory = [...history].sort((a, b) => b.date.localeCompare(a.date));
        const latest = sortedHistory[0];
        const previous = sortedHistory[1];

        const weightDiff = latest.maxWeight - previous.maxWeight;
        const repsDiff = latest.avgReps - previous.avgReps;
        patternSummary = `Recent: ${latest.maxWeight}kg (avg ${Math.round(latest.avgReps)} reps) vs Previous: ${previous.maxWeight}kg (avg ${Math.round(previous.avgReps)} reps)`;

        // Detected Plateau: weight didn't increase and reps didn't increase
        const isStalled = weightDiff <= 0 && repsDiff <= 0;

        if (isStalled) {
          status = 'PLATEAU';
          statusBadge = 'PLATEAU DETECTED';
          actionRecommendation = 'SWAP';
          isPreSelected = true;

          const rotation = ROTATION_CATALOG[ex.id];
          if (rotation && rotation.suggestedId !== ex.id) {
            suggestedExerciseId = rotation.suggestedId;
            const targetEx = exerciseLibraryMap.get(rotation.suggestedId);
            suggestedExerciseName = targetEx ? targetEx.name : 'Target Variation';
            targetMuscleBenefit = rotation.targetMuscleBenefit;
            suggestedStartingWeightKg = Math.round(((latest.maxWeight || 20) * rotation.weightMultiplier) * 2) / 2;
            suggestedRepRange = rotation.targetRepRange;
            coachThinking = `Data analysis shows weight and reps have stagnated across consecutive sessions (${latest.maxWeight}kg × ${Math.round(latest.avgReps)} reps). Neuromuscular adaptation has plateaued on this specific path. Rotating to ${suggestedExerciseName} recruits fresh motor units, alters the strength curve, and restarts progression.`;
          } else {
            coachThinking = `Weight and reps stalled across consecutive exposures. Consider altering grip width or tempo to stimulate new hypertrophy.`;
          }
        } else {
          // Progressing Well
          status = 'PROGRESSING_WELL';
          statusBadge = 'ON TRACK (+ PROGRESSING)';
          actionRecommendation = 'KEEP';
          isPreSelected = false;
          coachThinking = `Optimal double-progression detected (+${Math.max(0, weightDiff)}kg / +${Math.round(repsDiff)} reps). Mechanical tension is steadily increasing with clean form. Recommendation: Keep this exercise for the next 2-week mesocycle to maximize muscle adaptations before rotating.`;
        }
      }
      // Condition 3: Mesocycle Stimulus Variation Candidate (Performed consistently or Upper/Lower redundancy)
      else {
        // Upper B redundancy check (e.g. Upper B doing Lat Pulldown or Lateral Raise identical to Upper A)
        const isUpperB = plan.id.includes('upper_b');
        const isLowerB = plan.id.includes('lower_b');

        if (isUpperB && (ex.id === 'ex_lat_pulldown' || ex.id === 'ex_db_lateral_raise' || ex.id === 'ex_triceps_pushdown')) {
          status = 'STIMULUS_VARIATION';
          statusBadge = 'VARIATION OPPORTUNITY';
          actionRecommendation = 'SWAP';
          isPreSelected = true;

          const rotation = ROTATION_CATALOG[ex.id];
          if (rotation && rotation.suggestedId !== ex.id) {
            suggestedExerciseId = rotation.suggestedId;
            const targetEx = exerciseLibraryMap.get(rotation.suggestedId);
            suggestedExerciseName = targetEx ? targetEx.name : 'Mesocycle Alternative';
            targetMuscleBenefit = rotation.targetMuscleBenefit;
            suggestedStartingWeightKg = Math.round(((ex.last_weight_kg || ex.starting_weight_kg || 20) * rotation.weightMultiplier) * 2) / 2;
            suggestedRepRange = rotation.targetRepRange;
            coachThinking = `Upper A and Upper B both currently feature ${ex.name}. Evolving Upper B to ${suggestedExerciseName} creates ideal movement variation (e.g. horizontal vs vertical vector or constant cable tension), stimulating all divisions of the muscle without repetitive strain.`;
          }
          patternSummary = 'Biweekly mesocycle variation candidate';
        } else if (isLowerB && ex.id === 'ex_leg_press') {
          status = 'STIMULUS_VARIATION';
          statusBadge = 'VARIATION OPPORTUNITY';
          actionRecommendation = 'SWAP';
          isPreSelected = false; // Optional suggestion

          suggestedExerciseId = 'ex_hip_thrust';
          const targetEx = exerciseLibraryMap.get('ex_hip_thrust');
          suggestedExerciseName = targetEx ? targetEx.name : 'Hip Thrust / Glute Bridge';
          targetMuscleBenefit = 'Pure glute peak contraction without lumbar axial loading';
          suggestedStartingWeightKg = 40;
          suggestedRepRange = '8–12';
          coachThinking = `Lower A emphasizes quad-heavy leg pressing. On Lower B, prioritizing posterior-chain hip thrusting produces balanced leg growth and allows quad tendons adequate recovery.`;
          patternSummary = 'Biweekly mesocycle variation candidate';
        } else {
          status = 'PROGRESSING_WELL';
          statusBadge = 'ON TRACK';
          actionRecommendation = 'KEEP';
          isPreSelected = false;
          coachThinking = `Exercise is aligned with your lean-bulk hypertrophy targets. Maintain consistency to establish measurable baseline overload over the coming sessions.`;
          patternSummary = ex.last_weight_kg ? `Baseline logged: ${ex.last_weight_kg}kg` : 'Ready for initial workout';
        }
      }

      adaptations.push({
        planId: plan.id,
        planName: plan.name,
        currentExerciseId: ex.id,
        currentExerciseName: ex.name,
        category: ex.category,
        primaryMuscle: ex.primary_muscle,
        status,
        statusBadge,
        actionRecommendation,
        suggestedExerciseId,
        suggestedExerciseName,
        suggestedStartingWeightKg,
        suggestedRepRange,
        targetMuscleBenefit,
        coachThinking,
        patternSummary,
        isPreSelected,
      });
    }
  }

  const progressingWellCount = adaptations.filter((a) => a.status === 'PROGRESSING_WELL').length;
  const plateauCount = adaptations.filter((a) => a.status === 'PLATEAU').length;
  const jointCautionCount = adaptations.filter((a) => a.status === 'JOINT_CAUTION').length;
  const stimulusVariationCount = adaptations.filter((a) => a.status === 'STIMULUS_VARIATION').length;

  let coachExecutiveSummary = '';
  if (jointCautionCount > 0) {
    coachExecutiveSummary = `Attention needed: ${jointCautionCount} joint fatigue area(s) detected. Joint-sparing exercise substitutions are recommended to safeguard your training consistency.`;
  } else if (plateauCount > 0) {
    coachExecutiveSummary = `${plateauCount} exercise(s) have reached a progression plateau. Rotating these movements provides fresh stimulus to reignite strength gains.`;
  } else if (stimulusVariationCount > 0) {
    coachExecutiveSummary = `Solid training consistency! Identified ${stimulusVariationCount} routine evolution opportunities between Upper/Lower days to optimize muscle balance.`;
  } else {
    coachExecutiveSummary = `Outstanding work! All core exercises are progressing cleanly with steady overload. We recommend maintaining your current routine for another 2-week block.`;
  }

  const coachThinkingOverview =
    `Every 14 days, your AI coach evaluates logged weights, reps, and RIR patterns. ` +
    `Sports science confirms repeating core exercises for 2–4 weeks is required to measure progressive overload, ` +
    `while biweekly adaptations prevent stagnation, balance muscle divisions, and safeguard your joints.`;

  return {
    reviewDate: todayStr,
    daysSinceLastReview,
    isDue,
    totalSessionsAnalyzed: windowSessions.length,
    totalExercisesReviewed: adaptations.length,
    progressingWellCount,
    plateauCount,
    jointCautionCount,
    stimulusVariationCount,
    adaptations,
    coachExecutiveSummary,
    coachThinkingOverview,
  };
}
