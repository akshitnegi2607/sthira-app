/**
 * Sthira — Dynamic Daily Coaching & Action Guidance Engine
 * Analyzes yesterday's performance, identifies key improvement areas,
 * tracks intra-day progress in real time (morning, afternoon, evening, night),
 * and recommends tailored vegetarian meals to close calorie & protein targets.
 */

import { DailyLog, Goals, UserProfile, WorkoutSession } from '../types/database';
import { getTodayDateString, shiftDateString } from '../utils/date';
import { DailyLogsRepository } from '../database/repositories/dailyLogsRepository';
import { MealRepository } from '../database/repositories/mealRepository';
import { WorkoutRepository } from '../database/repositories/workoutRepository';

export interface MealSuggestion {
  id: string;
  name: string;
  cuisine: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion: string;
  matchReason: string;
}

export interface DynamicDailyCoachGuidance {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  headline: string;
  statusBadge: 'ON TRACK' | 'ATTENTION' | 'PENDING' | 'NEEDS ACTION';
  statusBadgeLabel: string;
  yesterdayReview: {
    summary: string;
    improvementArea: string;
    isPositive: boolean;
    workoutDone?: string;
    caloriesHit?: number;
    proteinHit?: number;
    sleepHours?: number;
  } | null;
  todayProgress: {
    caloriesRemaining: number;
    proteinRemaining: number;
    waterRemaining: number;
    caloriesTarget: number;
    proteinTarget: number;
    waterTarget: number;
    caloriesConsumed: number;
    proteinConsumed: number;
    waterLiters: number;
    mealsLoggedCount: number;
    proteinPct: number;
    caloriesPct: number;
  };
  motivationalNarrative: string;
  actionChecklist: string[];
  suggestedMeals: MealSuggestion[];
}

