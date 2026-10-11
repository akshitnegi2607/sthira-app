# Sthira — Personal AI Fitness & Nutrition Coach

## Project Context & Active State

This project was initialized and verified in **Phase 1**. When working in this repository, follow these specifications and principles.

---

### 1. User Profile & Preferences
- **User**: Jay
- **Current Weight**: 64.0 kg (Target: 67.0 kg, lean bulk / muscle gain)
- **Height**: 167 cm
- **Target Gain Rate**: 0.1–0.2 kg/week (target ~0.15 kg/week)
- **Diet**: Vegetarian
  - Eggs: NO (excluded)
  - Onion: YES (allowed)
  - Garlic: YES (allowed)
  - Mushrooms: NO (excluded)
  - Cuisines: Indian, Mexican, Mediterranean, Italian, Asian, Middle Eastern
- **Weekly Routine**:
  - Gym: ~4 days/week (Monday Upper A, Wednesday Lower A, Thursday Upper B, Friday Lower B)
  - Tuesday: Yoga & Mobility
  - Sunday: Swimming & Active recovery
  - Saturday: Rest day
- **Starting Nutrition Targets**:
  - Calories: ~2,450 kcal/day
  - Protein: 110–125 g/day (~120g)
  - Fat: ~65–80 g/day (~70g)
  - Carbohydrates: Remaining calories (~335g)
  - Water: 2.0–2.5 L/day

---

### 2. Core Operating Principles
- **Measured vs. Estimated Data**: Always distinguish between user-measured data (scale weight, food grams, gym weights, reps, sleep duration) and estimated data (AI calorie estimates, protein estimates, journal sentiment, recommendations). Never display an estimate as an exact measurement.
- **Calm, Premium UI**: Clean cards, ample whitespace, subtle indicators (Green: on track, Amber: attention, Red: needs action). No aggressive gamification or "gym bro" aesthetics.
- **Local-First**: All core functions work offline via SQLite (`expo-sqlite`). Deterministic math (averages, progression) is handled in TypeScript, not by AI prompt hallucinations.

---

### 3. Architecture & Tech Stack
- **Framework**: Expo SDK 57, React Native 0.86, TypeScript, Expo Router
- **State**: Zustand (`useProfileStore.ts`, `useDashboardStore.ts`)
- **Database**: SQLite with all 22 tables from Section 42 created and indexed:
  `UserProfile`, `Goals`, `DailyLogs`, `WeightEntries`, `MealEntries`, `FoodItems`, `NutritionEstimates`, `WaterEntries`, `SleepEntries`, `JournalEntries`, `Exercises`, `WorkoutPlans`, `WorkoutSessions`, `WorkoutExercises`, `WorkoutSets`, `Activities`, `PainEntries`, `AIRecommendations`, `WeeklyReviews`, `MonthlyReviews`, `CuisineRecipes`, `AppSettings`.
- **Validation**: Zod (`src/types/schemas.ts`)
- **Cross-Platform**: Uses native SQLite on iOS/Android, and `src/database/db.web.ts` for web browser preview.

---

### 4. Implementation Status
- **PHASE 1 (COMPLETED)**:
  - Expo Router tabs (`(tabs)/index.tsx`, `nutrition.tsx`, `workout.tsx`, `progress.tsx`, `journal.tsx`)
  - Profile & Settings screen (`settings.tsx`)
  - Polished Home Dashboard (Today Overview, Workout Card, AI Coach Card, 6 Quick Actions, QuickLogModal)
  - Full SQLite schema and initial migrations seeding default profile, goals, exercises, weekly schedule, and food database.
  - Zero TypeScript errors (`npx tsc --noEmit` clean).
  - Multi-platform bundling verified (`npx expo export`).

- **PHASE 2 (COMPLETED)**:
  - Daily Nutrition Screen (`(tabs)/nutrition.tsx`) with visual SVG circular calorie gauge & macro progress bars.
  - Measured vs. Estimated distinction pill ("ESTIMATED DATA" badge).
  - Food Logging UI for all meal slots: Breakfast, Lunch, Dinner, Snacks.
  - Natural Language Food Parser (`analyzeMeal` & local rules engine in `src/services/mealParser.ts`) with portion extraction, scaling, and dietary check (flags eggs, mushrooms, and non-veg).
  - Confidence scoring (`HIGH`, `MED`, `LOW`) with interactive `ClarificationModal` allowing kitchen scale gram adjustments and manual macro overrides.
  - Cuisine Exploration feature (`src/features/nutrition/components/CuisineExplorationSection.tsx`) with 12 authentic vegetarian recipes across 6 cuisines (Indian, Mexican, Mediterranean, Italian, Asian, Middle Eastern) and one-tap diary logging.
  - Repositories (`mealRepository.ts`, `recipeRepository.ts`) with automatic DailyLogs synchronization.
  - 36/36 tests passing in `scripts/verify-phase2.ts`.

