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
};
