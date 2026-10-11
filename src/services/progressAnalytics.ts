/**
 * Sthira — Progress & Analytics Engine
 * Deterministic sports-science mathematical modeling:
 * - Exponential Moving Average (EMA) weight trend filter
 * - Weekly weight change velocity (kg/week)
 * - Calorie adaptation engine (energy balance adjustments)
 * - Sleep & recovery correlations with gym volume performance
 * - Lean bulk target trajectory modeling (64.0 kg -> 67.0 kg @ +0.15 kg/week)
 * - Strict adherence to Measured vs. Estimated principle
 */

export interface WeightDataPoint {
  date: string;
  weightKg: number;
}

export interface EmaWeightPoint {
  date: string;
  weightKg: number; // User-measured scale weight
  emaKg: number; // Mathematically estimated smoothed trend
}

export interface CalorieAdaptationInput {
  currentEmaKg: number;
  pastEmaKg: number; // EMA 7 days ago
  daysBetween: number;
  targetGainRateKgPerWeek: number; // e.g. 0.15
  currentCalorieTarget: number; // e.g. 2450
  averageCalorieIntake: number; // Average consumed kcal/day over period
  averageProteinIntake: number; // Average consumed protein g/day
  targetProteinMin: number; // e.g. 110
}

export interface CalorieAdaptationResult {
  actualRateKgPerWeek: number;
  targetRateKgPerWeek: number;
  rateDeltaKgPerWeek: number;
  recommendedCalorieDelta: number; // e.g. +125, 0, or -100
  newRecommendedCalories: number; // e.g. 2575
  action: 'increase' | 'maintain' | 'decrease';
  statusBadge: 'ON TRACK' | 'ADAPT SURPLUS' | 'TEMPER GAIN' | 'COMPLIANCE CHECK';
  rationale: string;
  isEstimated: true; // Strict distinction
}

export interface SleepWorkoutCorrelationResult {
  hasSufficientData: boolean;
  highSleepAvgVolumeKg: number; // Average volume on days with sleep >= 7.5h
  lowSleepAvgVolumeKg: number; // Average volume on days with sleep < 7.0h
  volumeDifferentialPercent: number; // e.g. +14.2%
  highSleepSessionCount: number;
  lowSleepSessionCount: number;
  insight: string;
}

export interface LeanBulkTrajectoryResult {
  startWeightKg: number;
  currentEmaKg: number;
  targetWeightKg: number;
  totalGainTargetKg: number;
  gainedSoFarKg: number;
  remainingKg: number;
  progressPercent: number;
  targetRateKgPerWeek: number;
  projectedWeeksRemaining: number;
  projectedTargetDate: string;
}

/**
 * Calculates Exponential Moving Average (EMA) series for body weight.
 * Default alpha = 0.1 (10% weight to current day, 90% to historical EMA).
 * This filters out transient water retention, sodium, and digestion shifts.
 */
export function calculateWeightEma(
  data: WeightDataPoint[],
  alpha = 0.1
): EmaWeightPoint[] {
  if (!data || data.length === 0) return [];

  // Sort chronological ascending
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
  const result: EmaWeightPoint[] = [];

  let currentEma = sorted[0].weightKg;

  for (let i = 0; i < sorted.length; i++) {
    const pt = sorted[i];
    if (i === 0) {
      currentEma = pt.weightKg;
    } else {
      currentEma = alpha * pt.weightKg + (1 - alpha) * currentEma;
    }

    result.push({
      date: pt.date,
      weightKg: Math.round(pt.weightKg * 10) / 10,
      emaKg: Math.round(currentEma * 100) / 100,
    });
  }

  return result;
}

/**
 * Calculates weekly weight change velocity (kg/week) based on EMA trend.
 */
export function calculateWeeklyGainRate(
  emaPoints: EmaWeightPoint[],
  lookbackDays = 7
): number {
  if (emaPoints.length < 2) return 0;

  const latest = emaPoints[emaPoints.length - 1];
  const targetIdx = Math.max(0, emaPoints.length - 1 - lookbackDays);
  const baseline = emaPoints[targetIdx];

  const days = Math.max(1, (new Date(latest.date).getTime() - new Date(baseline.date).getTime()) / (1000 * 60 * 60 * 24));
  const deltaKg = latest.emaKg - baseline.emaKg;

  const weeklyRate = (deltaKg / days) * 7;
  return Math.round(weeklyRate * 100) / 100;
}

