/**
 * Sthira — Daily Journal & Readiness Engine
 * Deterministic sports-science mathematical modeling:
 * - Morning Readiness Score calculation (0–100%)
 * - Readiness category & workout load recommendation
 * - Reflection sentiment & theme classification
 * - Holistic Daily AI Coach Review synthesis
 * - Strict adherence to Measured vs. Estimated principle
 */

import { DailyLog, Goals } from '../types/database';

export type ReadinessLevel = 'OPTIMAL' | 'MODERATE' | 'FATIGUED';

export interface ReadinessBreakdown {
  sleepScore: number; // max 35
  energyScore: number; // max 25
  sorenessScore: number; // max 20
  moodScore: number; // max 20
  totalScore: number; // 0-100
  level: ReadinessLevel;
  recommendation: string;
  isEstimated: true;
}

export interface ReflectionAnalysis {
  sentiment: 'motivated' | 'calm' | 'neutral' | 'fatigued' | 'stressed';
  themes: string[];
}

export interface DailyCoachReviewResult {
  date: string;
  status: 'ON TRACK' | 'ATTENTION' | 'NEEDS ACTION';
  headline: string;
  summary: string;
  actionItems: string[];
  readinessScore: number;
  isEstimated: true;
}

/**
 * Calculates a deterministic morning readiness score (0-100%)
 * based on physiological and subjective recovery indicators.
 */
export function calculateReadinessScore(params: {
  sleepHours?: number | null;
  energyRating?: number | null; // 1-10
  moodRating?: number | null; // 1-10
  sorenessRating?: number | null; // 1-10 (1 = fresh, 10 = extreme soreness)
}): ReadinessBreakdown {
  const sleep = params.sleepHours ?? 7.5;
  const energy = params.energyRating ?? 7;
  const mood = params.moodRating ?? 7;
  const soreness = params.sorenessRating ?? 3;

  // 1. Sleep Score (0-35 points)
  // Baseline target: 8.0 hours
  let sleepScore = 0;
  if (sleep >= 8.0) {
    sleepScore = 35;
  } else if (sleep >= 7.0) {
    sleepScore = Math.round(28 + ((sleep - 7.0) / 1.0) * 7);
  } else if (sleep >= 6.0) {
    sleepScore = Math.round(20 + ((sleep - 6.0) / 1.0) * 8);
  } else {
    sleepScore = Math.max(8, Math.round((sleep / 6.0) * 20));
  }

  // 2. Energy Score (0-25 points)
  const energyScore = Math.round((Math.max(1, Math.min(10, energy)) / 10) * 25);

  // 3. Soreness / Joint Freshness Score (0-20 points)
  // Inverse scale: low soreness = high freshness score
  const sorenessScore = Math.round(
    ((11 - Math.max(1, Math.min(10, soreness))) / 10) * 20
  );

  // 4. Mood Score (0-20 points)
  const moodScore = Math.round((Math.max(1, Math.min(10, mood)) / 10) * 20);

  const totalScore = Math.min(
    100,
    Math.max(15, sleepScore + energyScore + sorenessScore + moodScore)
  );

  let level: ReadinessLevel = 'MODERATE';
  let recommendation = '';

  if (totalScore >= 80) {
    level = 'OPTIMAL';
    recommendation =
      'Physiological readiness is primed. Full capacity for progressive overload, heavy compound lifts, and high volume.';
  } else if (totalScore >= 62) {
    level = 'MODERATE';
    recommendation =
      'Baseline recovery established. Execute your scheduled session sets and target reps, but avoid gratuitous junk volume.';
  } else {
    level = 'FATIGUED';
    recommendation =
      'Elevated systemic fatigue or muscle soreness detected. Consider reducing working sets by 1 per exercise or prioritizing yoga & mobility.';
  }

  return {
    sleepScore,
    energyScore,
    sorenessScore,
    moodScore,
    totalScore,
    level,
    recommendation,
    isEstimated: true,
  };
}

/**
 * Analyzes natural language reflection notes for sentiment and core themes.
 */
