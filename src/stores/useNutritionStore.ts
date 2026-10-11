import { create } from 'zustand';
import {
  MealRepository,
  MealEntryWithEstimates,
  CreateMealInput,
  CreateEstimateInput,
} from '@/database/repositories/mealRepository';
import { RecipeRepository } from '@/database/repositories/recipeRepository';
import { CuisineRecipe, NutritionEstimate } from '@/types/database';
import { analyzeMeal, MealAnalysisResult } from '@/services/mealParser';
import { useDashboardStore } from './useDashboardStore';

interface NutritionState {
  selectedDate: string;
  meals: MealEntryWithEstimates[];
  recipes: CuisineRecipe[];
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
  loadRecipes: () => void;
  setSelectedCuisine: (cuisine: string) => void;
  setFilters: (filters: { minProtein?: number; maxCalories?: number; query?: string }) => void;
  analyzeText: (
    text: string,
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  ) => MealAnalysisResult;
  clearAnalysis: () => void;
}

const getTodayDateStr = () => new Date().toISOString().split('T')[0];

export const useNutritionStore = create<NutritionState>((set, get) => ({
  selectedDate: getTodayDateStr(),
  meals: [],
  recipes: [],
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
      set({ meals, recipes, isLoading: false });
    } catch (e) {
      console.warn('Failed to load nutrition data from SQLite', e);
      set({ isLoading: false });
    }
  },

  logMeal: (mealData, items) => {
    try {
      MealRepository.createMeal(mealData, items);
      get().loadNutritionData(mealData.date);
      // Synchronize dashboard store
      useDashboardStore.getState().loadDashboard();
    } catch (e) {
      console.error('Failed to create meal in SQLite', e);
    }
  },

  deleteMeal: (mealId) => {
    try {
      MealRepository.deleteMeal(mealId);
      get().loadNutritionData(get().selectedDate);
      useDashboardStore.getState().loadDashboard();
    } catch (e) {
      console.error('Failed to delete meal', e);
    }
  },

  updateEstimate: (estimateId, updates) => {
    try {
      MealRepository.updateEstimate(estimateId, updates);
      get().loadNutritionData(get().selectedDate);
      useDashboardStore.getState().loadDashboard();
    } catch (e) {
      console.error('Failed to update estimate', e);
    }
  },

  verifyMeal: (mealId) => {
    try {
      MealRepository.verifyMeal(mealId);
      get().loadNutritionData(get().selectedDate);
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

    let itemsJson: { item: string; amount: string }[] = [];
    try {
      itemsJson = JSON.parse(recipe.ingredients_json);
    } catch {
      itemsJson = [];
    }

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

  clearAnalysis: () => {
    set({ lastAnalysisResult: null });
  },
}));
