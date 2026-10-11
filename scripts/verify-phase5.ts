/**
 * Sthira — Phase 5 Verification Test Suite
 * Tests:
 * 1. Morning Readiness Score mathematical weighting & classifications
 * 2. Natural language reflection sentiment & theme extraction
 * 3. Daily Holistic AI Coach Review generation
 * 4. SQLite Journal Repository CRUD & DailyLogs ratings synchronization
 */

import {
  calculateReadinessScore,
  extractSentimentAndThemes,
  generateDailyCoachReview,
} from '../src/services/journalAnalytics';
import { JournalRepository } from '../src/database/repositories/journalRepository';
import { DailyLogsRepository } from '../src/database/repositories/dailyLogsRepository';
import { runMigrations } from '../src/database/migrations';

declare const process: any;

console.log('========================================');
console.log('     STHIRA - PHASE 5 VERIFICATION      ');
console.log('========================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passCount++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    if (detail) console.error(`   Detail: ${detail}`);
    failCount++;
  }
}

// ----------------------------------------------------
// 1. Initial Database Setup
// ----------------------------------------------------
console.log('[1/4] Testing Database Setup...');
try {
  runMigrations();
  assert(true, 'Database migrations executed successfully.');
} catch (e: any) {
  assert(false, 'Database migrations failed.', e.message);
}

// ----------------------------------------------------
// 2. Morning Readiness Score Engine
// ----------------------------------------------------
console.log('\n[2/4] Testing Morning Readiness Mathematical Modeling...');

// Case A: Optimal Recovery (8h sleep, 9 energy, 8 mood, 2 soreness)
const optimalReadiness = calculateReadinessScore({
  sleepHours: 8.0,
  energyRating: 9,
  moodRating: 8,
  sorenessRating: 2,
});
assert(optimalReadiness.totalScore >= 80, `Optimal readiness score >= 80 (got ${optimalReadiness.totalScore}).`);
assert(optimalReadiness.level === 'OPTIMAL', 'Optimal readiness classification matches OPTIMAL.');
assert(optimalReadiness.isEstimated === true, 'Strict isEstimated distinction flag set to true.');
assert(optimalReadiness.sleepScore === 35, 'Max 35 points awarded for 8.0h sleep.');

// Case B: Moderate Recovery (7.2h sleep, 7 energy, 7 mood, 4 soreness)
const moderateReadiness = calculateReadinessScore({
  sleepHours: 7.2,
  energyRating: 7,
  moodRating: 7,
  sorenessRating: 4,
});
assert(
  moderateReadiness.level === 'MODERATE',
  `Moderate readiness level matches MODERATE (score: ${moderateReadiness.totalScore}).`
);
assert(
  moderateReadiness.recommendation.includes('Baseline recovery'),
  'Provides baseline training load recommendation.'
);

// Case C: Fatigued / Under-recovered (5.0h sleep, 4 energy, 4 mood, 8 soreness)
const fatiguedReadiness = calculateReadinessScore({
  sleepHours: 5.0,
  energyRating: 4,
  moodRating: 4,
  sorenessRating: 8,
});
assert(fatiguedReadiness.totalScore < 62, `Fatigued readiness score < 62 (got ${fatiguedReadiness.totalScore}).`);
assert(fatiguedReadiness.level === 'FATIGUED', 'Identified FATIGUED readiness state.');
assert(
  fatiguedReadiness.recommendation.includes('reducing working sets') ||
    fatiguedReadiness.recommendation.includes('mobility'),
  'Recommends volume reduction or mobility focus when fatigued.'
);

// ----------------------------------------------------
// 3. Sentiment & Theme Extraction Engine
// ----------------------------------------------------
console.log('\n[3/4] Testing Reflection Sentiment & Theme Extraction...');

// Motivated workout reflection
const motivatedText = 'Crushed my chest press session today! Pushed 32.5kg for 12 reps, feeling strong and energized.';
const motivatedResult = extractSentimentAndThemes(motivatedText);
assert(motivatedResult.sentiment === 'motivated', `Sentiment classified as motivated (got ${motivatedResult.sentiment}).`);
assert(motivatedResult.themes.includes('training'), 'Extracted #training theme.');

// Calm sleep reflection
const calmText = 'Woke up after 8 hours of deep restful sleep. Feeling peaceful and steady for the day ahead.';
const calmResult = extractSentimentAndThemes(calmText);
assert(calmResult.sentiment === 'calm', `Sentiment classified as calm (got ${calmResult.sentiment}).`);
assert(calmResult.themes.includes('sleep_quality'), 'Extracted #sleep_quality theme.');

// Joint soreness & nutrition
const sorenessText = 'Left shoulder feeling a bit stiff and sore after yesterday. Made sure to hit 120g protein with paneer.';
const sorenessResult = extractSentimentAndThemes(sorenessText);
assert(sorenessResult.themes.includes('joint_health'), 'Extracted #joint_health theme.');
assert(sorenessResult.themes.includes('nutrition'), 'Extracted #nutrition theme.');

// Empty string handling
const emptyResult = extractSentimentAndThemes('');
assert(emptyResult.sentiment === 'neutral' && emptyResult.themes.length === 0, 'Gracefully handles empty reflection notes.');

// ----------------------------------------------------
// 4. Holistic Daily AI Coach Review Engine
// ----------------------------------------------------
console.log('\n[4/4] Testing Daily AI Coach Synthesis Engine...');

