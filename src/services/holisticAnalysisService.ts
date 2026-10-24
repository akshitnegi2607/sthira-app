/**
 * Sthira — Holistic Health, Training & Nutrition Analysis Service
 * Comprehensive deterministic intelligence engine evaluating:
 * 1. Scale Weight & Velocity (Raw vs EMA, +0.10 to +0.20 kg/wk lean bulk target)
 * 2. Nutrition Intake & Surplus Compliance (Kcal surplus, protein 1.6-2.0g/kg)
 * 3. Workout Volume, Overload Milestones & Joint Fatigue (Double progression, deload triggers)
 * 4. Actionable Revised Targets (1-tap SQLite goals update)
 */

import { ProgressRepository } from '@/database/repositories/progressRepository';
import { WorkoutRepository } from '@/database/repositories/workoutRepository';
import { ProfileRepository } from '@/database/repositories/profileRepository';
import { calculateWeightEma, calculateWeeklyGainRate } from './progressAnalytics';
import { Goals, UserProfile, Exercise, PainEntry } from '@/types/database';

export interface ExerciseOverloadRecommendation {
  exerciseId: string;
  exerciseName: string;
  category: string;
  currentWeightKg: number;
  recommendedWeightKg: number;
  reason: string;
  isDeload: boolean;
}

export interface HolisticAnalysisReport {
  generatedAt: string;
  overallStatus: 'ON TRACK' | 'ADAPT SURPLUS' | 'TEMPER GAIN' | 'NUTRITION COMPLIANCE' | 'PROTEIN BOOST' | 'RECOVERY FOCUS';
  statusBadgeColor: string;
  headline: string;
  executiveSummary: string;

  // 1. Weight & Velocity Metrics
  weight: {
    currentRawKg: number;
    currentEmaKg: number;
    startWeightKg: number;
    targetWeightKg: number;
    gainedSoFarKg: number;
    remainingKg: number;
    weeklyGainRateKg: number;
    idealRateRange: string;
    velocityEvaluation: string;
  };

  // 2. Nutrition Intake & Surplus Metrics
  nutrition: {
    currentCalorieTarget: number;
    currentProteinTarget: number;
    averageCaloriesConsumed: number;
    averageProteinConsumed: number;
    calorieAdherencePercent: number;
    proteinAdherencePercent: number;
    surplusStatus: 'Optimal Surplus' | 'Mild Deficit / Maintenance' | 'Excessive Surplus';
    nutritionVerdict: string;
  };

  // 3. Training Consistency & Volume
  workout: {
    targetDaysPerWeek: number;
    completedInPast7Days: number;
    totalVolumeKgPast7Days: number;
    totalVolumeKgPrevious7Days: number;
    volumeChangePercent: number;
    overloadCount: number;
    readyForProgression: ExerciseOverloadRecommendation[];
    jointFatigueFlags: Array<{ bodyArea: string; painLevel: number; note: string }>;
    trainingVerdict: string;
  };

  // 4. Proposed Revisions
  revisions: {
    proposedCalories: number;
    caloriesDelta: number;
    proposedProteinMin: number;
    proposedProteinMax: number;
    nutritionActionPoints: string[];
    workoutActionPoints: string[];
  };
}

