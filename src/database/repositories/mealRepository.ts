import { getDatabase } from '../db';
import { MealEntry, NutritionEstimate, DailyLog } from '../../types/database';
import { DailyLogsRepository } from './dailyLogsRepository';

export interface MealEntryWithEstimates extends MealEntry {
  items: NutritionEstimate[];
}

export interface CreateMealInput {
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  raw_text: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  confidence: 'high' | 'medium' | 'low';
  is_verified_by_user?: number;
}

export interface CreateEstimateInput {
  food_name: string;
  quantity: number;
  unit: string;
  calories_estimated: number;
  protein_estimated: number;
  carbs_estimated: number;
  fat_estimated: number;
  confidence_score: 'high' | 'medium' | 'low';
  clarification_needed?: number;
}

export const MealRepository = {
  getMealsByDate(dateStr: string): MealEntryWithEstimates[] {
    const db = getDatabase();
    const meals = db.getAllSync<MealEntry>(
      'SELECT * FROM MealEntries WHERE date = ? ORDER BY created_at ASC',
      [dateStr]
    );

    return meals.map((meal) => {
      const items = db.getAllSync<NutritionEstimate>(
        'SELECT * FROM NutritionEstimates WHERE meal_entry_id = ? ORDER BY created_at ASC',
        [meal.id]
      );
      return {
        ...meal,
        items,
      };
    });
  },

  getMealById(id: string): MealEntryWithEstimates | null {
    const db = getDatabase();
    const meal = db.getFirstSync<MealEntry>(
      'SELECT * FROM MealEntries WHERE id = ?',
      [id]
    );
    if (!meal) return null;

    const items = db.getAllSync<NutritionEstimate>(
      'SELECT * FROM NutritionEstimates WHERE meal_entry_id = ? ORDER BY created_at ASC',
      [meal.id]
    );
    return { ...meal, items };
  },

  createMeal(mealData: CreateMealInput, items: CreateEstimateInput[]): MealEntryWithEstimates {
    const db = getDatabase();
    const now = new Date().toISOString();
    const mealId = `meal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    db.runSync(
      `INSERT INTO MealEntries (
        id, date, meal_type, raw_text, total_calories, total_protein,
        total_carbs, total_fat, confidence, is_verified_by_user, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        mealId,
        mealData.date,
        mealData.meal_type,
        mealData.raw_text,
        mealData.total_calories,
        mealData.total_protein,
        mealData.total_carbs,
        mealData.total_fat,
        mealData.confidence,
        mealData.is_verified_by_user ?? 0,
        now,
      ]
    );

    const createdEstimates: NutritionEstimate[] = [];
    items.forEach((item, idx) => {
      const estId = `est_${mealId}_${idx}`;
      db.runSync(
        `INSERT INTO NutritionEstimates (
          id, meal_entry_id, food_name, quantity, unit,
          calories_estimated, protein_estimated, carbs_estimated, fat_estimated,
          confidence_score, clarification_needed, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          estId,
          mealId,
          item.food_name,
          item.quantity,
          item.unit,
          item.calories_estimated,
          item.protein_estimated,
          item.carbs_estimated,
          item.fat_estimated,
          item.confidence_score,
          item.clarification_needed ?? 0,
          now,
        ]
      );
      createdEstimates.push({
        id: estId,
        meal_entry_id: mealId,
        food_name: item.food_name,
        quantity: item.quantity,
        unit: item.unit,
        calories_estimated: item.calories_estimated,
        protein_estimated: item.protein_estimated,
        carbs_estimated: item.carbs_estimated,
        fat_estimated: item.fat_estimated,
        confidence_score: item.confidence_score,
        clarification_needed: item.clarification_needed ?? 0,
        created_at: now,
      });
    });

    // Automatically recalculate and sync DailyLogs for this date
    this.syncDailyLogTotals(mealData.date);

    return {
      id: mealId,
      date: mealData.date,
      meal_type: mealData.meal_type,
      raw_text: mealData.raw_text,
      total_calories: mealData.total_calories,
      total_protein: mealData.total_protein,
      total_carbs: mealData.total_carbs,
      total_fat: mealData.total_fat,
      confidence: mealData.confidence,
      is_verified_by_user: mealData.is_verified_by_user ?? 0,
      created_at: now,
      items: createdEstimates,
    };
  },

  deleteMeal(mealId: string): void {
    const db = getDatabase();
    const meal = db.getFirstSync<MealEntry>('SELECT * FROM MealEntries WHERE id = ?', [mealId]);
    if (!meal) return;

    db.runSync('DELETE FROM NutritionEstimates WHERE meal_entry_id = ?', [mealId]);
    db.runSync('DELETE FROM MealEntries WHERE id = ?', [mealId]);

    // Recalculate daily totals
    this.syncDailyLogTotals(meal.date);
  },

  updateEstimate(estimateId: string, updates: Partial<NutritionEstimate>): void {
    const db = getDatabase();
    const current = db.getFirstSync<NutritionEstimate>(
      'SELECT * FROM NutritionEstimates WHERE id = ?',
      [estimateId]
    );
    if (!current) return;

    const merged = { ...current, ...updates };

    db.runSync(
      `UPDATE NutritionEstimates SET
        food_name = ?, quantity = ?, unit = ?, calories_estimated = ?,
        protein_estimated = ?, carbs_estimated = ?, fat_estimated = ?,
        confidence_score = ?, clarification_needed = ?
      WHERE id = ?`,
      [
        merged.food_name,
        merged.quantity,
        merged.unit,
        merged.calories_estimated,
        merged.protein_estimated,
        merged.carbs_estimated,
        merged.fat_estimated,
        merged.confidence_score,
        merged.clarification_needed,
        estimateId,
      ]
    );

    // Recalculate parent MealEntry totals
    const siblingEstimates = db.getAllSync<NutritionEstimate>(
      'SELECT * FROM NutritionEstimates WHERE meal_entry_id = ?',
      [current.meal_entry_id]
    );

    const newCal = siblingEstimates.reduce((sum, item) => sum + item.calories_estimated, 0);
    const newPro = siblingEstimates.reduce((sum, item) => sum + item.protein_estimated, 0);
    const newCarbs = siblingEstimates.reduce((sum, item) => sum + item.carbs_estimated, 0);
    const newFat = siblingEstimates.reduce((sum, item) => sum + item.fat_estimated, 0);

    db.runSync(
      `UPDATE MealEntries SET
        total_calories = ?, total_protein = ?, total_carbs = ?, total_fat = ?, is_verified_by_user = 1
      WHERE id = ?`,
      [
        Math.round(newCal),
        Math.round(newPro * 10) / 10,
        Math.round(newCarbs * 10) / 10,
        Math.round(newFat * 10) / 10,
        current.meal_entry_id,
      ]
    );

    const meal = db.getFirstSync<MealEntry>('SELECT * FROM MealEntries WHERE id = ?', [current.meal_entry_id]);
    if (meal) {
      this.syncDailyLogTotals(meal.date);
    }
  },

  verifyMeal(mealId: string): void {
    const db = getDatabase();
    db.runSync('UPDATE MealEntries SET is_verified_by_user = 1 WHERE id = ?', [mealId]);
  },

  syncDailyLogTotals(dateStr: string): void {
    const db = getDatabase();
    const meals = db.getAllSync<MealEntry>('SELECT * FROM MealEntries WHERE date = ?', [dateStr]);

    const totalCal = Math.round(meals.reduce((sum, m) => sum + m.total_calories, 0));
    const totalPro = Math.round(meals.reduce((sum, m) => sum + m.total_protein, 0) * 10) / 10;
    const totalCarbs = Math.round(meals.reduce((sum, m) => sum + m.total_carbs, 0) * 10) / 10;
    const totalFat = Math.round(meals.reduce((sum, m) => sum + m.total_fat, 0) * 10) / 10;

    DailyLogsRepository.updateDailyLog(dateStr, {
      calories_consumed: totalCal,
      protein_consumed: totalPro,
      carbs_consumed: totalCarbs,
      fat_consumed: totalFat,
    });
  },
};
