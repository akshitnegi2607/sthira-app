/**
 * Sthira — Calendar & Day Snapshot Service
 * High-performance aggregator compiling:
 * 1. Month-level activity dot indicators (Workout, Nutrition, Journal, Ekadashi)
 * 2. Day-level deep snapshot (Exercises & exact sets/weights, Meals & macros, Journal reflections)
 */

import { getDatabase } from '@/database/db';
import { DailyLogsRepository } from '@/database/repositories/dailyLogsRepository';
import { WorkoutRepository, PopulatedSession } from '@/database/repositories/workoutRepository';
import { MealRepository, MealEntryWithEstimates } from '@/database/repositories/mealRepository';
import { JournalRepository } from '@/database/repositories/journalRepository';
import { ProfileRepository } from '@/database/repositories/profileRepository';
import { EKADASHI_CALENDAR, EkadashiEvent } from '@/services/ekadashiService';
import { DailyLog, JournalEntry, AIRecommendation, Goals } from '@/types/database';
import { getTodayDateString, formatDateLabel } from '@/utils/date';

export interface DayOverview {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  dayOfWeek: number; // 0 = Sun, 1 = Mon ... 6 = Sat
  isCurrentMonth: boolean;
  hasWorkout: boolean;
  workoutTitle?: string;
  workoutVolumeKg?: number;
  hasNutrition: boolean;
  calories?: number;
  protein?: number;
  hasJournal: boolean;
  readinessScore?: number | null;
  isEkadashi: boolean;
  ekadashiName?: string;
  isToday: boolean;
  isSelected: boolean;
}

export interface DaySnapshot {
  date: string;
  formattedDate: string;
  dayOfWeekName: string;
  isToday: boolean;
  scaleWeightKg: number | null;
  ekadashiEvent: EkadashiEvent | null;

  // Goals
  goals: Goals | null;

  // 1. Workout
  workout: {
    hasWorkout: boolean;
    sessions: PopulatedSession[];
    totalVolumeKg: number;
    completedSetsCount: number;
    primaryTitle: string;
    difficultyPerceived?: string | null;
    durationMinutes: number;
  };

  // 2. Nutrition
  nutrition: {
    hasNutrition: boolean;
    caloriesConsumed: number;
    proteinConsumed: number;
    carbsConsumed: number;
    fatConsumed: number;
    waterLiters: number;
    calorieTarget: number;
    proteinTarget: number;
    meals: MealEntryWithEstimates[];
  };

  // 3. Journal & Recovery
  journal: {
    hasJournal: boolean;
    readinessScore: number | null;
    sleepHours: number | null;
    energyRating: number | null;
    sorenessRating: number | null;
    moodRating: number | null;
    stressRating: number | null;
    hungerRating: number | null;
    morningEntry: JournalEntry | null;
    eveningEntry: JournalEntry | null;
    aiReview: AIRecommendation | null;
    sentimentTags: string[];
  };
}