// Curated authentic vegetarian options compliant with Jay's profile (No Eggs, No Mushrooms)
const VEGETARIAN_RECOMMENDATIONS_CATALOG: MealSuggestion[] = [
  {
    id: 'sugg_paneer_bhurji',
    name: 'Low-Fat Paneer Bhurji with 2 Rotis',
    cuisine: 'Indian',
    calories: 420,
    protein: 34.0,
    carbs: 42.0,
    fat: 14.0,
    portion: '150g Paneer + 2 whole wheat rotis',
    matchReason: 'Rich casein & leucine source to drive muscle protein synthesis.',
  },
  {
    id: 'sugg_tofu_soba',
    name: 'Pan-Seared Firm Tofu & Edamame Soba',
    cuisine: 'Asian',
    calories: 440,
    protein: 33.0,
    carbs: 52.0,
    fat: 12.0,
    portion: '150g Firm Tofu + 1/2 cup Edamame + 1 cup Soba',
    matchReason: 'Complete amino acid profile with clean complex carbohydrates.',
  },
  {
    id: 'sugg_soya_curry',
    name: 'Soya Chunks Curry with Basmati Rice',
    cuisine: 'Indian',
    calories: 460,
    protein: 38.0,
    carbs: 56.0,
    fat: 8.0,
    portion: '80g dry Soya Chunks + 1 cup Cooked Basmati Rice',
    matchReason: 'Maximum vegetarian protein density (over 50% protein by dry weight).',
  },
  {
    id: 'sugg_protein_smoothie',
    name: 'Double Scoop Plant/Whey Shake with Soy Milk',
    cuisine: 'Modern',
    calories: 330,
    protein: 36.0,
    carbs: 24.0,
    fat: 6.0,
    portion: '1.5 scoops protein powder + 250ml soy milk + 1 banana',
    matchReason: 'Fast-absorbing post-workout or afternoon protein burst.',
  },
  {
    id: 'sugg_moong_chilla',
    name: 'Moong Dal Chilla with Grated Paneer',
    cuisine: 'Indian',
    calories: 290,
    protein: 21.0,
    carbs: 32.0,
    fat: 8.5,
    portion: '2 medium chillas + 50g grated paneer filling',
    matchReason: 'Light, nutrient-dense meal with zero sugar and high satiety.',
  },
  {
    id: 'sugg_greek_yogurt_bowl',
    name: 'Greek Yogurt with Chia Seeds & Almonds',
    cuisine: 'Mediterranean',
    calories: 230,
    protein: 19.0,
    carbs: 14.0,
    fat: 9.0,
    portion: '170g plain Greek yogurt + 1 tbsp chia + 10 almonds',
    matchReason: 'Slow-digesting dairy proteins perfect for evening recovery.',
  },
  {
    id: 'sugg_falafel_hummus',
    name: 'Baked Falafels with Hummus & Whole Pita',
    cuisine: 'Middle Eastern',
    calories: 380,
    protein: 20.0,
    carbs: 48.0,
    fat: 11.0,
    portion: '3 baked falafels + 2 tbsp hummus + 1 whole wheat pita',
    matchReason: 'Wholesome legume proteins combined with healthy olive oil fats.',
  },
  {
    id: 'sugg_sprouted_moong',
    name: 'Sprouted Moong & Peanut Chaat',
    cuisine: 'Indian',
    calories: 220,
    protein: 16.0,
    carbs: 28.0,
    fat: 5.5,
    portion: '1.5 cups sprouted moong + chopped tomato, cucumber & lemon',
    matchReason: 'Living bioavailable enzymes, dietary fiber, and clean plant protein.',
  },
  {
    id: 'sugg_roasted_chana',
    name: 'Roasted Chana & Salted Almonds Snack',
    cuisine: 'Indian',
    calories: 190,
    protein: 13.0,
    carbs: 22.0,
    fat: 6.0,
    portion: '40g roasted chana + 10g almonds',
    matchReason: 'Quick crunchy desk snack with zero preparation needed.',
  },
  {
    id: 'sugg_turmeric_milk',
    name: 'Warm Golden Turmeric Milk with Crushed Nuts',
    cuisine: 'Indian',
    calories: 170,
    protein: 9.0,
    carbs: 15.0,
    fat: 7.5,
    portion: '250ml warm milk + pinch of turmeric & black pepper + 8 almonds',
    matchReason: 'Anti-inflammatory curcumin paired with calming bedtime casein.',
  },
];

/**
 * Determines current time of day bracket
 */