export function extractSentimentAndThemes(notes: string): ReflectionAnalysis {
  if (!notes || notes.trim().length === 0) {
    return {
      sentiment: 'neutral',
      themes: [],
    };
  }

  const lower = notes.toLowerCase();
  const themes: string[] = [];

  // Theme matching
  if (lower.includes('sleep') || lower.includes('woke') || lower.includes('night') || lower.includes('dream')) {
    themes.push('sleep_quality');
  }
  if (lower.includes('protein') || lower.includes('paneer') || lower.includes('tofu') || lower.includes('meal') || lower.includes('ate') || lower.includes('food') || lower.includes('hungry')) {
    themes.push('nutrition');
  }
  if (lower.includes('gym') || lower.includes('lift') || lower.includes('press') || lower.includes('squat') || lower.includes('rep') || lower.includes('volume') || lower.includes('workout')) {
    themes.push('training');
  }
  if (lower.includes('sore') || lower.includes('pain') || lower.includes('stiff') || lower.includes('shoulder') || lower.includes('knee') || lower.includes('joint')) {
    themes.push('joint_health');
  }
  if (lower.includes('work') || lower.includes('study') || lower.includes('stress') || lower.includes('busy') || lower.includes('hectic')) {
    themes.push('lifestyle_stress');
  }
  if (lower.includes('rest') || lower.includes('yoga') || lower.includes('swim') || lower.includes('walk') || lower.includes('mobility')) {
    themes.push('active_recovery');
  }

  // Sentiment scoring
  const motivatedWords = ['great', 'strong', 'good', 'crushed', 'energized', 'motivated', 'easy', 'pr', 'pump', 'progress'];
  const calmWords = ['peaceful', 'calm', 'rested', 'steady', 'balanced', 'content', 'relaxed', 'grateful'];
  const fatiguedWords = ['tired', 'exhausted', 'drained', 'sore', 'heavy', 'lethargic', 'stiff', 'sleepy'];
  const stressedWords = ['stressed', 'anxious', 'hectic', 'overwhelmed', 'rushed', 'behind', 'headache'];

  let scoreMotivated = 0;
  let scoreCalm = 0;
  let scoreFatigued = 0;
  let scoreStressed = 0;

  for (const w of motivatedWords) if (lower.includes(w)) scoreMotivated++;
  for (const w of calmWords) if (lower.includes(w)) scoreCalm++;
  for (const w of fatiguedWords) if (lower.includes(w)) scoreFatigued++;
  for (const w of stressedWords) if (lower.includes(w)) scoreStressed++;

  let sentiment: ReflectionAnalysis['sentiment'] = 'neutral';
  const maxScore = Math.max(scoreMotivated, scoreCalm, scoreFatigued, scoreStressed);

  if (maxScore > 0) {
    if (maxScore === scoreMotivated) sentiment = 'motivated';
    else if (maxScore === scoreCalm) sentiment = 'calm';
    else if (maxScore === scoreStressed) sentiment = 'stressed';
    else if (maxScore === scoreFatigued) sentiment = 'fatigued';
  }

  return {
    sentiment,
    themes,
  };
}

/**
 * Synthesizes holistic Daily AI Coach Review evaluating nutrition,
 * training volume, readiness, and subjective mindset.
 */