export const CalendarHistoryService = {
  /**
   * Generates calendar days for a specific year and month with dot indicators.
   * Uses Monday as the first day of the week.
   */
  getMonthOverview(year: number, month: number, selectedDate: string): DayOverview[] {
    const db = getDatabase();
    const todayStr = getTodayDateString();
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    const prefix = `${year}-${monthStr}`;

    // 1. Fetch all logged rows for this month in fast batch queries
    const dailyLogs = db.getAllSync<DailyLog>(
      'SELECT * FROM DailyLogs WHERE date LIKE ?',
      [`${prefix}-%`]
    );
    const dailyLogsMap = new Map<string, DailyLog>(dailyLogs.map((l) => [l.date, l]));

    const sessions = db.getAllSync<{
      id: string;
      date: string;
      title: string;
      status: string;
      duration_seconds: number;
    }>(
      "SELECT id, date, title, status, duration_seconds FROM WorkoutSessions WHERE date LIKE ? AND status = 'completed'",
      [`${prefix}-%`]
    );
    const sessionsMap = new Map<string, { title: string; duration: number }>();
    sessions.forEach((s) => {
      sessionsMap.set(s.date, { title: s.title, duration: Math.floor((s.duration_seconds || 0) / 60) });
    });

    const mealDates = new Set<string>();
    const meals = db.getAllSync<{ date: string }>(
      'SELECT DISTINCT date FROM MealEntries WHERE date LIKE ?',
      [`${prefix}-%`]
    );
    meals.forEach((m) => mealDates.add(m.date));

    const journalDates = new Set<string>();
    const journals = db.getAllSync<{ date: string }>(
      'SELECT DISTINCT date FROM JournalEntries WHERE date LIKE ?',
      [`${prefix}-%`]
    );
    journals.forEach((j) => journalDates.add(j.date));

    // Ekadashi calendar index
    const ekadashiMap = new Map<string, EkadashiEvent>();
    EKADASHI_CALENDAR.forEach((e) => {
      if (e.date.startsWith(prefix)) {
        ekadashiMap.set(e.date, e);
      }
    });

    // 2. Compute calendar grid: days in month & leading empty padding days (Monday-first)
    // Date constructor: month is 0-indexed (0=Jan, 11=Dec)
    const firstDayDate = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();

    // In JS: 0=Sun, 1=Mon, ..., 6=Sat
    // For Monday-first: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
    const firstDayIndex = (firstDayDate.getDay() + 6) % 7;

    const result: DayOverview[] = [];

    // Leading padding days from previous month
    const prevMonthDays = new Date(year, month - 1, 0).getDate();
    for (let i = 0; i < firstDayIndex; i++) {
      const prevDayNum = prevMonthDays - firstDayIndex + 1 + i;
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const prevMonthStr = prevMonth < 10 ? `0${prevMonth}` : `${prevMonth}`;
      const prevDayStr = prevDayNum < 10 ? `0${prevDayNum}` : `${prevDayNum}`;
      const dStr = `${prevYear}-${prevMonthStr}-${prevDayStr}`;

      result.push({
        date: dStr,
        dayNumber: prevDayNum,
        dayOfWeek: i,
        isCurrentMonth: false,
        hasWorkout: false,
        hasNutrition: false,
        hasJournal: false,
        isEkadashi: false,
        isToday: dStr === todayStr,
        isSelected: dStr === selectedDate,
      });
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const dateStr = `${prefix}-${dayStr}`;
      const dayOfWeek = (firstDayIndex + (day - 1)) % 7;

      const log = dailyLogsMap.get(dateStr);
      const session = sessionsMap.get(dateStr);
      const ekadashi = ekadashiMap.get(dateStr);

      const hasWorkout = !!session;
      const hasNutrition = mealDates.has(dateStr) || (log !== undefined && (log.calories_consumed || 0) > 0);
      const hasJournal = journalDates.has(dateStr) || (log !== undefined && (log.sleep_hours !== null || log.energy_rating !== null));

      result.push({
        date: dateStr,
        dayNumber: day,
        dayOfWeek,
        isCurrentMonth: true,
        hasWorkout,
        workoutTitle: session?.title,
        hasNutrition,
        calories: log?.calories_consumed,
        protein: log?.protein_consumed,
        hasJournal,
        readinessScore: log?.energy_rating ? log.energy_rating * 10 : null,
        isEkadashi: !!ekadashi,
        ekadashiName: ekadashi?.name,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
      });
    }

    // Trailing padding days to fill 35 or 42 grid cells
    const totalCells = result.length > 35 ? 42 : 35;
    const remaining = totalCells - result.length;
    for (let i = 1; i <= remaining; i++) {
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      const nextMonthStr = nextMonth < 10 ? `0${nextMonth}` : `${nextMonth}`;
      const nextDayStr = i < 10 ? `0${i}` : `${i}`;
      const dStr = `${nextYear}-${nextMonthStr}-${nextDayStr}`;

      result.push({
        date: dStr,
        dayNumber: i,
        dayOfWeek: (result.length) % 7,
        isCurrentMonth: false,
        hasWorkout: false,
        hasNutrition: false,
        hasJournal: false,
        isEkadashi: false,
        isToday: dStr === todayStr,
        isSelected: dStr === selectedDate,
      });
    }

    return result;
  },

  /**
   * Retrieves a comprehensive day snapshot including workout sets, nutrition meals,
   * hydration, scale weigh-in, and journal reflections.
   */
  getDaySnapshot(dateStr: string): DaySnapshot {
    const todayStr = getTodayDateString();
    const isToday = dateStr === todayStr;

    // Date naming
    const dateObj = new Date(`${dateStr}T12:00:00Z`);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeekName = dayNames[dateObj.getDay()] || 'Day';
    const formattedDate = formatDateLabel(dateStr);

    // Goals
    const goals = ProfileRepository.getGoals();
    const calorieTarget = goals?.calories_target || 2450;
    const proteinTarget = goals?.protein_target_min || 120;

    // 1. Daily Log
    const dailyLog = DailyLogsRepository.getLogByDate(dateStr);

    // Ekadashi check
    const ekadashiEvent = EKADASHI_CALENDAR.find((e) => e.date === dateStr) || null;

    // 2. Workout Sessions & Sets
    const sessions = WorkoutRepository.getSessionsForDate(dateStr);
    let totalVolumeKg = 0;
    let completedSetsCount = 0;
    let durationSeconds = 0;
    let primaryTitle = 'Rest Day';
    let difficulty: string | null = null;

    if (sessions.length > 0) {
      const first = sessions[0];
      primaryTitle = first.session.title;
      difficulty = first.session.difficulty_perceived ?? null;
      sessions.forEach((s) => {
        totalVolumeKg += s.totalVolumeKg;
        completedSetsCount += s.completedSetsCount;
        durationSeconds += s.session.duration_seconds || 0;
      });
    } else {
      // Determine split schedule name for that day of week if rest
      const dayNum = dateObj.getDay();
      const plans = WorkoutRepository.getAllPlans();
      const plan = plans.find((p) => p.day_of_week === dayNum);
      if (plan) {
        primaryTitle = plan.name;
      }
    }

    // 3. Nutrition & Meals
    const meals = MealRepository.getMealsByDate(dateStr);
    let calConsumed = dailyLog?.calories_consumed || 0;
    let protConsumed = dailyLog?.protein_consumed || 0;
    let carbsConsumed = dailyLog?.carbs_consumed || 0;
    let fatConsumed = dailyLog?.fat_consumed || 0;

    // If meals exist, sum them to ensure accurate macro consistency
    if (meals.length > 0) {
      const sumCal = meals.reduce((acc, m) => acc + (m.total_calories || 0), 0);
      const sumProt = meals.reduce((acc, m) => acc + (m.total_protein || 0), 0);
      const sumCarbs = meals.reduce((acc, m) => acc + (m.total_carbs || 0), 0);
      const sumFat = meals.reduce((acc, m) => acc + (m.total_fat || 0), 0);

      calConsumed = Math.max(calConsumed, Math.round(sumCal));
      protConsumed = Math.max(protConsumed, Math.round(sumProt * 10) / 10);
      carbsConsumed = Math.max(carbsConsumed, Math.round(sumCarbs * 10) / 10);
      fatConsumed = Math.max(fatConsumed, Math.round(sumFat * 10) / 10);
    }

    const waterLiters = dailyLog?.water_liters || 0;
    const hasNutrition = calConsumed > 0 || meals.length > 0;

    // 4. Journal Entries
    const journalEntries = JournalRepository.getJournalEntriesForDate(dateStr);
    const morningEntry = journalEntries.find((j) => j.entry_type === 'morning') || null;
    const eveningEntry = journalEntries.find((j) => j.entry_type === 'evening') || null;
    const aiReview = JournalRepository.getLatestAIRecommendation(dateStr);

    let sentimentTags: string[] = [];
    if (eveningEntry?.themes) {
      try {
        const parsed = JSON.parse(eveningEntry.themes);
        if (Array.isArray(parsed)) sentimentTags = parsed;
      } catch {
        sentimentTags = eveningEntry.themes.split(',').map((t) => t.trim());
      }
    }

    const hasJournal = morningEntry !== null || eveningEntry !== null || (dailyLog?.sleep_hours !== null && dailyLog?.sleep_hours !== undefined);

    let readinessScore: number | null = null;
    if (dailyLog?.energy_rating !== null && dailyLog?.energy_rating !== undefined) {
      readinessScore = Math.min(100, Math.round((dailyLog.energy_rating / 10) * 100));
    }

    return {
      date: dateStr,
      formattedDate,
      dayOfWeekName,
      isToday,
      scaleWeightKg: dailyLog?.weight ?? null,
      ekadashiEvent,
      goals,
      workout: {
        hasWorkout: sessions.length > 0,
        sessions,
        totalVolumeKg: Math.round(totalVolumeKg * 10) / 10,
        completedSetsCount,
        primaryTitle,
        difficultyPerceived: difficulty,
        durationMinutes: Math.floor(durationSeconds / 60),
      },
      nutrition: {
        hasNutrition,
        caloriesConsumed: calConsumed,
        proteinConsumed: protConsumed,
        carbsConsumed,
        fatConsumed,
        waterLiters,
        calorieTarget,
        proteinTarget,
        meals,
      },
      journal: {
        hasJournal,
        readinessScore,
        sleepHours: dailyLog?.sleep_hours ?? null,
        energyRating: dailyLog?.energy_rating ?? null,
        sorenessRating: dailyLog?.soreness_rating ?? null,
        moodRating: dailyLog?.recovery_rating ?? null,
        stressRating: dailyLog?.stress_rating ?? null,
        hungerRating: dailyLog?.hunger_rating ?? null,
        morningEntry,
        eveningEntry,
        aiReview,
        sentimentTags,
      },
    };
  },
};