/**
 * Deterministic Calorie Adaptation Engine.
 * Evaluates rate of gain against Jay's target (+0.10 to +0.20 kg/wk, ideal ~0.15 kg/wk).
 */
export function calculateCalorieAdaptation(
  input: CalorieAdaptationInput
): CalorieAdaptationResult {
  const days = Math.max(1, input.daysBetween || 7);
  const weightChange = input.currentEmaKg - input.pastEmaKg;
  const actualRatePerWeek = Math.round(((weightChange / days) * 7) * 100) / 100;
  const targetRate = input.targetGainRateKgPerWeek;
  const rateDelta = Math.round((actualRatePerWeek - targetRate) * 100) / 100;

  // Check nutritional compliance first
  const calorieAdherenceRatio = input.averageCalorieIntake / (input.currentCalorieTarget || 2450);

  // If user undereating significantly (<85% of target calories), stall is compliance not metabolism
  if (calorieAdherenceRatio < 0.85 && actualRatePerWeek < 0.05) {
    return {
      actualRateKgPerWeek: actualRatePerWeek,
      targetRateKgPerWeek: targetRate,
      rateDeltaKgPerWeek: rateDelta,
      recommendedCalorieDelta: 0,
      newRecommendedCalories: input.currentCalorieTarget,
      action: 'maintain',
      statusBadge: 'COMPLIANCE CHECK',
      rationale: `Weight gain stalled (+${actualRatePerWeek} kg/wk), but average intake was ${Math.round(input.averageCalorieIntake)} kcal (target: ${input.currentCalorieTarget} kcal). Focus on hitting your existing surplus target before adjusting caloric goals.`,
      isEstimated: true,
    };
  }

  // Case 1: Lean bulk sweet spot (0.10 kg/wk to 0.20 kg/wk)
  if (actualRatePerWeek >= 0.10 && actualRatePerWeek <= 0.20) {
    return {
      actualRateKgPerWeek: actualRatePerWeek,
      targetRateKgPerWeek: targetRate,
      rateDeltaKgPerWeek: rateDelta,
      recommendedCalorieDelta: 0,
      newRecommendedCalories: input.currentCalorieTarget,
      action: 'maintain',
      statusBadge: 'ON TRACK',
      rationale: `Optimal lean bulk rate! Gaining at +${actualRatePerWeek} kg/week (ideal: +${targetRate} kg/wk). Hypertrophy is maximized while minimizing excess fat accretion. Maintain current ${input.currentCalorieTarget} kcal target.`,
      isEstimated: true,
    };
  }

  // Case 2: Stalling or gaining too slowly (< 0.10 kg/wk)
  if (actualRatePerWeek < 0.10) {
    const adjustment = actualRatePerWeek < 0 ? 150 : 125;
    const newTarget = input.currentCalorieTarget + adjustment;
    return {
      actualRateKgPerWeek: actualRatePerWeek,
      targetRateKgPerWeek: targetRate,
      rateDeltaKgPerWeek: rateDelta,
      recommendedCalorieDelta: adjustment,
      newRecommendedCalories: newTarget,
      action: 'increase',
      statusBadge: 'ADAPT SURPLUS',
      rationale: `Gain rate is +${actualRatePerWeek} kg/week, below your +${targetRate} kg/week lean bulk target. Metabolic expenditure has adapted upward. Recommend an incremental surplus adjustment of +${adjustment} kcal (new target: ${newTarget} kcal/day).`,
      isEstimated: true,
    };
  }

  // Case 3: Gaining too fast (> 0.20 kg/wk)
  const adjustment = actualRatePerWeek > 0.30 ? -150 : -100;
  const newTarget = Math.max(2100, input.currentCalorieTarget + adjustment);
  return {
    actualRateKgPerWeek: actualRatePerWeek,
    targetRateKgPerWeek: targetRate,
    rateDeltaKgPerWeek: rateDelta,
    recommendedCalorieDelta: adjustment,
    newRecommendedCalories: newTarget,
    action: 'decrease',
    statusBadge: 'TEMPER GAIN',
    rationale: `Gain rate is +${actualRatePerWeek} kg/week, exceeding the +${targetRate} kg/week lean bulk threshold. Muscle protein synthesis has an upper velocity limit; recommend dialing back by ${adjustment} kcal (new target: ${newTarget} kcal/day) to keep gains clean.`,
    isEstimated: true,
  };
}