export function getTimeOfDayBracket(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * Analyzes yesterday's performance and extracts high-impact improvement areas.
 */
function analyzeYesterday(
  yesterdayLog: DailyLog | null,
  goals: Goals,
  yesterdaySession: WorkoutSession | null
): {
  summary: string;
  improvementArea: string;
  isPositive: boolean;
  workoutDone?: string;
  caloriesHit?: number;
  proteinHit?: number;
  sleepHours?: number;
} | null {
  if (!yesterdayLog) return null;

  const calHit = yesterdayLog.calories_consumed || 0;
  const proHit = yesterdayLog.protein_consumed || 0;
  const sleep = yesterdayLog.sleep_hours;
  const workoutTitle = yesterdaySession?.title;

  const hasLoggedNutrition = calHit > 0;
  const calTarget = goals.calories_target || 2450;
  const proTarget = goals.protein_target_max || 120;

  // Case 1: Yesterday had no logged data
  if (!hasLoggedNutrition && !yesterdaySession) {
    return {
      summary: 'No activity was recorded yesterday.',
      improvementArea: 'Log your weigh-in and first meal today to regain daily tracking momentum.',
      isPositive: false,
    };
  }

  // Case 2: Under-hit protein by >= 15g
  if (hasLoggedNutrition && proHit < proTarget - 15) {
    const deficit = Math.round(proTarget - proHit);
    return {
      summary: `Yesterday protein reached ${proHit}g (${deficit}g below your ${proTarget}g target).`,
      improvementArea: `Front-load protein today: target 35g+ per meal (paneer, tofu, or protein shake) so you don't play catch-up in the evening.`,
      isPositive: false,
      caloriesHit: calHit,
      proteinHit: proHit,
      sleepHours: sleep ?? undefined,
      workoutDone: workoutTitle,
    };
  }

  // Case 3: Under-hit calories by >= 300 kcal (stalling lean bulk surplus)
  if (hasLoggedNutrition && calHit < calTarget - 300) {
    const deficit = Math.round(calTarget - calHit);
    return {
      summary: `Yesterday's intake was ${calHit.toLocaleString()} kcal (${deficit} kcal below lean bulk target).`,
      improvementArea: `Muscle gain requires a consistent energy surplus. Add an extra calorie-dense snack (almonds, peanut butter toast, or smoothie) today.`,
      isPositive: false,
      caloriesHit: calHit,
      proteinHit: proHit,
      sleepHours: sleep ?? undefined,
      workoutDone: workoutTitle,
    };
  }

  // Case 4: Short sleep (< 7h)
  if (sleep !== null && sleep !== undefined && sleep < 7.0 && sleep > 0) {
    return {
      summary: `Yesterday's sleep was recorded at ${sleep.toFixed(1)} hours (target: 7.5–8.0h).`,
      improvementArea: `Sub-optimal sleep elevates joint fatigue and blunts muscle protein synthesis. Emphasize 2.5L hydration today and aim for an earlier bedtime.`,
      isPositive: false,
      caloriesHit: calHit,
      proteinHit: proHit,
      sleepHours: sleep,
      workoutDone: workoutTitle,
    };
  }

  // Case 5: Completed workout + solid nutrition
  if (yesterdaySession && hasLoggedNutrition && proHit >= proTarget - 10) {
    return {
      summary: `Excellent execution yesterday: ${yesterdaySession.title} completed, ${calHit.toLocaleString()} kcal and ${proHit}g protein logged.`,
      improvementArea: `Carry this momentum into today's schedule. Keep nutrition steady to fuel muscle recovery.`,
      isPositive: true,
      caloriesHit: calHit,
      proteinHit: proHit,
      sleepHours: sleep ?? undefined,
      workoutDone: workoutTitle,
    };
  }

  // Default balanced summary
  return {
    summary: `Yesterday logged ${calHit.toLocaleString()} kcal and ${proHit}g vegetarian protein.`,
    improvementArea: `Stay consistent with today's meals, hydration, and recovery routine.`,
    isPositive: true,
    caloriesHit: calHit,
    proteinHit: proHit,
    sleepHours: sleep ?? undefined,
    workoutDone: workoutTitle,
  };
}

/**
 * Selects tailored meal suggestions from the catalog based on remaining macros.
 */
function selectMealSuggestions(
  proteinRemaining: number,
  caloriesRemaining: number
): MealSuggestion[] {
  if (proteinRemaining <= 0 && caloriesRemaining <= 100) {
    return [];
  }

  let candidates: MealSuggestion[] = [];

  if (proteinRemaining >= 30) {
    // Need heavy protein hitters (30–40g)
    candidates = VEGETARIAN_RECOMMENDATIONS_CATALOG.filter((m) => m.protein >= 30);
  } else if (proteinRemaining >= 15) {
    // Need moderate protein options (15–25g)
    candidates = VEGETARIAN_RECOMMENDATIONS_CATALOG.filter((m) => m.protein >= 15 && m.protein < 30);
  } else {
    // Need lighter snacks (< 15g protein)
    candidates = VEGETARIAN_RECOMMENDATIONS_CATALOG.filter((m) => m.protein < 16);
  }

  if (candidates.length === 0) {
    candidates = VEGETARIAN_RECOMMENDATIONS_CATALOG.slice(0, 3);
  }

  return candidates.slice(0, 3);
}

/**
 * Core Dynamic Coach Generator
 */
export function generateDynamicDailyCoachGuidance(params: {
  todayLog: DailyLog;
  yesterdayLog: DailyLog | null;
  yesterdaySession: WorkoutSession | null;
  goals: Goals;
  profile: UserProfile;
  todayPlanTitle?: string;
  isTodayWorkoutCompleted?: boolean;
  mealsLoggedCount?: number;
}): DynamicDailyCoachGuidance {
  const {
    todayLog,
    yesterdayLog,
    yesterdaySession,
    goals,
    todayPlanTitle = 'Training',
    isTodayWorkoutCompleted = false,
    mealsLoggedCount = 0,
  } = params;

  const timeOfDay = getTimeOfDayBracket();

  const calTarget = goals.calories_target || 2450;
  const proTarget = goals.protein_target_max || 120;
  const waterTarget = goals.water_target_liters || 2.5;

  const calConsumed = todayLog.calories_consumed || 0;
  const proConsumed = todayLog.protein_consumed || 0;
  const waterLiters = todayLog.water_liters || 0;

  const caloriesRemaining = Math.max(0, calTarget - calConsumed);
  const proteinRemaining = Math.max(0, Math.round((proTarget - proConsumed) * 10) / 10);
  const waterRemaining = Math.max(0, Math.round((waterTarget - waterLiters) * 10) / 10);

  const proteinPct = Math.min(100, Math.round((proConsumed / proTarget) * 100));
  const caloriesPct = Math.min(100, Math.round((calConsumed / calTarget) * 100));

  const yesterdayReview = analyzeYesterday(yesterdayLog, goals, yesterdaySession);

  // Status Badge Logic
  let statusBadge: 'ON TRACK' | 'ATTENTION' | 'PENDING' | 'NEEDS ACTION' = 'ON TRACK';
  let statusBadgeLabel = 'ON TRACK';

  if (calConsumed === 0 && proConsumed === 0) {
    statusBadge = 'PENDING';
    statusBadgeLabel = 'READY TO LOG';
  } else if (proteinRemaining > 0 && (timeOfDay === 'evening' || timeOfDay === 'night')) {
    if (proteinRemaining > 30) {
      statusBadge = 'NEEDS ACTION';
      statusBadgeLabel = `NEED ${Math.round(proteinRemaining)}G PROTEIN`;
    } else {
      statusBadge = 'ATTENTION';
      statusBadgeLabel = `NEED ${Math.round(proteinRemaining)}G PROTEIN`;
    }
  } else if (proteinRemaining === 0 && caloriesRemaining === 0) {
    statusBadge = 'ON TRACK';
    statusBadgeLabel = 'TARGETS CRUSHED ✓';
  } else {
    statusBadge = 'ON TRACK';
    statusBadgeLabel = 'ON TRACK';
  }

  // Dynamic Headline and Narrative based on Time of Day & Current Progress
  let headline = '';
  let motivationalNarrative = '';
  const actionChecklist: string[] = [];

  if (timeOfDay === 'morning') {
    headline = 'Morning Strategy • Set Today’s Trajectory';
    if (mealsLoggedCount === 0) {
      motivationalNarrative = `Good morning Jay! Today is a clean slate. Front-load 30–35g of vegetarian protein at breakfast to switch on muscle protein synthesis early and protect lean tissue.`;
      actionChecklist.push('Log your morning weight on an empty stomach');
      actionChecklist.push('Kickstart with 30g+ protein at breakfast');
      actionChecklist.push('Hydrate with 500ml of water');
    } else {
      motivationalNarrative = `Great start! Breakfast is logged with ${proConsumed}g protein. You have ${caloriesRemaining.toLocaleString()} kcal and ${proteinRemaining}g protein remaining across lunch, dinner, and snacks.`;
      actionChecklist.push('Keep a water bottle near your desk (reach 1.2L by lunch)');
      actionChecklist.push(`Prep lunch to include ~35g protein`);
    }
  } else if (timeOfDay === 'afternoon') {
    headline = 'Mid-Day Fuel Check • Keep The Momentum';
    if (proConsumed < proTarget * 0.4) {
      motivationalNarrative = `Mid-day check: You're at ${proConsumed}g protein (${proteinPct}% of target). To stay on course for your 67kg lean bulk, make your afternoon meal or snack count with a solid protein source.`;
      actionChecklist.push(`Target 35–40g protein during lunch/snack refueling`);
    } else {
      motivationalNarrative = `Strong halfway pacing! You've secured ${proConsumed}g protein (${proteinPct}%). With ${proteinRemaining}g protein and ${caloriesRemaining.toLocaleString()} kcal remaining, dinner will comfortably close the gap.`;
      actionChecklist.push(`Stay hydrated: ${waterRemaining.toFixed(1)}L water remaining to hit target`);
    }
    if (!isTodayWorkoutCompleted && !todayPlanTitle.toLowerCase().includes('rest')) {
      actionChecklist.push(`Hydrate and fuel up 60–90m before today's ${todayPlanTitle}`);
    }
  } else if (timeOfDay === 'evening') {
    headline = 'Evening Push • Lock In Today’s Surplus';
    if (proteinRemaining > 25) {
      motivationalNarrative = `Evening push: You have ${proteinRemaining}g protein remaining to hit your 120g goal. A dinner featuring paneer, tofu, or soy chunks will close this gap completely before bed.`;
      actionChecklist.push(`Prioritize a high-protein dinner (~30g protein)`);
    } else if (proteinRemaining > 0) {
      motivationalNarrative = `Almost there! You only need ${proteinRemaining}g more protein to hit today's target. A bowl of Greek yogurt or a cup of warm milk will easily seal today's goal.`;
      actionChecklist.push(`Add a light protein snack to finish today 100% on target`);
    } else {
      motivationalNarrative = `Protein target achieved (${proConsumed}g)! You're in a clean lean bulk surplus. Let dinner focus on wholesome complex carbs and proper joint recovery.`;
      actionChecklist.push('Begin evening wind-down');
    }
    if (!isTodayWorkoutCompleted && !todayPlanTitle.toLowerCase().includes('rest')) {
      actionChecklist.push(`Complete today's ${todayPlanTitle} session`);
    }
  } else {
    // Night
    headline = 'Night Wrap-Up • Rest & Muscle Growth';
    if (proteinRemaining === 0 && caloriesRemaining <= 150) {
      motivationalNarrative = `Exceptional discipline today Jay! You logged ${calConsumed.toLocaleString()} kcal and ${proConsumed}g protein. Muscle protein synthesis is primed — aim for 7.5–8.0 hours of deep sleep to maximize muscle tissue repair.`;
      actionChecklist.push('Dim screens and wind down for restorative recovery');
    } else if (proteinRemaining > 15) {
      motivationalNarrative = `You reached ${proConsumed}g protein today (${proteinRemaining}g shy of target). If hungry before sleeping, a scoop of protein or warm milk will support overnight muscle repair.`;
      actionChecklist.push('Optional light bedtime protein to support overnight MPS');
      actionChecklist.push('Aim for 8 hours of sleep');
    } else {
      motivationalNarrative = `Solid effort today. You hit ${calConsumed.toLocaleString()} kcal and ${proConsumed}g protein. Rest up for tomorrow's split!`;
      actionChecklist.push('Rest up for tomorrow');
    }
  }

  // Tailored Meal Suggestions
  const suggestedMeals = selectMealSuggestions(proteinRemaining, caloriesRemaining);

  return {
    timeOfDay,
    headline,
    statusBadge,
    statusBadgeLabel,
    yesterdayReview,
    todayProgress: {
      caloriesRemaining,
      proteinRemaining,
      waterRemaining,
      caloriesTarget: calTarget,
      proteinTarget: proTarget,
      waterTarget,
      caloriesConsumed: calConsumed,
      proteinConsumed: proConsumed,
      waterLiters,
      mealsLoggedCount,
      proteinPct,
      caloriesPct,
    },
    motivationalNarrative,
    actionChecklist,
    suggestedMeals,
  };
}