export const HolisticAnalysisService = {
  /**
   * Generates a complete deterministic analysis across weight, nutrition, and training.
   */
  generateReport(): HolisticAnalysisReport {
    const profile = ProfileRepository.getProfile() || {
      current_weight: 64.0,
      target_weight: 67.0,
      gym_days_per_week: 4,
    } as UserProfile;

    const goals = ProfileRepository.getGoals() || {
      calories_target: 2450,
      protein_target_min: 110,
      protein_target_max: 125,
      workout_days_target: 4,
    } as Goals;

    // --- 1. Scale Weight Analysis ---
    const weightEntries = ProgressRepository.getWeightHistory(30);
    const rawPoints = weightEntries.map((w) => ({ date: w.date, weightKg: w.weight_kg }));
    const emaSeries = calculateWeightEma(rawPoints, 0.1);
    const weeklyRate = calculateWeeklyGainRate(emaSeries, 7);

    const latestRaw = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight_kg : profile.current_weight;
    const latestEma = emaSeries.length > 0 ? emaSeries[emaSeries.length - 1].emaKg : latestRaw;
    const startWeight = 64.0;
    const targetWeight = profile.target_weight || 67.0;
    const gainedSoFar = Math.max(0, Math.round((latestEma - startWeight) * 10) / 10);
    const remainingKg = Math.max(0, Math.round((targetWeight - latestEma) * 10) / 10);

    let velocityEval = '';
    if (weeklyRate >= 0.10 && weeklyRate <= 0.20) {
      velocityEval = `Optimal lean bulk speed (+${weeklyRate} kg/week). Clean hypertrophy with minimal fat deposition.`;
    } else if (weeklyRate < 0.10 && weeklyRate >= 0) {
      velocityEval = `Slower than target (+${weeklyRate} kg/week, target: +0.15 kg/week). Hypertrophy stimulus may be stalling.`;
    } else if (weeklyRate < 0) {
      velocityEval = `Losing weight (${weeklyRate} kg/week). Caloric expenditure exceeds intake.`;
    } else {
      velocityEval = `Exceeding lean bulk speed (+${weeklyRate} kg/week > 0.20 kg/week). Excess fat accretion risk.`;
    }

    // --- 2. Nutrition Compliance Analysis ---
    const dailyLogs = ProgressRepository.getDailyLogsForPeriod(14);
    const logsWithCalories = dailyLogs.filter((l) => (l.calories_consumed || 0) > 0);
    const avgCalories = logsWithCalories.length > 0
      ? Math.round(logsWithCalories.reduce((acc, l) => acc + (l.calories_consumed || 0), 0) / logsWithCalories.length)
      : goals.calories_target;

    const logsWithProtein = dailyLogs.filter((l) => (l.protein_consumed || 0) > 0);
    const avgProtein = logsWithProtein.length > 0
      ? Math.round(logsWithProtein.reduce((acc, l) => acc + (l.protein_consumed || 0), 0) / logsWithProtein.length)
      : Math.round(goals.protein_target_min);

    const calAdherence = Math.round((avgCalories / (goals.calories_target || 2450)) * 100);
    const proteinAdherence = Math.round((avgProtein / (goals.protein_target_min || 110)) * 100);

    let surplusStatus: 'Optimal Surplus' | 'Mild Deficit / Maintenance' | 'Excessive Surplus' = 'Optimal Surplus';
    let nutritionVerdict = '';

    if (calAdherence < 85) {
      surplusStatus = 'Mild Deficit / Maintenance';
      nutritionVerdict = `You are averaging ${avgCalories} kcal/day (${calAdherence}% of ${goals.calories_target} kcal target). You are undereating relative to your surplus target.`;
    } else if (calAdherence > 115) {
      surplusStatus = 'Excessive Surplus';
      nutritionVerdict = `Averaging ${avgCalories} kcal/day (${calAdherence}% of target). Surplus is too aggressive for a pure lean bulk.`;
    } else {
      surplusStatus = 'Optimal Surplus';
      nutritionVerdict = `Consistent energy balance. Averaging ${avgCalories} kcal/day (${calAdherence}% compliance) and ${avgProtein}g protein.`;
    }

    // --- 3. Training Consistency & Progressive Overload ---
    const allSessions = ProgressRepository.getWorkoutSessionsWithVolume(21);
    const past7DaysCutoff = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const prev7DaysCutoff = new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0];

    const past7Sessions = allSessions.filter((s) => s.date >= past7DaysCutoff);
    const prev7Sessions = allSessions.filter((s) => s.date >= prev7DaysCutoff && s.date < past7DaysCutoff);

    const past7Vol = past7Sessions.reduce((acc, s) => acc + (s.totalVolumeKg || 0), 0);
    const prev7Vol = prev7Sessions.reduce((acc, s) => acc + (s.totalVolumeKg || 0), 0);
    const volChange = prev7Vol > 0 ? Math.round(((past7Vol - prev7Vol) / prev7Vol) * 100) : 0;

    const allExercises = WorkoutRepository.getAllExercises();
    const recentPain = WorkoutRepository.getRecentPainEntries(14);

    const readyForProgression: ExerciseOverloadRecommendation[] = [];
    let overloadCount = 0;

    allExercises.forEach((ex) => {
      const lastW = ex.last_weight_kg || 0;
      const recW = ex.current_recommended_weight_kg || ex.starting_weight_kg || 0;
      if (lastW > (ex.starting_weight_kg || 0)) {
        overloadCount++;
      }

      // Check if exercise has pain in its target group
      const hasPain = recentPain.some((p) =>
        ex.primary_muscle.toLowerCase().includes(p.body_area.toLowerCase()) ||
        p.body_area.toLowerCase().includes(ex.primary_muscle.toLowerCase())
      );

      if (hasPain) {
        readyForProgression.push({
          exerciseId: ex.id,
          exerciseName: ex.name,
          category: ex.category,
          currentWeightKg: lastW || recW,
          recommendedWeightKg: Math.max(5, Math.round(recW * 0.85 * 2) / 2),
          reason: `Joint discomfort logged in ${ex.primary_muscle}. 15% deload recommended to protect connective tissue.`,
          isDeload: true,
        });
      } else if (recW > lastW && lastW > 0) {
        readyForProgression.push({
          exerciseId: ex.id,
          exerciseName: ex.name,
          category: ex.category,
          currentWeightKg: lastW,
          recommendedWeightKg: recW,
          reason: `Reps and RIR targets achieved last session! Ready to advance weight +${Math.round((recW - lastW) * 10) / 10} kg.`,
          isDeload: false,
        });
      }
    });

    const jointFlags = recentPain
      .filter((p) => p.pain_level >= 3)
      .map((p) => ({
        bodyArea: p.body_area,
        painLevel: p.pain_level,
        note: p.notes || 'Moderate discomfort during training',
      }));

    let trainingVerdict = '';
    const completedWorkouts = past7Sessions.length;
    if (completedWorkouts >= (profile.gym_days_per_week || 4)) {
      trainingVerdict = `Superb consistency! Completed ${completedWorkouts} workouts this week (${past7Vol.toLocaleString()} kg total volume). Overload progression is healthy across ${overloadCount} exercises.`;
    } else {
      trainingVerdict = `Logged ${completedWorkouts} of ${profile.gym_days_per_week || 4} planned workouts this week. You can use the "Swap / Change" tool on the home screen to catch up on any missed split sessions!`;
    }

    // --- 4. Synthesis, Overall Status & Revised Plan ---
    let overallStatus: HolisticAnalysisReport['overallStatus'] = 'ON TRACK';
    let statusBadgeColor = '#10B981'; // Green
    let headline = 'Lean Bulk Progressing Optimally';
    let executiveSummary = '';
    let proposedCalories = goals.calories_target;
    let caloriesDelta = 0;
    let proposedProteinMin = goals.protein_target_min;
    let proposedProteinMax = goals.protein_target_max;
    const nutritionActionPoints: string[] = [];
    const workoutActionPoints: string[] = [];

    // Decision Logic:
    if (calAdherence < 85 && weeklyRate < 0.10) {
      overallStatus = 'NUTRITION COMPLIANCE';
      statusBadgeColor = '#F59E0B'; // Amber
      headline = 'Gain Stalled by Nutrition Inconsistency';
      executiveSummary = `Your scale weight gain is currently slow (+${weeklyRate} kg/wk), but the root cause is caloric intake (${avgCalories} kcal vs ${goals.calories_target} kcal target). Keep your current 2,450 kcal target, but focus on closing the daily intake gap.`;
      proposedCalories = goals.calories_target;
      caloriesDelta = 0;
      nutritionActionPoints.push(`Hit your existing ${goals.calories_target} kcal target consistently before increasing food further.`);
      nutritionActionPoints.push(`Add a reliable 300 kcal vegetarian snack daily (e.g. 150g Greek yogurt with walnuts or 100g paneer with chaat masala).`);
    } else if (weeklyRate < 0.10) {
      overallStatus = 'ADAPT SURPLUS';
      statusBadgeColor = '#3B82F6'; // Blue
      headline = 'Metabolic Expenditure Adapted — Increase Surplus';
      caloriesDelta = weeklyRate < 0 ? 150 : 125;
      proposedCalories = goals.calories_target + caloriesDelta;
      executiveSummary = `You are adhering to your diet (${calAdherence}% compliance), but gain rate is +${weeklyRate} kg/week (target: +0.15 kg/wk). Your neat non-exercise activity and metabolism have adapted upward. Recommend increasing daily calories by +${caloriesDelta} kcal to sustain muscle building.`;
      nutritionActionPoints.push(`Increase daily calorie target by +${caloriesDelta} kcal (from ${goals.calories_target} to ${proposedCalories} kcal/day).`);
      nutritionActionPoints.push(`Distribute extra ~125 kcal as complex carbs around your workout (e.g. 1 extra banana with peanut butter or 1 cup oats).`);
    } else if (weeklyRate > 0.20) {
      overallStatus = 'TEMPER GAIN';
      statusBadgeColor = '#F59E0B'; // Amber
      headline = 'Weight Gaining Faster Than Lean Bulk Capacity';
      caloriesDelta = weeklyRate > 0.30 ? -150 : -100;
      proposedCalories = Math.max(2150, goals.calories_target + caloriesDelta);
      executiveSummary = `Current velocity is +${weeklyRate} kg/week, which exceeds the maximal muscle protein synthesis rate for a lean bulk. Dialing back calories slightly will preserve lean muscular gains while stopping unwanted fat accretion.`;
      nutritionActionPoints.push(`Reduce daily target by ${Math.abs(caloriesDelta)} kcal (from ${goals.calories_target} to ${proposedCalories} kcal/day).`);
      nutritionActionPoints.push(`Keep protein high (120–125g) while slightly moderating cooking oils and refined carbs.`);
    } else if (avgProtein < 110) {
      overallStatus = 'PROTEIN BOOST';
      statusBadgeColor = '#8B5CF6'; // Purple
      headline = 'Caloric Surplus Good — Increase Protein Density';
      proposedProteinMin = 120;
      proposedProteinMax = 130;
      executiveSummary = `Calories and rate of gain (+${weeklyRate} kg/wk) are on track, but average protein intake is ${avgProtein}g/day. For optimal hypertrophy at 64 kg, aim for 1.8–2.0g/kg (~120–125g/day).`;
      nutritionActionPoints.push(`Elevate daily protein target from ${goals.protein_target_min}g to 125g.`);
      nutritionActionPoints.push(`Incorporate high-yield vegetarian protein staples: Soya Chunks (52g protein/100g), Low-Fat Paneer (18g/100g), and Edamame/Tofu.`);
    } else if (jointFlags.length > 0) {
      overallStatus = 'RECOVERY FOCUS';
      statusBadgeColor = '#EC4899'; // Pink
      headline = 'Joint Strain Detected — Protect Connective Tissue';
      executiveSummary = `Joint discomfort reported in ${jointFlags.map((j) => j.bodyArea).join(', ')}. Training volume should be deloaded by 15% on affected exercises while keeping nutrition steady for tissue recovery.`;
      workoutActionPoints.push(`Deload affected exercises by 15% in weight while keeping 3 RIR.`);
      workoutActionPoints.push(`Emphasize Tuesday Yoga & mobility sessions and ensure 7.5+ hours of sleep nightly.`);
    } else {
      overallStatus = 'ON TRACK';
      statusBadgeColor = '#10B981'; // Emerald Green
      headline = 'Perfect Hypertrophy Balance';
      executiveSummary = `Both nutrition (${avgCalories} kcal, ${avgProtein}g protein) and weight velocity (+${weeklyRate} kg/week) are dialed in. Training volume is progressing steadily with ${overloadCount} exercises overloaded. Keep following the plan!`;
      nutritionActionPoints.push(`Maintain current ${goals.calories_target} kcal target and ~120g protein.`);
      nutritionActionPoints.push(`Keep pre-workout carbs 1-2 hours before training for peak gym output.`);
    }

    // Workout action points
    if (readyForProgression.length > 0) {
      const topProg = readyForProgression.filter((p) => !p.isDeload).slice(0, 2);
      topProg.forEach((p) => {
        workoutActionPoints.push(`${p.exerciseName}: Ready for +${Math.round((p.recommendedWeightKg - p.currentWeightKg) * 10) / 10} kg progression (new target: ${p.recommendedWeightKg} kg).`);
      });
      const topDeload = readyForProgression.filter((p) => p.isDeload).slice(0, 1);
      topDeload.forEach((p) => {
        workoutActionPoints.push(`${p.exerciseName}: Take a 15% deload to ${p.recommendedWeightKg} kg to let ${p.category} fatigue settle.`);
      });
    }

    if (completedWorkouts < (profile.gym_days_per_week || 4)) {
      workoutActionPoints.push(`Missed a split workout? Use the [Swap / Change] button to perform yesterday's session today.`);
    }

    return {
      generatedAt: new Date().toISOString(),
      overallStatus,
      statusBadgeColor,
      headline,
      executiveSummary,
      weight: {
        currentRawKg: latestRaw,
        currentEmaKg: latestEma,
        startWeightKg: startWeight,
        targetWeightKg: targetWeight,
        gainedSoFarKg: gainedSoFar,
        remainingKg: remainingKg,
        weeklyGainRateKg: weeklyRate,
        idealRateRange: '+0.10 to +0.20 kg/wk',
        velocityEvaluation: velocityEval,
      },
      nutrition: {
        currentCalorieTarget: goals.calories_target,
        currentProteinTarget: Math.round(goals.protein_target_min),
        averageCaloriesConsumed: avgCalories,
        averageProteinConsumed: avgProtein,
        calorieAdherencePercent: calAdherence,
        proteinAdherencePercent: proteinAdherence,
        surplusStatus,
        nutritionVerdict,
      },
      workout: {
        targetDaysPerWeek: profile.gym_days_per_week || 4,
        completedInPast7Days: completedWorkouts,
        totalVolumeKgPast7Days: past7Vol,
        totalVolumeKgPrevious7Days: prev7Vol,
        volumeChangePercent: volChange,
        overloadCount,
        readyForProgression,
        jointFatigueFlags: jointFlags,
        trainingVerdict,
      },
      revisions: {
        proposedCalories,
        caloriesDelta,
        proposedProteinMin,
        proposedProteinMax,
        nutritionActionPoints,
        workoutActionPoints,
      },
    };
  },

  /**
   * Applies the revised caloric and protein targets to SQLite Goals table.
   */
  applyRevisedTargets(calories: number, proteinMin: number, proteinMax: number): Goals {
    const goals = ProfileRepository.getGoals();
    if (!goals) throw new Error('Goals record not found');

    const updatedGoals = {
      calories_target: Math.round(calories),
      protein_target_min: Math.round(proteinMin),
      protein_target_max: Math.round(proteinMax),
      // Recalculate carbs dynamically (remaining calories after protein and fat)
      carbs_target: Math.max(250, Math.round((calories - (proteinMin * 4) - (goals.fat_target_min * 9)) / 4)),
    };

    ProfileRepository.updateGoals(updatedGoals);
    return ProfileRepository.getGoals()!;
  },
};