/**
 * Correlates sleep duration with gym training volume and perceived exertion.
 */
export function correlateSleepAndWorkout(
  dailyLogs: Array<{ date: string; sleep_hours?: number | null; recovery_rating?: number | null }>,
  workoutSessions: Array<{ date: string; duration_seconds?: number; difficulty_perceived?: string | null; totalVolumeKg?: number }>
): SleepWorkoutCorrelationResult {
  const highSleepVolumes: number[] = [];
  const lowSleepVolumes: number[] = [];

  const sleepMap = new Map<string, number>();
  for (const log of dailyLogs) {
    if (log.sleep_hours && log.sleep_hours > 0) {
      sleepMap.set(log.date, log.sleep_hours);
    }
  }

  for (const sess of workoutSessions) {
    const sleep = sleepMap.get(sess.date);
    const vol = sess.totalVolumeKg || 0;
    if (sleep && vol > 0) {
      if (sleep >= 7.5) {
        highSleepVolumes.push(vol);
      } else if (sleep < 7.0) {
        lowSleepVolumes.push(vol);
      }
    }
  }

  if (highSleepVolumes.length === 0 || lowSleepVolumes.length === 0) {
    return {
      hasSufficientData: false,
      highSleepAvgVolumeKg: 0,
      lowSleepAvgVolumeKg: 0,
      volumeDifferentialPercent: 0,
      highSleepSessionCount: highSleepVolumes.length,
      lowSleepSessionCount: lowSleepVolumes.length,
      insight: 'Log 7+ nights of sleep duration and workout sessions to unlock personalized sleep vs. performance correlations.',
    };
  }

  const highAvg = highSleepVolumes.reduce((a, b) => a + b, 0) / highSleepVolumes.length;
  const lowAvg = lowSleepVolumes.reduce((a, b) => a + b, 0) / lowSleepVolumes.length;
  const diffPercent = Math.round(((highAvg - lowAvg) / lowAvg) * 100);

  return {
    hasSufficientData: true,
    highSleepAvgVolumeKg: Math.round(highAvg),
    lowSleepAvgVolumeKg: Math.round(lowAvg),
    volumeDifferentialPercent: diffPercent,
    highSleepSessionCount: highSleepVolumes.length,
    lowSleepSessionCount: lowSleepVolumes.length,
    insight: `When you sleep ≥ 7.5 hours, your average workout volume is ${Math.abs(diffPercent)}% ${diffPercent >= 0 ? 'higher' : 'lower'} (${Math.round(highAvg)} kg vs ${Math.round(lowAvg)} kg). Prioritizing recovery directly accelerates your lean bulk.`,
  };
}

/**
 * Computes lean bulk trajectory toward 67.0 kg target.
 */
export function calculateLeanBulkTrajectory(
  startWeightKg = 64.0,
  currentEmaKg = 64.2,
  targetWeightKg = 67.0,
  targetRatePerWeek = 0.15
): LeanBulkTrajectoryResult {
  const totalGainTarget = Math.round((targetWeightKg - startWeightKg) * 10) / 10;
  const gainedSoFar = Math.max(0, Math.round((currentEmaKg - startWeightKg) * 10) / 10);
  const remaining = Math.max(0, Math.round((targetWeightKg - currentEmaKg) * 10) / 10);
  const progressPercent = Math.min(100, Math.max(0, Math.round((gainedSoFar / (totalGainTarget || 3)) * 100)));

  const projectedWeeksRemaining = Math.max(0, Math.round((remaining / (targetRatePerWeek || 0.15)) * 10) / 10);
  const projectedDays = Math.round(projectedWeeksRemaining * 7);

  const targetDate = new Date(Date.now() + projectedDays * 24 * 60 * 60 * 1000);
  const projectedTargetDate = targetDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    startWeightKg,
    currentEmaKg,
    targetWeightKg,
    totalGainTargetKg: totalGainTarget,
    gainedSoFarKg: gainedSoFar,
    remainingKg: remaining,
    progressPercent,
    targetRateKgPerWeek: targetRatePerWeek,
    projectedWeeksRemaining,
    projectedTargetDate,
  };
}
