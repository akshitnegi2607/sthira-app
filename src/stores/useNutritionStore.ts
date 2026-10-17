import { create } from 'zustand';
import {
  MealRepository,
  MealEntryWithEstimates,
  CreateMealInput,
  CreateEstimateInput,
} from '@/database/repositories/mealRepository';
import { RecipeRepository } from '@/database/repositories/recipeRepository';
import { DailyLogsRepository } from '@/database/repositories/dailyLogsRepository';
import { CuisineRecipe, NutritionEstimate, DailyLog } from '@/types/database';
import { analyzeMeal, analyzeMealAsync, MealAnalysisResult } from '@/services/mealParser';
import { useDashboardStore } from './useDashboardStore';
import { getTodayDateString } from '@/utils/date';

import { isSupabaseConfigured, getSupabaseClient } from '@/services/supabaseClient';
import { SupabaseSyncService } from '@/services/supabaseSyncService';

interface NutritionState {
  selectedDate: string;
  meals: MealEntryWithEstimates[];
  recipes: CuisineRecipe[];
  customRecipes: CuisineRecipe[];
  currentLog: DailyLog | null;
  selectedCuisine: string;
  filterProteinMin: number;
  filterCalorieMax: number;
  searchQuery: string;
  isLoading: boolean;
  isAnalyzing: boolean;
  lastAnalysisResult: MealAnalysisResult | null;

  // Actions
  setSelectedDate: (date: string) => void;
  loadNutritionData: (date?: string) => void;
  logMeal: (mealData: CreateMealInput, items: CreateEstimateInput[]) => void;
  deleteMeal: (mealId: string) => void;
  updateEstimate: (estimateId: string, updates: Partial<NutritionEstimate>) => void;
  verifyMeal: (mealId: string) => void;
  logRecipeAsMeal: (
    recipe: CuisineRecipe,
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  ) => void;
  createCustomRecipe: (data: {
    title: string;
    description?: string;
    estimated_calories: number;
    estimated_protein: number;
    estimated_carbs: number;
    estimated_fat: number;
    ingredients: { item: string; amount: string; calories?: number; protein?: number }[];
    instructions?: string;
  }) => CuisineRecipe;
  deleteCustomRecipe: (id: string) => void;
  loadRecipes: () => void;
  setSelectedCuisine: (cuisine: string) => void;
  setFilters: (filters: { minProtein?: number; maxCalories?: number; query?: string }) => void;
  analyzeText: (
    text: string,
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  ) => MealAnalysisResult;
  analyzeTextAsync: (
    text: string,
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  ) => Promise<MealAnalysisResult>;
  clearAnalysis: () => void;
}

