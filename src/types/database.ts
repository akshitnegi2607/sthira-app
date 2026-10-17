export interface UserProfile {
  id: string;
  name: string;
  current_weight: number;
  height: number;
  target_weight: number;
  goal_type: 'lean_bulk' | 'cut' | 'maintain';
  target_rate_kg_per_week: number;
  diet_type: string;
  eats_eggs: number; // 0 or 1
  eats_onion: number; // 0 or 1
  eats_garlic: number; // 0 or 1
  eats_mushrooms: number; // 0 or 1
  cuisine_preferences: string; // JSON array of string
  gym_days_per_week: number;
  tuesday_activity: string;
  sunday_activity: string;
  saturday_rest: number;
  created_at: string;
  updated_at: string;
}

export interface Goals {
  id: string;
  calories_target: number;
  protein_target_min: number;
  protein_target_max: number;
  fat_target_min: number;
  fat_target_max: number;
  carbs_target: number;
  water_target_liters: number;
  sleep_hours_target: number;
  workout_days_target: number;
  created_at: string;
  updated_at: string;
}

export interface DailyLog {
  id: string;
  date: string; // YYYY-MM-DD
  calories_consumed: number;
  protein_consumed: number;
  carbs_consumed: number;
  fat_consumed: number;
  water_liters: number;
  weight?: number | null;
  sleep_hours?: number | null;
  energy_rating?: number | null; // 1-10
  mood_rating?: number | null;
  hunger_rating?: number | null;
  recovery_rating?: number | null;
  soreness_rating?: number | null;
  stress_rating?: number | null;
  coach_status: 'PENDING' | 'ON TRACK' | 'ATTENTION' | 'NEEDS ACTION';
  coach_summary?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeightEntry {
  id: string;
  date: string;
  weight_kg: number;
  notes?: string | null;
  created_at: string;
}

export interface MealEntry {
  id: string;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  raw_text: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  confidence: 'high' | 'medium' | 'low';
  is_verified_by_user: number;
  created_at: string;
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  serving_size: string;
  serving_unit: string;
  serving_grams?: number | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  is_custom: number;
  created_at: string;
}

export interface NutritionEstimate {
  id: string;
  meal_entry_id: string;
  food_name: string;
  quantity: number;
  unit: string;
  calories_estimated: number;
  protein_estimated: number;
  carbs_estimated: number;
  fat_estimated: number;
  confidence_score: 'high' | 'medium' | 'low';
  clarification_needed: number;
  created_at: string;
}

export interface WaterEntry {
  id: string;
  date: string;
  amount_ml: number;
  created_at: string;
}

export interface SleepEntry {
  id: string;
  date: string;
  duration_minutes: number;
  quality_rating?: number | null;
  notes?: string | null;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  entry_type: 'morning' | 'evening' | 'general';
  notes: string;
  sentiment_label?: string | null;
  themes?: string | null;
  created_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  primary_muscle: string;
  secondary_muscles: string;
  equipment: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  target_sets: number;
  target_rep_range: string;
  rest_seconds: number;
  instructions: string;
  common_mistakes: string;
  substitutions: string;
  starting_weight_kg?: number | null;
  last_weight_kg?: number | null;
  current_recommended_weight_kg?: number | null;
  is_custom: number;
  created_at: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  day_of_week?: number | null; // 0=Sun, 1=Mon, etc.
  description?: string | null;
  is_active: number;
  created_at: string;
}

export interface WorkoutSession {
  id: string;
  date: string;
  workout_plan_id?: string | null;
  title: string;
  start_time?: string | null;
  end_time?: string | null;
  duration_seconds: number;
  status: 'completed' | 'in_progress' | 'skipped';
  difficulty_perceived?: 'Easy' | 'Good' | 'Hard' | 'Very hard' | null;
  notes?: string | null;
  created_at: string;
}

export interface WorkoutExercise {
  id: string;
  session_id: string;
  exercise_id: string;
  order_index: number;
  created_at: string;
}

export interface WorkoutSet {
  id: string;
  workout_exercise_id: string;
  set_number: number;
  weight_kg: number;
  reps: number;
  perceived_difficulty?: string | null;
  rir?: number | null;
  is_completed: number;
  created_at: string;
}

export interface Activity {
  id: string;
  date: string;
  activity_type: 'gym' | 'yoga' | 'swimming' | 'walking' | 'running' | 'cycling' | 'other';
  duration_minutes: number;
  intensity: 'light' | 'moderate' | 'vigorous';
  estimated_calories_burned?: number | null;
  notes?: string | null;
  created_at: string;
}

export interface PainEntry {
  id: string;
  date: string;
  body_area: string;
  pain_level: number; // 0 to 10
  activity_context?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface AIRecommendation {
  id: string;
  date: string;
  recommendation_type: 'daily_coach' | 'calorie_adjustment' | 'workout_progression' | 'nutrition_advice';
  content: string;
  action_items?: string | null;
  rationale?: string | null;
  is_acknowledged: number;
  created_at: string;
}

export interface WeeklyReview {
  id: string;
  start_date: string;
  end_date: string;
  start_weight?: number | null;
  end_weight?: number | null;
  weight_change?: number | null;
  avg_calories?: number | null;
  avg_protein?: number | null;
  workouts_completed?: number | null;
  exercises_progressed?: number | null;
  avg_sleep_hours?: number | null;
  coach_summary?: string | null;
  calorie_target_recommendation?: string | null;
  created_at: string;
}

export interface MonthlyReview {
  id: string;
  month_str: string;
  weight_change?: number | null;
  avg_calories?: number | null;
  protein_consistency_pct?: number | null;
  workout_consistency_pct?: number | null;
  strength_progression_summary?: string | null;
  major_achievements?: string | null;
  created_at: string;
}

export interface CuisineRecipe {
  id: string;
  cuisine: string;
  title: string;
  description?: string | null;
  estimated_calories: number;
  estimated_protein: number;
  estimated_carbs: number;
  estimated_fat: number;
  ingredients_json: string;
  instructions?: string | null;
  is_vegetarian: number;
  has_eggs: number;
  has_onion: number;
  has_garlic: number;
  has_mushrooms: number;
  created_at: string;
}

export interface AppSetting {
  key: string;
  value: string;
  updated_at: string;
}
