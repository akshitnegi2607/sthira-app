/**
 * Sthira — Progressive Overload Engine
 * Deterministic sports-science progression rules:
 * - Double progression model (weight + reps within target range)
 * - RIR (Reps In Reserve) evaluation
 * - Distinct upper-body vs. lower-body vs. isolation increments
 * - Pain and joint fatigue safety deload flags
 * - Strict distinction: user-measured data vs. estimated targets
 */

export interface OverloadInput {
  exerciseId: string;
  exerciseName: string;
  category: string;
  primaryMuscle: string;
  targetSets: number;
  targetRepRange: string; // e.g. "8–12" or "10-15" or "5"
  lastWeightKg: number | null;
  completedSets: Array<{
    setNumber: number;
    weightKg: number;
    reps: number;
    rir: number | null; // 0 = failure, 1 = 1 rep in tank, etc.
    isCompleted: boolean;
  }>;
  recentPainLevel?: number; // 0-10 on associated body area
  recentPainArea?: string;
}

export interface OverloadRecommendation {
  exerciseId: string;
  currentWeightKg: number;
  recommendedWeightKg: number;
  weightDeltaKg: number;
  recommendedReps: string;
  action: 'increase' | 'maintain' | 'deload' | 'caution';
  statusBadge: 'PROGRESSION' | 'CONSOLIDATE' | 'DELOAD' | 'SAFETY CAUTION';
  rationale: string;
  isEstimated: true; // Strictly flagged as estimated target
}

/**
 * Parses a rep range string like "8–12", "8-12", "10–15", or "10" into min & max.
 */
export function parseRepRange(repRangeStr: string): { minReps: number; maxReps: number } {
  if (!repRangeStr) return { minReps: 8, maxReps: 12 };
  // Replace en-dash, em-dash with standard hyphen
  const normalized = repRangeStr.replace(/[–—]/g, '-').trim();
  const parts = normalized.split('-').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
  
  if (parts.length >= 2) {
    return { minReps: Math.min(parts[0], parts[1]), maxReps: Math.max(parts[0], parts[1]) };
  } else if (parts.length === 1) {
    return { minReps: parts[0], maxReps: parts[0] };
  }
  return { minReps: 8, maxReps: 12 };
}

/**
 * Determines appropriate weight increment based on exercise category and equipment.
 */
export function getWeightIncrementKg(category: string, currentWeight: number): number {
  const cat = category.toLowerCase();
  // Lower body compound lifts can handle larger jumps
  if (cat.includes('leg') || cat.includes('quad') || cat.includes('hamstring') || cat.includes('glute')) {
    return currentWeight >= 60 ? 5.0 : 2.5;
  }
  // Smaller isolation muscle groups (arms, lateral delts, calves)
  if (cat.includes('shoulder') || cat.includes('arm') || cat.includes('biceps') || cat.includes('triceps') || cat.includes('calf') || cat.includes('core')) {
    return 1.25;
  }
  // Upper body compounds (chest press, rows, lat pulldowns)
  return 2.5;
}

/**
 * Evaluates exercise performance and computes the next session's progressive overload target.
 */