const dummyGoals = {
  id: 'goals_1',
  calories_target: 2450,
  protein_target_min: 110,
  protein_target_max: 125,
  fat_target_min: 65,
  fat_target_max: 80,
  carbs_target: 335,
  water_target_liters: 2.5,
  sleep_hours_target: 8.0,
  workout_days_target: 4,
  created_at: '',
  updated_at: '',
};

// Test 4.1: High Compliance Workout Day
const compliantLog = {
  id: 'log_test_1',
  date: '2026-10-10',
  calories_consumed: 2460,
  protein_consumed: 121,
  carbs_consumed: 330,
  fat_consumed: 70,
  water_liters: 2.4,
  coach_status: 'ON TRACK' as const,
  created_at: '',
  updated_at: '',
};

const reviewCompliant = generateDailyCoachReview({
  dailyLog: compliantLog,
  goals: dummyGoals,
  workoutSession: { title: 'Upper Body A', completedSets: 18, totalVolumeKg: 7850 },
  readinessScore: 88,
});
assert(reviewCompliant.status === 'ON TRACK', 'Compliant day marked as ON TRACK.');
assert(reviewCompliant.summary.includes('121g'), 'Summary references exact protein intake (121g).');
assert(reviewCompliant.summary.includes('Upper Body A'), 'Summary references completed workout title.');
assert(reviewCompliant.actionItems.length >= 2, `Generated ${reviewCompliant.actionItems.length} action items.`);

// Test 4.2: Protein Shortfall Alert
const shortfallLog = {
  id: 'log_test_2',
  date: '2026-10-11',
  calories_consumed: 2450,
  protein_consumed: 82, // Under 110g min
  carbs_consumed: 380,
  fat_consumed: 72,
  water_liters: 2.0,
  coach_status: 'ON TRACK' as const,
  created_at: '',
  updated_at: '',
};

const reviewShortfall = generateDailyCoachReview({
  dailyLog: shortfallLog,
  goals: dummyGoals,
  readinessScore: 75,
});
assert(reviewShortfall.status === 'ATTENTION', 'Protein shortfall flags ATTENTION.');
assert(reviewShortfall.summary.includes('shy of your minimum'), 'Identifies protein shortfall in narrative.');
assert(
  reviewShortfall.actionItems.some((a) => a.includes('Greek yogurt') || a.includes('paneer') || a.includes('protein')),
  'Action items advise vegetarian protein sources to close gap.'
);

// ----------------------------------------------------
// 5. SQLite Repository Persistence & DailyLogs Sync
// ----------------------------------------------------
console.log('\n[5/5] Testing SQLite Journal Repository Persistence...');

const testDate = '2026-09-15';

// 5.1 Save Morning Check-In
const morningSaved = JournalRepository.saveMorningCheckIn({
  date: testDate,
  sleepHours: 7.8,
  energyRating: 9,
  moodRating: 8,
  sorenessRating: 2,
  notes: 'Woke up feeling strong. Ready for morning Upper A.',
});

assert(morningSaved.entry.entry_type === 'morning', 'Morning journal entry created.');
assert(morningSaved.entry.sentiment_label === 'motivated', 'Extracted motivated sentiment.');
assert(morningSaved.dailyLog.sleep_hours === 7.8, 'DailyLogs sleep_hours synced to 7.8h.');
assert(morningSaved.dailyLog.energy_rating === 9, 'DailyLogs energy_rating synced to 9.');
assert(morningSaved.dailyLog.soreness_rating === 2, 'DailyLogs soreness_rating synced to 2.');

// 5.2 Save Evening Reflection
const eveningSaved = JournalRepository.saveEveningReflection({
  date: testDate,
  hungerRating: 5,
  stressRating: 3,
  notes: 'Solid food adherence, hit 120g protein with tofu and dahi. Feeling peaceful.',
});

assert(eveningSaved.entry.entry_type === 'evening', 'Evening journal entry created.');
assert(eveningSaved.dailyLog.hunger_rating === 5, 'DailyLogs hunger_rating synced to 5.');
assert(eveningSaved.dailyLog.stress_rating === 3, 'DailyLogs stress_rating synced to 3.');

// 5.3 Save Holistic AI Recommendation
const savedAiRec = JournalRepository.saveAIRecommendation({
  date: testDate,
  recommendation_type: 'daily_coach',
  content: 'Great adherence and high readiness today.',
  action_items: JSON.stringify(['Get 8h sleep tonight', 'Hit 120g protein tomorrow']),
  statusBadge: 'ON TRACK',
});

assert(savedAiRec.id.includes(testDate), 'AIRecommendation persisted to database.');
const updatedDaily = DailyLogsRepository.getLogByDate(testDate);
assert(updatedDaily?.coach_status === 'ON TRACK', 'DailyLogs coach_status synced.');
assert(updatedDaily?.coach_summary === 'Great adherence and high readiness today.', 'DailyLogs coach_summary synced.');

// 5.4 Retrieve Recent Journal History
const historyEntries = JournalRepository.getRecentJournalHistory();
assert(historyEntries.length >= 2, `Retrieved ${historyEntries.length} journal entries from history.`);

// Summary
console.log('\n========================================');
console.log(`VERIFICATION COMPLETE: ${passCount} PASSED, ${failCount} FAILED`);
console.log('========================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
