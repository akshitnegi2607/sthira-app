-- ==============================================================================
-- Sthira — Central PostgreSQL Schema for Supabase
-- Run this script in your Supabase Project: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. UserProfile
CREATE TABLE IF NOT EXISTS "UserProfile" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  current_weight REAL NOT NULL,
  height REAL NOT NULL,
  target_weight REAL NOT NULL,
  goal_type TEXT NOT NULL,
  target_rate_kg_per_week REAL NOT NULL,
  diet_type TEXT NOT NULL,
  eats_eggs INTEGER NOT NULL DEFAULT 0,
  eats_onion INTEGER NOT NULL DEFAULT 1,
  eats_garlic INTEGER NOT NULL DEFAULT 1,
  eats_mushrooms INTEGER NOT NULL DEFAULT 0,
  cuisine_preferences TEXT NOT NULL,
  gym_days_per_week INTEGER NOT NULL DEFAULT 4,
  tuesday_activity TEXT NOT NULL DEFAULT 'Yoga',
  sunday_activity TEXT NOT NULL DEFAULT 'Swimming',
  saturday_rest INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Goals
CREATE TABLE IF NOT EXISTS "Goals" (
  id TEXT PRIMARY KEY,
  calories_target REAL NOT NULL,
  protein_target_min REAL NOT NULL,
  protein_target_max REAL NOT NULL,
  fat_target_min REAL NOT NULL,
  fat_target_max REAL NOT NULL,
  carbs_target REAL NOT NULL,
  water_target_liters REAL NOT NULL,
  sleep_hours_target REAL NOT NULL,
  workout_days_target INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. DailyLogs
CREATE TABLE IF NOT EXISTS "DailyLogs" (
  id TEXT PRIMARY KEY,
  date TEXT UNIQUE NOT NULL,
  calories_consumed REAL DEFAULT 0,
  protein_consumed REAL DEFAULT 0,
  carbs_consumed REAL DEFAULT 0,
  fat_consumed REAL DEFAULT 0,
  water_liters REAL DEFAULT 0,
  weight REAL,
  sleep_hours REAL,
  energy_rating INTEGER,
  mood_rating INTEGER,
  hunger_rating INTEGER,
  recovery_rating INTEGER,
  soreness_rating INTEGER,
  stress_rating INTEGER,
  coach_status TEXT DEFAULT 'ON TRACK',
  coach_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. WeightEntries
CREATE TABLE IF NOT EXISTS "WeightEntries" (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  weight_kg REAL NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. MealEntries
CREATE TABLE IF NOT EXISTS "MealEntries" (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  raw_text TEXT NOT NULL,
  total_calories REAL NOT NULL,
  total_protein REAL NOT NULL,
  total_carbs REAL NOT NULL,
  total_fat REAL NOT NULL,
  confidence TEXT NOT NULL,
  is_verified_by_user INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. FoodItems
CREATE TABLE IF NOT EXISTS "FoodItems" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  serving_size TEXT NOT NULL,
  serving_unit TEXT NOT NULL,
  serving_grams REAL,
  calories REAL NOT NULL,
  protein REAL NOT NULL,
  carbs REAL NOT NULL,
  fat REAL NOT NULL,
  fiber REAL DEFAULT 0,
  is_custom INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. NutritionEstimates
CREATE TABLE IF NOT EXISTS "NutritionEstimates" (
  id TEXT PRIMARY KEY,
  meal_entry_id TEXT NOT NULL REFERENCES "MealEntries"(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,
  calories_estimated REAL NOT NULL,
  protein_estimated REAL NOT NULL,
  carbs_estimated REAL NOT NULL,
  fat_estimated REAL NOT NULL,
  confidence_score TEXT NOT NULL,
  clarification_needed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. WaterEntries
CREATE TABLE IF NOT EXISTS "WaterEntries" (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  amount_ml REAL NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. SleepEntries
CREATE TABLE IF NOT EXISTS "SleepEntries" (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  quality_rating INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. JournalEntries
CREATE TABLE IF NOT EXISTS "JournalEntries" (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  entry_type TEXT NOT NULL,
  notes TEXT NOT NULL,
  sentiment_label TEXT,
  themes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Exercises
CREATE TABLE IF NOT EXISTS "Exercises" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  primary_muscle TEXT NOT NULL,
  secondary_muscles TEXT NOT NULL,
  equipment TEXT NOT NULL,
  difficulty_level TEXT NOT NULL,
  target_sets INTEGER NOT NULL,
  target_rep_range TEXT NOT NULL,
  rest_seconds INTEGER NOT NULL,
  instructions TEXT NOT NULL,
  common_mistakes TEXT NOT NULL,
  substitutions TEXT NOT NULL,
  starting_weight_kg REAL,
  last_weight_kg REAL,
  current_recommended_weight_kg REAL,
  is_custom INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. WorkoutPlans
CREATE TABLE IF NOT EXISTS "WorkoutPlans" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  day_of_week INTEGER,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. WorkoutSessions
CREATE TABLE IF NOT EXISTS "WorkoutSessions" (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  workout_plan_id TEXT REFERENCES "WorkoutPlans"(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  duration_seconds INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  difficulty_perceived TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. WorkoutExercises
CREATE TABLE IF NOT EXISTS "WorkoutExercises" (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES "WorkoutSessions"(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES "Exercises"(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. WorkoutSets
CREATE TABLE IF NOT EXISTS "WorkoutSets" (
  id TEXT PRIMARY KEY,
  workout_exercise_id TEXT NOT NULL REFERENCES "WorkoutExercises"(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  weight_kg REAL NOT NULL,
  reps INTEGER NOT NULL,
  perceived_difficulty TEXT,
  rir INTEGER,
  is_completed INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. Activities
CREATE TABLE IF NOT EXISTS "Activities" (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  intensity TEXT NOT NULL,
  estimated_calories_burned REAL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. PainEntries
CREATE TABLE IF NOT EXISTS "PainEntries" (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  body_area TEXT NOT NULL,
  pain_level INTEGER NOT NULL,
  activity_context TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. AIRecommendations
CREATE TABLE IF NOT EXISTS "AIRecommendations" (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  recommendation_type TEXT NOT NULL,
  content TEXT NOT NULL,
  action_items TEXT,
  rationale TEXT,
  is_acknowledged INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. CuisineRecipes
CREATE TABLE IF NOT EXISTS "CuisineRecipes" (
  id TEXT PRIMARY KEY,
  cuisine TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  estimated_calories REAL NOT NULL,
  estimated_protein REAL NOT NULL,
  estimated_carbs REAL NOT NULL,
  estimated_fat REAL NOT NULL,
  ingredients_json TEXT NOT NULL,
  instructions TEXT,
  is_vegetarian INTEGER DEFAULT 1,
  has_eggs INTEGER DEFAULT 0,
  has_onion INTEGER DEFAULT 1,
  has_garlic INTEGER DEFAULT 1,
  has_mushrooms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- Performance Indexes
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_supabase_dailylogs_date ON "DailyLogs"(date);
CREATE INDEX IF NOT EXISTS idx_supabase_weight_date ON "WeightEntries"(date);
CREATE INDEX IF NOT EXISTS idx_supabase_meals_date ON "MealEntries"(date);
CREATE INDEX IF NOT EXISTS idx_supabase_water_date ON "WaterEntries"(date);
CREATE INDEX IF NOT EXISTS idx_supabase_sessions_date ON "WorkoutSessions"(date);
CREATE INDEX IF NOT EXISTS idx_supabase_journal_date ON "JournalEntries"(date);

-- ==============================================================================
-- Enable Row Level Security (RLS) & Allow Anonymous Read/Write for Personal App
-- ==============================================================================
DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'UserProfile', 'Goals', 'DailyLogs', 'WeightEntries', 'MealEntries',
    'FoodItems', 'NutritionEstimates', 'WaterEntries', 'SleepEntries',
    'JournalEntries', 'Exercises', 'WorkoutPlans', 'WorkoutSessions',
    'WorkoutExercises', 'WorkoutSets', 'Activities', 'PainEntries',
    'AIRecommendations', 'CuisineRecipes'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Allow anon all on %s" ON %I;', tbl, tbl);
    EXECUTE format('CREATE POLICY "Allow anon all on %s" ON %I FOR ALL USING (true) WITH CHECK (true);', tbl, tbl);
  END LOOP;
END $$;