export function generateDailyCoachReview(params: {
  dailyLog: DailyLog;
  goals: Goals;
  workoutSession?: {
    title: string;
    completedSets: number;
    totalVolumeKg: number;
  } | null;
  readinessScore: number;
  morningNotes?: string | null;
  eveningNotes?: string | null;
}): DailyCoachReviewResult {
  const { dailyLog, goals, workoutSession, readinessScore } = params;
  const calConsumed = dailyLog.calories_consumed || 0;
  const proConsumed = dailyLog.protein_consumed || 0;
  const calTarget = goals.calories_target || 2450;
  const proMin = goals.protein_target_min || 110;

  const calDiff = calConsumed - calTarget;
  const proDiff = proConsumed - proMin;
  const hasWorkout = !!workoutSession && workoutSession.completedSets > 0;
  const isHighReadiness = readinessScore >= 80;

  const actionItems: string[] = [];
  let status: 'ON TRACK' | 'ATTENTION' | 'NEEDS ACTION' = 'ON TRACK';
  let headline = '';
  let summary = '';

  // 1. Evaluate Nutrition Adherence
  const calHit = calConsumed >= calTarget * 0.9 && calConsumed <= calTarget * 1.15;
  const proHit = proConsumed >= proMin;

  if (proHit && (calHit || calConsumed >= calTarget * 0.88)) {
    // Solid day
    if (hasWorkout) {
      status = 'ON TRACK';
      headline = 'Optimal Lean Bulk & Hypertrophy Day';
      summary = `Outstanding execution today! You fueled your muscle protein synthesis with ${Math.round(proConsumed)}g of vegetarian protein and hit ${Math.round(calConsumed)} kcal (surplus target: ${calTarget} kcal). With a high readiness of ${readinessScore}%, your ${workoutSession.title} session (${workoutSession.completedSets} sets, ${Math.round(workoutSession.totalVolumeKg)} kg volume) provided optimal hypertrophic stimulus.`;
      actionItems.push('Log tonight’s sleep to ensure central nervous system recovery.');
      actionItems.push('Keep hydration above 2.0L to assist muscle fullness.');
    } else {
      status = 'ON TRACK';
      headline = 'Quality Recovery & Anabolic Fuelling';
      summary = `Great nutritional discipline on a non-lifting day. You achieved ${Math.round(proConsumed)}g of protein (target: ${proMin}g) and ${Math.round(calConsumed)} kcal. Maintaining surplus calories on rest days is the cornerstone of lean tissue accretion without excessive fat accumulation.`;
      actionItems.push('Prepare for tomorrow’s lifting split by getting 7.5+ hours of sleep.');
      actionItems.push('Review tomorrow’s starting exercise progression target.');
    }
  } else if (!proHit && calConsumed > 0) {
    status = 'ATTENTION';
    headline = 'Protein Target Shortfall';
    const shortage = Math.round(proMin - proConsumed);
    summary = `Your overall calorie intake was on track (${Math.round(calConsumed)} kcal), but you finished ${shortage}g shy of your minimum ${proMin}g protein target (${Math.round(proConsumed)}g logged). In a lean bulk, consistent leucine and essential amino acid availability determines whether surplus calories become muscle or adipose tissue.`;
    actionItems.push(`Incorporate a high-protein snack tomorrow (Greek yogurt, edamame, or paneer) to clear +${shortage}g.`);
    actionItems.push('Hydrate with 2.5L water to support digestion.');
  } else if (calConsumed > 0 && calConsumed < calTarget * 0.8) {
    status = 'ATTENTION';
    headline = 'Calorie Deficit Alert';
    summary = `You consumed ${Math.round(calConsumed)} kcal today, which is significantly below your lean bulk baseline of ${calTarget} kcal. Jay, muscle tissue accretion requires an energy surplus; continuous undereating will halt progressive overload in the gym.`;
    actionItems.push('Add an energy-dense vegetarian meal tomorrow (e.g. peanut butter, almonds, or lentil pasta).');
    actionItems.push('Focus on finishing all planned meals on schedule.');
  } else {
    // Blank or starting day
    status = 'ON TRACK';
    headline = 'Day Underway';
    summary = `Your morning readiness is ${readinessScore}% (${isHighReadiness ? 'Optimal' : 'Moderate'}). Fuel up steadily throughout the day with your planned ${calTarget} kcal and ${proMin}g protein targets.`;
    actionItems.push('Aim for 120g protein distributed across 3–4 meals.');
    actionItems.push('Complete your scheduled training session.');
  }

  // Factor in subjective notes if available
  if (params.eveningNotes) {
    const analysis = extractSentimentAndThemes(params.eveningNotes);
    if (analysis.sentiment === 'fatigued' || analysis.sentiment === 'stressed') {
      actionItems.push('Wind down 30 minutes before sleep with screen-free relaxation.');
    }
  }

  return {
    date: dailyLog.date,
    status,
    headline,
    summary,
    actionItems,
    readinessScore,
    isEstimated: true,
  };
}
