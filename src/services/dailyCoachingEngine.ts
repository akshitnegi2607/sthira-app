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
import { getEkadashiStatus } from './ekadashiService';

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
    id: 'sugg_paneer_tikka_roll',
    name: 'Smoky Paneer Tikka Kathi Roll with Greek Yogurt Chutney',
    cuisine: 'Indian',
    calories: 460,
    protein: 32.0,
    carbs: 48.0,
    fat: 15.5,
    portion: '140g Paneer + whole wheat paratha + mint yogurt chutney',
    matchReason: 'Rich bioavailable leucine and slow-digesting casein for clean muscle growth.',
  },
  {
    id: 'sugg_soya_keema',
    name: 'Soya Keema Matar with Bajra Millet Roti',
    cuisine: 'Indian',
    calories: 470,
    protein: 36.5,
    carbs: 58.0,
    fat: 9.0,
    portion: '50g dry soya granules + 2 bajra rotis + green peas',
    matchReason: 'Ultra-dense plant protein (>50% protein by weight) with gut-friendly millet carbs.',
  },
  {
    id: 'sugg_chipotle_paneer_bowl',
    name: 'Chipotle Grilled Paneer & Black Bean Burrito Bowl',
    cuisine: 'Mexican',
    calories: 485,
    protein: 34.0,
    carbs: 56.0,
    fat: 16.0,
    portion: '130g Paneer + 1 cup black beans + brown rice + guacamole',
    matchReason: 'Optimal hypertrophy fuel pairing slow-release carbs with complete dairy and legume amino acids.',
  },
  {
    id: 'sugg_tofu_poke_bowl',
    name: 'Air-Fried Sesame Tofu & Edamame Poke Bowl with Quinoa',
    cuisine: 'Asian',
    calories: 465,
    protein: 36.5,
    carbs: 50.0,
    fat: 14.0,
    portion: '150g firm tofu + 1/2 cup edamame + warm quinoa + nori',
    matchReason: 'Complete amino acid profile with clean micronutrient-rich complex carbohydrates.',
  },
  {
    id: 'sugg_red_lentil_pesto_pasta',
    name: 'High-Protein Red Lentil Penne with Basil Pesto & Burrata',
    cuisine: 'Italian',
    calories: 490,
    protein: 36.0,
    carbs: 52.0,
    fat: 16.5,
    portion: '80g dry red lentil penne + 60g burrata + basil pesto',
    matchReason: 'Naturally protein-dense legume pasta paired with healthy fats and Italian herbs.',
  },
  {
    id: 'sugg_zaatar_paneer_shawarma',
    name: "Za'atar Spiced Paneer & Chickpea Shawarma Bowl",
    cuisine: 'Middle Eastern',
    calories: 485,
    protein: 34.0,
    carbs: 52.0,
    fat: 17.0,
    portion: '130g paneer + 3/4 cup chickpeas + turmeric rice + tahini',
    matchReason: 'Satisfying warm Middle Eastern spices with anti-inflammatory turmeric and healthy fats.',
  },
  {
    id: 'sugg_tempeh_thai_curry',
    name: 'Thai Red Curry with Crispy Tempeh, Baby Corn & Jasmine Rice',
    cuisine: 'Asian',
    calories: 480,
    protein: 32.0,
    carbs: 54.0,
    fat: 16.5,
    portion: '130g fermented tempeh + light coconut curry + jasmine rice',
    matchReason: 'Probiotic-fermented whole soy tempeh supporting gut absorption and recovery.',
  },
  {
    id: 'sugg_med_power_mezze',
    name: 'Mediterranean Protein Mezze: Roasted Chickpeas & Whipped Feta',
    cuisine: 'Mediterranean',
    calories: 460,
    protein: 28.0,
    carbs: 52.0,
    fat: 17.0,
    portion: '1.25 cups roasted chickpeas + whipped feta yogurt + pita',
    matchReason: 'Heart-healthy polyphenol olive oil combined with prebiotic fiber and dairy protein.',
  },
  {
    id: 'sugg_paneer_bhurji',
    name: 'Low-Fat Paneer Bhurji with 2 Rotis',
    cuisine: 'Indian',
    calories: 440,
    protein: 28.5,
    carbs: 45.0,
    fat: 15.0,
    portion: '130g Paneer + 2 whole wheat rotis',
    matchReason: 'Quick high-protein Indian staple that digests smoothly pre-workout or post-workout.',
  },
  {
    id: 'sugg_soba_satay',
    name: 'Buckwheat Soba Noodles with Edamame & Peanut Satay',
    cuisine: 'Asian',
    calories: 450,
    protein: 29.0,
    carbs: 58.0,
    fat: 13.0,
    portion: '70g soba noodles + 3/4 cup edamame + ginger peanut sauce',
    matchReason: 'Low-glycemic buckwheat noodles to replenish glycogen stores without energy spikes.',
  },
  {
    id: 'sugg_protein_smoothie',
    name: 'Double Scoop Plant/Whey Shake with Soy Milk & Banana',
    cuisine: 'Modern',
    calories: 330,
    protein: 36.0,
    carbs: 24.0,
    fat: 6.0,
    portion: '1.5 scoops protein powder + 250ml soy milk + 1 banana',
    matchReason: 'Fast-absorbing post-workout or afternoon protein burst.',
  },
  {
    id: 'sugg_greek_yogurt_bowl',
    name: 'Probiotic Greek Yogurt with Chia Seeds, Walnuts & Honey',
    cuisine: 'Mediterranean',
    calories: 240,
    protein: 21.0,
    carbs: 16.0,
    fat: 9.5,
    portion: '180g plain Greek yogurt + 1 tbsp chia + 10g crushed walnuts',
    matchReason: 'Slow-digesting dairy casein paired with brain-boosting omega-3 fats.',
  },
  {
    id: 'sugg_crispy_tofu_tacos',
    name: 'Crispy Seasoned Tofu & Black Bean Street Tacos',
    cuisine: 'Mexican',
    calories: 420,
    protein: 27.5,
    carbs: 48.0,
    fat: 13.0,
    portion: '150g crispy firm tofu + 1/2 cup black beans + 2 corn tortillas',
    matchReason: 'Crisp texture with plant iron, folate, and calcium from mineral-set tofu.',
  },
  {
    id: 'sugg_roasted_chana',
    name: 'Roasted Chana & Salted Almonds Power Snack',
    cuisine: 'Indian',
    calories: 210,
    protein: 14.5,
    carbs: 24.0,
    fat: 6.5,
    portion: '45g roasted chana + 12 almonds',
    matchReason: 'Zero preparation, crunchy, shelf-stable desk snack with high dietary fiber.',
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

  // Ekadashi Awareness Integration
  try {
    const ekadashi = getEkadashiStatus(todayLog.date);
    if (ekadashi.isToday && ekadashi.todayEvent) {
      statusBadge = 'ON TRACK';
      statusBadgeLabel = 'EKADASHI FAST';
      headline = `Today is ${ekadashi.todayEvent.name} • Sacred Fast`;
      motivationalNarrative = `Today is ${ekadashi.todayEvent.name}. Your calorie surplus targets and heavy gym lifting are paused for spiritual observance and digestive rest. Prioritize clean hydration, fresh fruits (phalahar), coconut water, and gentle mobility.`;
      actionChecklist.length = 0;
      actionChecklist.push('Hydrate generously with tender coconut water & lemon water');
      actionChecklist.push('Satvik phalahar: fresh fruits, roasted makhana, or boiled sweet potato');
      actionChecklist.push('Skip heavy compound lifting; practice gentle yoga & meditation');
    } else if (ekadashi.isTomorrow && ekadashi.tomorrowEvent) {
      actionChecklist.unshift(`Tomorrow is ${ekadashi.tomorrowEvent.name} (Ekadashi Fast). Plan your meals & training accordingly.`);
    }
  } catch {}

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