export const useNutritionStore = create<NutritionState>((set, get) => ({
  selectedDate: getTodayDateString(),
  meals: [],
  recipes: [],
  customRecipes: [],
  currentLog: null,
  selectedCuisine: 'All',
  filterProteinMin: 0,
  filterCalorieMax: 0,
  searchQuery: '',
  isLoading: false,
  isAnalyzing: false,
  lastAnalysisResult: null,

  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
    get().loadNutritionData(date);
  },

  loadNutritionData: (date?: string) => {
    const targetDate = date || get().selectedDate;
    set({ isLoading: true });
    try {
      const meals = MealRepository.getMealsByDate(targetDate);
      const recipes = RecipeRepository.getAllRecipes();
      const customRecipes = RecipeRepository.getCustomRecipes();
      const currentLog = DailyLogsRepository.getOrCreateLog(targetDate);
      set({
        meals: [...meals],
        recipes: [...recipes],
        customRecipes: [...customRecipes],
        currentLog: currentLog ? { ...currentLog } : null,
        isLoading: false,
      });
    } catch (e) {
      console.warn('Failed to load nutrition data from SQLite', e);
      set({ isLoading: false });
    }
  },

  logMeal: (mealData, items) => {
    try {
      MealRepository.createMeal(mealData, items);
      set({ selectedDate: mealData.date });
      get().loadNutritionData(mealData.date);
      // Synchronize dashboard store
      useDashboardStore.getState().loadDashboard();
      if (isSupabaseConfigured()) {
        SupabaseSyncService.syncAll().catch(() => {});
      }
    } catch (e) {
      console.error('Failed to create meal in SQLite', e);
    }
  },

  deleteMeal: async (mealId) => {
    try {
      MealRepository.deleteMeal(mealId);
      get().loadNutritionData(get().selectedDate);
      useDashboardStore.getState().loadDashboard();
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient();
        if (supabase) {
          try {
            await supabase.from('NutritionEstimates').delete().eq('meal_entry_id', mealId);
            await supabase.from('MealEntries').delete().eq('id', mealId);
          } catch {}
          SupabaseSyncService.syncAll().catch(() => {});
        }
      }
    } catch (e) {
      console.error('Failed to delete meal', e);
    }
  },

  updateEstimate: (estimateId, updates) => {
    try {
      MealRepository.updateEstimate(estimateId, updates);
      get().loadNutritionData(get().selectedDate);
      useDashboardStore.getState().loadDashboard();
      if (isSupabaseConfigured()) {
        SupabaseSyncService.syncAll().catch(() => {});
      }
    } catch (e) {
      console.error('Failed to update estimate', e);
    }
  },

  verifyMeal: (mealId) => {
    try {
      MealRepository.verifyMeal(mealId);
      get().loadNutritionData(get().selectedDate);
      if (isSupabaseConfigured()) {
        SupabaseSyncService.syncAll().catch(() => {});
      }
    } catch (e) {
      console.error('Failed to verify meal', e);
    }
  },

  logRecipeAsMeal: (recipe, mealType = 'lunch') => {
    const targetDate = get().selectedDate;
    const mealData: CreateMealInput = {
      date: targetDate,
      meal_type: mealType,
      raw_text: `${recipe.title} (${recipe.cuisine})`,
      total_calories: recipe.estimated_calories,
      total_protein: recipe.estimated_protein,
      total_carbs: recipe.estimated_carbs,
      total_fat: recipe.estimated_fat,
      confidence: 'high',
      is_verified_by_user: 1,
    };

    // Log composite recipe as a single verified entry with the recipe's exact verified macros,
    // rather than dividing totals equally across arbitrary ingredients (preventing the 70 kcal oregano bug).
    const items: CreateEstimateInput[] = [
      {
        food_name: recipe.title,
        quantity: 1,
        unit: 'serving',
        calories_estimated: recipe.estimated_calories,
        protein_estimated: recipe.estimated_protein,
        carbs_estimated: recipe.estimated_carbs,
        fat_estimated: recipe.estimated_fat,
        confidence_score: 'high',
        clarification_needed: 0,
      },
    ];

    get().logMeal(mealData, items);
  },

  createCustomRecipe: (data) => {
    const created = RecipeRepository.createCustomRecipe(data);
    const customRecipes = RecipeRepository.getCustomRecipes();
    const recipes = RecipeRepository.getAllRecipes();
    set({ customRecipes, recipes });
    return created;
  },

  deleteCustomRecipe: (id) => {
    RecipeRepository.deleteRecipe(id);
    const customRecipes = RecipeRepository.getCustomRecipes();
    const recipes = RecipeRepository.getAllRecipes();
    set({ customRecipes, recipes });
  },

  loadRecipes: () => {
    try {
      const recipes = RecipeRepository.filterRecipes({
        cuisine: get().selectedCuisine,
        maxCalories: get().filterCalorieMax > 0 ? get().filterCalorieMax : undefined,
        minProtein: get().filterProteinMin > 0 ? get().filterProteinMin : undefined,
        searchQuery: get().searchQuery,
      });
      set({ recipes });
    } catch (e) {
      console.warn('Failed to load filtered recipes', e);
    }
  },

  setSelectedCuisine: (cuisine: string) => {
    set({ selectedCuisine: cuisine });
    get().loadRecipes();
  },

  setFilters: (filters) => {
    set((state) => ({
      filterProteinMin: filters.minProtein !== undefined ? filters.minProtein : state.filterProteinMin,
      filterCalorieMax: filters.maxCalories !== undefined ? filters.maxCalories : state.filterCalorieMax,
      searchQuery: filters.query !== undefined ? filters.query : state.searchQuery,
    }));
    get().loadRecipes();
  },

  analyzeText: (text: string, mealType = 'lunch') => {
    const result = analyzeMeal(text, mealType);
    set({ lastAnalysisResult: result });
    return result;
  },

  analyzeTextAsync: async (text: string, mealType = 'lunch') => {
    set({ isAnalyzing: true });
    try {
      const result = await analyzeMealAsync(text, mealType);
      set({ lastAnalysisResult: result });
      return result;
    } finally {
      set({ isAnalyzing: false });
    }
  },

  clearAnalysis: () => {
    set({ lastAnalysisResult: null });
  },
}));