- **PHASE 3 (COMPLETED)**:
  - Workout & Training Screen (`(tabs)/workout.tsx`) with weekly split schedule (Upper A, Lower A, Upper B, Lower B, Yoga, Swimming, Rest).
  - Active Session Logger (`ActiveWorkoutModal.tsx`): live elapsed timer, pause/resume, sets logging (weight, reps, RIR, checkmark completion), and auto-triggered rest timer.
  - Built-in Rest Timer (`RestTimerBanner.tsx`): animated progress bar, countdown, +30s adjustment, skip action.
  - Progressive Overload Engine (`src/services/progressiveOverload.ts`): sports-science double progression (+1.25kg arms/isolation, +2.5kg upper compounds, +2.5–5kg leg compounds), RIR evaluation, and explicit `isEstimated: true` tags.
  - Exercise Substitution System (`src/services/exerciseSubstitution.ts`, `ExerciseSubstitutionModal.tsx`): instant one-tap alternatives with matched stimulus and starting load guidance.
  - Exercise Form & Cue Guide (`ExerciseDetailModal.tsx`): step-by-step instructions, target muscles, common mistakes to avoid.
  - Workout Finish Flow (`WorkoutFinishModal.tsx`): summary duration, total volume (kg), completed sets, perceived exertion (Easy/Good/Hard/Very hard), and post-workout notes.
  - Pain & Joint Fatigue Tracking (`PainLoggingModal.tsx`): standalone & post-workout logging with automatic 15% deload caution flags in progressive overload calculations.
  - Repositories & State: `WorkoutRepository.ts` and `useWorkoutStore.ts` with clean SQLite persistence.
  - 40/40 tests passing in `scripts/verify-phase3.ts`.

- **PHASE 4 (COMPLETED)**:
  - Progress & Analytics Screen (`(tabs)/progress.tsx`) with full reactive SQLite state management.
  - Exponential Moving Average (EMA) Engine (`src/services/progressAnalytics.ts`): $\alpha = 0.1$ smoothing filter dampening water weight, sodium, and digestion shifts while strictly preserving measured raw scale dots.
  - Interactive SVG Weight Trend Chart (`WeightTrendChart.tsx`): dynamic viewBox, timeframe filters (7D, 30D, 90D, ALL), 7-day velocity badge (+0.15 kg/week), "MEASURED SCALE" vs "ESTIMATED TREND" legend badges.
  - Deterministic Calorie Adaptation Engine (`calculateCalorieAdaptation`): sports-science energy balance adjustments (+125 kcal on stall, -100 kcal on excess fat gain, 0 on track), undereating compliance guard, and one-tap "Apply +125 kcal Target" to Goals table.
  - Sleep & Recovery Correlation Engine (`correlateSleepAndWorkout`, `SleepRecoveryCorrelationCard.tsx`): volume lifted on $\ge 7.5\text{h}$ sleep vs. $< 7.0\text{h}$ sleep (+18% volume) with actionable hypertrophy takeaways.
  - Lean Bulk Trajectory Modeling (`calculateLeanBulkTrajectory`, `LeanBulkTrajectoryCard.tsx`): 64.0 kg $\rightarrow$ 67.0 kg (+3.0 kg target) progress bar, weeks remaining, and projected completion date.
  - Scale Weigh-In Modal (`LogWeightModal.tsx`): stepper adjustment (±0.1, ±0.5 kg), date picker, notes, and instant synchronization with `DailyLogs.weight` and `UserProfile.current_weight`.
  - Repositories & State: `ProgressRepository.ts` and `useProgressStore.ts`.
  - 46/46 tests passing in `scripts/verify-phase4.ts` (122/122 tests passing project-wide).

- **PHASE 5 (COMPLETED)**:
  - Daily Journal & Mindset Reflection Screen (`(tabs)/journal.tsx`) with date selector and quick check-in cards.
  - Morning Readiness Engine (`src/services/journalAnalytics.ts`): physiological weighting (sleep duration up to 35 pts, energy up to 25 pts, soreness/freshness up to 20 pts, mood up to 20 pts) yielding a deterministic 0–100% score and training intensity advice (Optimal / Moderate / Fatigued).
  - Visual Circular Readiness Gauge (`ReadinessScoreCard.tsx`) with SVG progress stroke and sub-score breakdown.
  - Morning Check-In Modal (`MorningCheckInModal.tsx`): sleep steppers (±0.5h), 1–10 rating bars for energy, mood, soreness, and reflection notes.
  - Evening Wind-Down Modal (`EveningWindDownModal.tsx`): 1–10 appetite & stress ratings, reflection notes, and real-time sentiment/theme tag extraction.
  - Holistic Daily AI Coach Review Engine (`generateDailyCoachReview`): evaluates nutrition surplus & protein compliance, workout completion & volume, and readiness; renders structured status (`ON TRACK`, `ATTENTION`, `NEEDS ACTION`), coach narrative, and actionable tomorrow checklist.
  - Daily Coach Review Card (`DailyCoachSummaryCard.tsx`) with instant refresh action.
  - Reflection Timeline (`JournalTimelineCard.tsx`) rendering morning intentions and evening reflections with sentiment tags.
  - Repositories & State: `JournalRepository.ts` and `useJournalStore.ts` with SQLite persistence.
  - 36/36 tests passing in `scripts/verify-phase5.ts` (158/158 tests passing project-wide).

---

### 5. Running the App
```bash
npm start
```
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Press `w` for Web Browser
