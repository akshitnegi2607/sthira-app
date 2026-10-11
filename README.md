# Sthira (स्थिर) — Personal AI Fitness & Nutrition Coach

<p align="center">
  <img src="assets/images/kamal_logo.png" width="100" alt="Sthira Kamal Logo" />
</p>

<p align="center">
  <strong>Dedicated with devotion and reverence:</strong><br />
  <strong><em>"नारायणाय समर्पितम्"</em></strong><br />
  <em>(Dedicated to Lord Narayana)</em>
</p>

<p align="center">
  A calm, mindful, sports-science driven personal AI coach engineered for lean bulking, vegetarian nutrition, progressive overload, and holistic physical poise.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-SDK%2057-000020?style=flat-square&logo=expo" />
  <img src="https://img.shields.io/badge/React%20Native-0.86-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Database-SQLite%20(22%20Tables)-003B57?style=flat-square&logo=sqlite" />
  <img src="https://img.shields.io/badge/Tests-158%2F158%20Passing-10B981?style=flat-square" />
  <img src="https://img.shields.io/badge/Diet-100%25%20Vegetarian-059669?style=flat-square" />
</p>

---

## 🌟 Vision & Guiding Philosophy

- **Rooted in Sthira (स्थिर)**: Meaning *firm, steady, and resolute* in Sanskrit. Sthira rejects dopamine-fueled gamification and chaotic "gym bro" aesthetics in favor of a calm, grounded, lifelong approach to physical strength and spiritual poise.
- **The Measured vs. Estimated Principle**: Clear ontological boundary between ground truth empirical facts (scale weight, food grams, sleep duration, gym reps/kg) and mathematical/AI estimates (EMA trend curve, calorie adaptation adjustments, overload recommendations, sentiment). Estimates are never masked as facts.
- **Local-First & Offline Resilience**: All data is stored locally in 22 relational SQLite tables (`expo-sqlite`). No vendor lock-in, zero cloud latency, and full functionality offline.
- **Sacred Aesthetics**: Ambient, faint watermarked presence of **Lord Narayana** in the background, paired with the emblem of the **Kamal (Lotus)**.

---

## 👤 User Profile: Jay

- **Target Weight**: 64.0 kg $\rightarrow$ 67.0 kg (+3.0 kg lean bulk)
- **Target Velocity**: +0.10 to +0.20 kg/week (ideal: **~0.15 kg/week**)
- **Dietary Guardrails**: 100% Vegetarian (Strictly **0 eggs**, Strictly **0 mushrooms**; Onion & Garlic allowed)
- **Starting Targets**: ~2,450 kcal/day, 110–125g protein, 65–80g fat, ~335g carbs, 2.0–2.5 L water
- **Weekly Schedule**: 4-day gym split (Upper A, Lower A, Upper B, Lower B) + Tuesday Yoga & Mobility + Sunday Swimming + Saturday Rest

---

## 📱 Modules Overview

For comprehensive architecture details, mathematical formulas, and schema diagrams, consult the **[PROJECT_SPECIFICATION.md](PROJECT_SPECIFICATION.md)**.

### 1. Dashboard & Core Command Center
- **Today's Overview**: Concentric SVG progress rings for calories, protein, water, and weight.
- **Dynamic Workout Card**: Automatically reflects 4 live states: `IN_PROGRESS` (live timer & volume), `COMPLETED` (summary metrics), `PLANNED` (session launcher), or `REST DAY` (weekend recovery).
- **AI Coach Summary Card**: Daily compliance badge (`ON TRACK`, `ATTENTION`, `NEEDS ACTION`) and headline advice.
- **Quick Action Grid**: Single-tap shortcuts for meal logging, active workout, scale weigh-in, morning check-in, water logging (+250ml), and pain tracking.

### 2. Nutrition & Natural Language Food Logging
- **Natural Language Food Parser**: Parses freeform inputs (e.g. *"200g low fat paneer with 2 rotis and 1 cup dahi"*), extracts portions, and scales macros.
- **Dietary Guardrails**: Automatically detects and warns against meat, poultry, fish, gelatin, eggs, or mushrooms.
- **Clarification & Kitchen Scale Overrides**: Allows fine-tuning gram weights and manual macro overrides with confidence scoring (`HIGH`, `MED`, `LOW`).
- **Cuisine Exploration Engine**: 12 authentic vegetarian recipes across 6 cuisines (Indian, Mexican, Mediterranean, Italian, Asian, Middle Eastern) with one-tap diary logging.

