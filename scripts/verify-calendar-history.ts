/**
 * Sthira — Calendar & Day Snapshot Verification Script
 * Validates CalendarHistoryService, WorkoutRepository.getSessionsForDate, and useCalendarStore.
 */

import { CalendarHistoryService } from '../src/services/calendarHistoryService';
import { WorkoutRepository } from '../src/database/repositories/workoutRepository';
import { MealRepository } from '../src/database/repositories/mealRepository';
import { JournalRepository } from '../src/database/repositories/journalRepository';
import { DailyLogsRepository } from '../src/database/repositories/dailyLogsRepository';
import { useCalendarStore } from '../src/stores/useCalendarStore';
import { EKADASHI_CALENDAR } from '../src/services/ekadashiService';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: any) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${testName}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${testName}`, details || '');
  }
}

console.log('=== Running Sthira Calendar & History Verifications ===\n');

// 1. Ekadashi calendar data verification
console.log('1. Ekadashi Calendar Data:');
assert(EKADASHI_CALENDAR.length >= 24, 'Calendar contains >= 24 Ekadashi entries for 2026/2027');
const marchEkadashi = EKADASHI_CALENDAR.find((e) => e.date === '2026-03-15');
assert(!!marchEkadashi, 'Papmochani Ekadashi found on 2026-03-15');
const octEkadashi = EKADASHI_CALENDAR.find((e) => e.date === '2026-10-22');
assert(!!octEkadashi, 'Papankusha Ekadashi found on 2026-10-22');

// 2. CalendarHistoryService getMonthOverview
console.log('\n2. CalendarHistoryService.getMonthOverview:');
const days = CalendarHistoryService.getMonthOverview(2026, 10, '2026-10-15'); // 10 = October (1-indexed)
assert(Array.isArray(days), 'getMonthOverview returns DayOverview array');
assert(days.length >= 31, `Grid has all days + padding (got ${days.length})`);

const currentMonthDays = days.filter((d) => d.isCurrentMonth);
assert(currentMonthDays.length === 31, `October has 31 current-month days (got ${currentMonthDays.length})`);

const day15 = days.find((d) => d.date === '2026-10-15');
assert(!!day15 && day15.dayNumber === 15, 'October 15th mapped correctly in overview');
assert(day15?.isSelected === true, 'October 15th flagged as isSelected');

const ekadashiDay = days.find((d) => d.date === '2026-10-22');
assert(ekadashiDay?.isEkadashi === true, 'October 22nd has isEkadashi dot enabled');

// 3. Populate a mock day to verify snapshot compilation
console.log('\n3. CalendarHistoryService.getDaySnapshot with Data:');
const testDate = '2026-10-14';

// Ensure daily log exists with weight, sleep, hydration
DailyLogsRepository.getOrCreateLog(testDate);
DailyLogsRepository.updateDailyLog(testDate, {
  weight: 64.2,
  water_liters: 2.2,
  calories_consumed: 2380,
  protein_consumed: 119,
  carbs_consumed: 310,
  fat_consumed: 68,
  sleep_hours: 7.5,
  energy_rating: 8,
  mood_rating: 8,
  soreness_rating: 3,
});

// Save morning check-in
JournalRepository.saveMorningCheckIn({
  date: testDate,
  sleepHours: 7.5,
  energyRating: 8,
  moodRating: 8,
  sorenessRating: 3,
  notes: 'Woke up feeling recovered and energized.',
});

// Save evening reflection
JournalRepository.saveEveningReflection({
  date: testDate,
  hungerRating: 6,
  stressRating: 2,
  notes: 'Solid nutrition today, hit protein goal cleanly.',
});

const testSnapshot = CalendarHistoryService.getDaySnapshot(testDate);
assert(testSnapshot.date === testDate, `Snapshot date matches (${testSnapshot.date})`);
assert(testSnapshot.scaleWeightKg === 64.2, `Scale weight reflected accurately (${testSnapshot.scaleWeightKg} kg)`);
assert(testSnapshot.nutrition.waterLiters === 2.2, `Hydration reflected (${testSnapshot.nutrition.waterLiters} L)`);
assert(testSnapshot.nutrition.caloriesConsumed >= 2380, `Calories consumed reflected (${testSnapshot.nutrition.caloriesConsumed})`);
assert(testSnapshot.nutrition.proteinConsumed >= 119, `Protein consumed reflected (${testSnapshot.nutrition.proteinConsumed}g)`);
assert(!!testSnapshot.journal.morningEntry?.notes?.includes('energized'), 'Morning check-in note extracted');
assert(!!testSnapshot.journal.eveningEntry?.notes?.includes('protein'), 'Evening reflection note extracted');
assert((testSnapshot.journal.readinessScore || 0) > 70, `Readiness score computed (${testSnapshot.journal.readinessScore}%)`);

// 4. Workout Sessions Retrieval for Date
console.log('\n4. WorkoutRepository.getSessionsForDate:');
const sessions = WorkoutRepository.getSessionsForDate(testDate);
assert(Array.isArray(sessions), 'getSessionsForDate returns array');

// 5. useCalendarStore action verification
console.log('\n5. useCalendarStore Actions:');
const store = useCalendarStore.getState();
assert(store.isCalendarOpen === false, 'Calendar initially closed');
store.openCalendar('2026-10-14');
const openedState = useCalendarStore.getState();
assert(openedState.isCalendarOpen === true, 'Calendar opened via openCalendar()');
assert(openedState.selectedDate === '2026-10-14', 'Calendar preselected target date');

store.setSelectedDate('2026-10-18');
assert(useCalendarStore.getState().selectedDate === '2026-10-18', 'Date selection updated');

store.nextMonth();
const nextMonthState = useCalendarStore.getState();
assert(nextMonthState.currentMonth === 11, `Navigated to November (month 11, got ${nextMonthState.currentMonth})`);

store.prevMonth();
const prevMonthState = useCalendarStore.getState();
assert(prevMonthState.currentMonth === 10, `Navigated back to October (month 10, got ${prevMonthState.currentMonth})`);

store.closeCalendar();
assert(useCalendarStore.getState().isCalendarOpen === false, 'Calendar closed via closeCalendar()');

console.log(`\n========================================`);
console.log(`RESULTS: ${passed} passed, ${failed} failed.`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}
