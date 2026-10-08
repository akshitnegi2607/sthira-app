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

- **PHASE 2 (NEXT STEP)**:
  - Daily Nutrition Screen (visual macro rings/progress bars, remaining calories/protein)
  - Food Logging UI (Meal entries: breakfast, lunch, dinner, snacks)
  - Natural Language Food Parser (`analyzeMeal` interface & local rules engine)
  - Confidence scoring (High, Medium, Low with clarification modal)
  - Cuisine Exploration feature (Mexican, Mediterranean, Italian, Asian, Indian suggestions under calorie & protein constraints)

---

### 5. Running the App
```bash
npm start
```
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Press `w` for Web Browser