### 3. Workout & Progressive Overload Engine
- **Active Workout Logger**: Real-time elapsed stopwatch, pause/resume, sets logging (weight, reps, RIR, checkmarks), and in-modal set adjustments.
- **Automated Rest Countdown Timer**: Auto-triggered rest banner with progress bar countdown, +30s addition, and skip button.
- **Double Progression Algorithm**: Automatically increments loads (+1.25kg arms, +2.5kg upper compounds, +2.5–5kg leg compounds) when target sets and rep ceilings are achieved at RIR $\ge 1$.
- **Biomechanical Exercise Substitution Matrix**: Instant equipment/joint alternatives (e.g. Machine Chest Press $\leftrightarrow$ DB Bench Press $\leftrightarrow$ Push-Ups).
- **Form & Cue Guide**: In-depth setup instructions, anatomical targeting, and common mistakes.
- **Pain & Deload Guardrails**: Automatically enforces a **15% deload caution** on associated compound movements if joint pain level is $\ge 5$.

### 4. Progress, Analytics & Calorie Adaptation
- **Exponential Moving Average (EMA) Weight Filter**: $\alpha = 0.1$ filter dampening transient water, sodium, and digestion shifts while strictly preserving measured raw scale dots.
- **Interactive SVG Weight Trend Chart**: Dynamic viewBox, timeframe filters (`7D`, `30D`, `90D`, `ALL`), 7-day velocity badge (+0.15 kg/week), "MEASURED SCALE" vs "ESTIMATED TREND" legend badges.
- **Deterministic Calorie Adaptation Engine**: Adjusts energy balance (+125 kcal on stall, -100 kcal on excess fat gain, 0 on track) with undereating compliance guard and one-tap "Apply Target" action.
- **Sleep & Recovery Correlation**: Computes gym volume performance on $\ge 7.5\text{h}$ sleep vs. $< 7.0\text{h}$ sleep (+18% volume).
- **Lean Bulk Trajectory Modeling**: Progress bar toward 67.0 kg (+3.0 kg target), remaining kg, weeks, and projected completion date.
- **Scale Weigh-In Modal**: Stepper adjustment (±0.1, ±0.5 kg), date picker, notes, and instant synchronization.

### 5. Daily Journal, Morning Readiness & Holistic Review
- **Morning Readiness Engine**: Deterministic 0–100% readiness score weighting sleep duration (35 pts), energy (25 pts), freshness (20 pts), and mood (20 pts) into training capacity classifications (`OPTIMAL`, `MODERATE`, `FATIGUED`).
- **Circular Readiness Gauge**: Visual SVG meter and sub-score breakdown.
- **Morning Check-In Modal**: Measured sleep steppers (±0.5h), 1–10 rating bars, and intention notes.
- **Evening Wind-Down Modal**: 1–10 appetite & stress ratings, reflection notes, and real-time sentiment/theme extraction.
- **Holistic Daily AI Coach Review**: Synthesizes nutrition surplus, protein compliance, workout volume, and readiness into an executive summary and tomorrow's checklist.
- **Reflections Timeline**: Chronological log of morning and evening reflections with sentiment tags.

---

## 🗄️ Database Architecture (22 SQLite Tables)

1. `UserProfile`
2. `Goals`
3. `DailyLogs`
4. `WeightEntries`
5. `MealEntries`
6. `FoodItems`
7. `NutritionEstimates`
8. `WaterEntries`
9. `SleepEntries`
10. `JournalEntries`
11. `Exercises`
12. `WorkoutPlans`
13. `WorkoutSessions`
14. `WorkoutExercises`
15. `WorkoutSets`
16. `Activities`
17. `PainEntries`
18. `AIRecommendations`
19. `WeeklyReviews`
20. `MonthlyReviews`
21. `CuisineRecipes`
22. `AppSettings`

---

## 🧪 Verification & Test Suites

Every algorithm, mathematical formula, and repository CRUD operation is thoroughly tested across 4 dedicated suites:

```bash
# Run all phase verification suites
node scratch/scripts/verify-phase2.js   # 36 Tests (Nutrition, Parser, Recipes)
node scratch/scripts/verify-phase3.js   # 40 Tests (Progressive Overload, Sets, Substitutions)
node scratch/scripts/verify-phase4.js   # 46 Tests (EMA, Calorie Adaptation, Trajectory)
node scratch/scripts/verify-phase5.js   # 36 Tests (Readiness Score, Daily Review, Journal)

# Type check
npx tsc --noEmit                       # Clean (0 errors)
```

**Total Tests**: **158 / 158 Passing (100%)**

---

## 🚀 Getting Started

### Installation
```bash
# Clone the repository
git clone https://github.com/akshitnegi2607/sthira-app.git
cd sthira-app

# Install dependencies
npm install
```

### Run the App
```bash
npm start
```
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Press `w` for Web Browser
- Scan QR code with Expo Go on a physical device

---

### Om Tat Sat • नारायणाय समर्पितम्
