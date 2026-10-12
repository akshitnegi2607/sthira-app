import { getDatabase } from '../db';
import { CuisineRecipe } from '../../types/database';

export interface RecipeFilterOptions {
  cuisine?: string;
  maxCalories?: number;
  minProtein?: number;
  searchQuery?: string;
}

export const RecipeRepository = {
  getAllRecipes(): CuisineRecipe[] {
    const db = getDatabase();
    return db.getAllSync<CuisineRecipe>('SELECT * FROM CuisineRecipes ORDER BY title ASC');
  },

  getRecipeById(id: string): CuisineRecipe | null {
    const db = getDatabase();
    return db.getFirstSync<CuisineRecipe>('SELECT * FROM CuisineRecipes WHERE id = ?', [id]);
  },

  getRecipesByCuisine(cuisine: string): CuisineRecipe[] {
    const db = getDatabase();
    if (cuisine === 'All') {
      return this.getAllRecipes();
    }
    return db.getAllSync<CuisineRecipe>(
      'SELECT * FROM CuisineRecipes WHERE cuisine = ? ORDER BY title ASC',
      [cuisine]
    );
  },

  filterRecipes(options: RecipeFilterOptions): CuisineRecipe[] {
    let recipes = this.getAllRecipes();

    if (options.cuisine && options.cuisine !== 'All') {
      recipes = recipes.filter(
        (r) => r.cuisine.toLowerCase() === options.cuisine!.toLowerCase()
      );
    }

    if (options.maxCalories && options.maxCalories > 0) {
      recipes = recipes.filter((r) => r.estimated_calories <= options.maxCalories!);
    }

    if (options.minProtein && options.minProtein > 0) {
      recipes = recipes.filter((r) => r.estimated_protein >= options.minProtein!);
    }

    if (options.searchQuery && options.searchQuery.trim().length > 0) {
      const q = options.searchQuery.toLowerCase().trim();
      recipes = recipes.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q)) ||
          r.cuisine.toLowerCase().includes(q)
      );
    }

    return recipes;
  },

  getCustomRecipes(): CuisineRecipe[] {
    const db = getDatabase();
    return db.getAllSync<CuisineRecipe>(
      "SELECT * FROM CuisineRecipes WHERE cuisine = 'Custom' ORDER BY created_at DESC"
    );
  },

  createCustomRecipe(data: {
    title: string;
    description?: string;
    estimated_calories: number;
    estimated_protein: number;
    estimated_carbs: number;
    estimated_fat: number;
    ingredients: { item: string; amount: string; calories?: number; protein?: number }[];
    instructions?: string;
  }): CuisineRecipe {
    const db = getDatabase();
    const now = new Date().toISOString();
    const id = `recipe_custom_${Date.now()}`;

    db.runSync(
      `INSERT INTO CuisineRecipes (
        id, cuisine, title, description, estimated_calories, estimated_protein,
        estimated_carbs, estimated_fat, ingredients_json, instructions,
        is_vegetarian, has_eggs, has_onion, has_garlic, has_mushrooms, created_at
      ) VALUES (?, 'Custom', ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 1, 1, 0, ?)`,
      [
        id,
        data.title,
        data.description || 'Custom crafted meal with ingredients',
        data.estimated_calories,
        data.estimated_protein,
        data.estimated_carbs,
        data.estimated_fat,
        JSON.stringify(data.ingredients),
        data.instructions || '',
        now,
      ]
    );

    return {
      id,
      cuisine: 'Custom',
      title: data.title,
      description: data.description || 'Custom crafted meal with ingredients',
      estimated_calories: data.estimated_calories,
      estimated_protein: data.estimated_protein,
      estimated_carbs: data.estimated_carbs,
      estimated_fat: data.estimated_fat,
      ingredients_json: JSON.stringify(data.ingredients),
      instructions: data.instructions || '',
      is_vegetarian: 1,
      has_eggs: 0,
      has_onion: 1,
      has_garlic: 1,
      has_mushrooms: 0,
      created_at: now,
    };
  },

  deleteRecipe(id: string): void {
    const db = getDatabase();
    db.runSync('DELETE FROM CuisineRecipes WHERE id = ?', [id]);
  },
};