export function calculateProgressiveOverload(input: OverloadInput): OverloadRecommendation {
  const { minReps, maxReps } = parseRepRange(input.targetRepRange);
  const currentWeight = input.lastWeightKg ?? 20;

  // 1. Safety & Pain Check: If active pain >= 5 is recorded in relevant joint/muscle
  if (input.recentPainLevel && input.recentPainLevel >= 5) {
    const deloadWeight = Math.max(0, Math.round((currentWeight * 0.85) * 2) / 2); // 15% reduction rounded to 0.5kg
    return {
      exerciseId: input.exerciseId,
      currentWeightKg: currentWeight,
      recommendedWeightKg: deloadWeight,
      weightDeltaKg: Math.round((deloadWeight - currentWeight) * 10) / 10,
      recommendedReps: `${minReps}–${maxReps}`,
      action: 'caution',
      statusBadge: 'SAFETY CAUTION',
      rationale: `⚠️ Recent pain recorded in ${input.recentPainArea || 'target area'} (Pain Level ${input.recentPainLevel}/10). Reduced load by 15% to safeguard joints. Deload or substitute if discomfort persists.`,
      isEstimated: true,
    };
  }

  const validSets = input.completedSets.filter((s) => s.isCompleted && s.reps > 0);

  // If no sets completed, recommend continuing with current load
  if (validSets.length === 0) {
    return {
      exerciseId: input.exerciseId,
      currentWeightKg: currentWeight,
      recommendedWeightKg: currentWeight,
      weightDeltaKg: 0,
      recommendedReps: `${minReps}–${maxReps}`,
      action: 'maintain',
      statusBadge: 'CONSOLIDATE',
      rationale: `Maintain current working load of ${currentWeight} kg for ${minReps}–${maxReps} reps.`,
      isEstimated: true,
    };
  }

  const allHitMaxReps = validSets.length >= input.targetSets && validSets.every((s) => s.reps >= maxReps);
  const anyFailedBelowMin = validSets.some((s) => s.reps < minReps);
  
  // Calculate average RIR across completed sets (default to 2 if not tracked)
  const trackedRirSets = validSets.filter((s) => s.rir !== null && s.rir !== undefined);
  const avgRir = trackedRirSets.length > 0
    ? trackedRirSets.reduce((sum, s) => sum + (s.rir ?? 2), 0) / trackedRirSets.length
    : 2;

  // Case A: All target sets completed at or above top of rep range with good reserve (RIR >= 1)
  if (allHitMaxReps && avgRir >= 1) {
    const increment = getWeightIncrementKg(input.category, currentWeight);
    const nextWeight = Math.round((currentWeight + increment) * 10) / 10;

    return {
      exerciseId: input.exerciseId,
      currentWeightKg: currentWeight,
      recommendedWeightKg: nextWeight,
      weightDeltaKg: increment,
      recommendedReps: `${minReps} reps`,
      action: 'increase',
      statusBadge: 'PROGRESSION',
      rationale: `Target achieved! Hit ${maxReps} reps across all ${validSets.length} sets with ~${Math.round(avgRir)} RIR in reserve. Progressive overload unlocked: increase load to ${nextWeight} kg (+${increment} kg) and aim for ${minReps} reps.`,
      isEstimated: true,
    };
  }

  // Case B: Hit top reps but right at failure (RIR = 0), or hit min reps consistently
  if (allHitMaxReps && avgRir < 1) {
    return {
      exerciseId: input.exerciseId,
      currentWeightKg: currentWeight,
      recommendedWeightKg: currentWeight,
      weightDeltaKg: 0,
      recommendedReps: `${maxReps} reps`,
      action: 'maintain',
      statusBadge: 'CONSOLIDATE',
      rationale: `Reached ${maxReps} reps but close to technical failure (RIR 0). Consolidate at ${currentWeight} kg to build cleaner movement quality before increasing weight.`,
      isEstimated: true,
    };
  }

  // Case C: Sets fell below the minimum rep threshold
  if (anyFailedBelowMin) {
    // If significantly under-repped (< minReps - 2) on multiple sets, suggest slight deload
    const severelyUnder = validSets.filter((s) => s.reps < minReps - 2).length >= 2;
    if (severelyUnder) {
      const deloadWeight = Math.max(0, Math.round((currentWeight * 0.9) * 2) / 2);
      return {
        exerciseId: input.exerciseId,
        currentWeightKg: currentWeight,
        recommendedWeightKg: deloadWeight,
        weightDeltaKg: Math.round((deloadWeight - currentWeight) * 10) / 10,
        recommendedReps: `${minReps}–${maxReps}`,
        action: 'deload',
        statusBadge: 'DELOAD',
        rationale: `Reps fell below minimum target range (${minReps} reps). Recommended -10% reset to ${deloadWeight} kg to re-establish hypertrophy volume.`,
        isEstimated: true,
      };
    }

    return {
      exerciseId: input.exerciseId,
      currentWeightKg: currentWeight,
      recommendedWeightKg: currentWeight,
      weightDeltaKg: 0,
      recommendedReps: `${minReps}–${maxReps}`,
      action: 'maintain',
      statusBadge: 'CONSOLIDATE',
      rationale: `Reps were slightly below threshold (${minReps}–${maxReps}). Stay at ${currentWeight} kg until all sets comfortably exceed ${minReps} reps.`,
      isEstimated: true,
    };
  }

  // Case D: In between minReps and maxReps (e.g. 9 or 10 reps)
  const lowestReps = Math.min(...validSets.map((s) => s.reps));
  const nextTargetRep = Math.min(maxReps, lowestReps + 1);

  return {
    exerciseId: input.exerciseId,
    currentWeightKg: currentWeight,
    recommendedWeightKg: currentWeight,
    weightDeltaKg: 0,
    recommendedReps: `${nextTargetRep}–${maxReps}`,
    action: 'maintain',
    statusBadge: 'CONSOLIDATE',
    rationale: `Solid progression. Completed ${validSets.length} sets between ${lowestReps}–${Math.max(...validSets.map((s) => s.reps))} reps. Maintain ${currentWeight} kg and aim for +1 rep per set next session.`,
    isEstimated: true,
  };
}
