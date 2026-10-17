import { INITIAL_FOOD_DATABASE, SeedFoodItem } from '../constants/initialFoods';
import { FoodItem } from '../types/database';
import { getDatabase } from '../database/db';

export interface ParsedItemResult {
  id: string;
  food_name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence_score: 'high' | 'medium' | 'low';
  clarification_needed: number;
  clarification_reason?: string;
}

export interface MealAnalysisResult {
  rawText: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: ParsedItemResult[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  confidence: 'high' | 'medium' | 'low';
  warnings: string[];
}

interface FoodAliasMap {
  foodId: string;
  canonicalName: string;
  aliases: string[];
  defaultUnit: string;
  defaultQty: number;
  baseCalories: number;
  baseProtein: number;
  baseCarbs: number;
  baseFat: number;
  baseServingGrams?: number;
}

// Built-in aliases and nutrition profiles for Jay's staples
const FOOD_RULES: FoodAliasMap[] = [
  {
    foodId: 'food_paneer_100g',
    canonicalName: 'Paneer (Raw / Low Fat)',
    aliases: ['paneer', 'cottage cheese', 'panir', 'low fat paneer', 'raw paneer'],
    defaultUnit: 'g',
    defaultQty: 100,
    baseCalories: 265,
    baseProtein: 18.3,
    baseCarbs: 3.5,
    baseFat: 20.0,
    baseServingGrams: 100,
  },
  {
    foodId: 'food_besan_chilla',
    canonicalName: 'Besan Chilla',
    aliases: ['besan chilla', 'besan cheela', 'chilla', 'cheela', 'gram flour pancake'],
    defaultUnit: 'piece',
    defaultQty: 1,
    baseCalories: 140,
    baseProtein: 6.2,
    baseCarbs: 18.0,
    baseFat: 4.5,
    baseServingGrams: 80,
  },
  {
    foodId: 'food_yellow_dal',
    canonicalName: 'Yellow Dal Tadka',
    aliases: ['yellow dal', 'dal tadka', 'dal', 'daal', 'toor dal', 'moong dal', 'lentil soup'],
    defaultUnit: 'katori',
    defaultQty: 1,
    baseCalories: 180,
    baseProtein: 9.5,
    baseCarbs: 26.0,
    baseFat: 4.0,
    baseServingGrams: 180,
  },
  {
    foodId: 'food_rajma_curry',
    canonicalName: 'Rajma Masala (Kidney Beans)',
    aliases: ['rajma masala', 'rajma', 'rajmah', 'kidney bean curry', 'kidney beans'],
    defaultUnit: 'cup',
    defaultQty: 1,
    baseCalories: 220,
    baseProtein: 11.5,
    baseCarbs: 32.0,
    baseFat: 5.0,
    baseServingGrams: 200,
  },
  {
    foodId: 'food_chole_chickpeas',
    canonicalName: 'Chole (Spiced Chickpea Curry)',
    aliases: ['chole', 'chickpeas', 'chickpea curry', 'chana masala', 'kabuli chana'],
    defaultUnit: 'cup',
    defaultQty: 1,
    baseCalories: 240,
    baseProtein: 12.0,
    baseCarbs: 35.0,
    baseFat: 6.0,
    baseServingGrams: 200,
  },
  {
    foodId: 'food_soy_chunks_cooked',
    canonicalName: 'Soy Chunks (Cooked / Soya Badi)',
    aliases: ['soya chunks', 'soy chunks', 'soya badi', 'nutrela', 'soya'],
    defaultUnit: 'g',
    defaultQty: 100,
    baseCalories: 155,
    baseProtein: 26.0,
    baseCarbs: 10.0,
    baseFat: 1.0,
    baseServingGrams: 100,
  },
  {
    foodId: 'food_roti_chapati',
    canonicalName: 'Roti / Chapati (Whole Wheat)',
    aliases: ['roti', 'rotis', 'chapati', 'chapatis', 'phulka', 'fulka'],
    defaultUnit: 'piece',
    defaultQty: 1,
    baseCalories: 105,
    baseProtein: 3.2,
    baseCarbs: 20.0,
    baseFat: 1.0,
    baseServingGrams: 40,
  },
  {
    foodId: 'food_plain_curd',
    canonicalName: 'Curd / Dahi (Plain Whole Milk)',
    aliases: ['curd', 'dahi', 'plain curd', 'plain dahi', 'yogurt'],
    defaultUnit: 'cup',
    defaultQty: 1,
    baseCalories: 100,
    baseProtein: 5.5,
    baseCarbs: 7.0,
    baseFat: 5.0,
    baseServingGrams: 150,
  },
  {
    foodId: 'food_greek_yogurt_plain',
    canonicalName: 'Greek Yogurt (Plain High Protein)',
    aliases: ['greek yogurt', 'hung curd', 'high protein yogurt'],
    defaultUnit: 'g',
    defaultQty: 150,
    baseCalories: 130,
    baseProtein: 15.0,
    baseCarbs: 6.0,
    baseFat: 4.0,
    baseServingGrams: 150,
  },
  {
    foodId: 'food_steamed_rice',
    canonicalName: 'White Basmati Rice (Cooked)',
    aliases: ['basmati rice', 'white rice', 'rice', 'steamed rice', 'chawal'],
    defaultUnit: 'cup',
    defaultQty: 1,
    baseCalories: 210,
    baseProtein: 4.3,
    baseCarbs: 45.0,
    baseFat: 0.5,
    baseServingGrams: 160,
  },
  {
    foodId: 'food_poha',
    canonicalName: 'Poha (Flattened Rice with Veggies)',
    aliases: ['poha', 'flattened rice'],
    defaultUnit: 'plate',
    defaultQty: 1,
    baseCalories: 230,
    baseProtein: 4.5,
    baseCarbs: 40.0,
    baseFat: 5.5,
    baseServingGrams: 180,
  },
  {
    foodId: 'food_banana',
    canonicalName: 'Banana (Medium Fresh)',
    aliases: ['banana', 'bananas', 'kela'],
    defaultUnit: 'piece',
    defaultQty: 1,
    baseCalories: 105,
    baseProtein: 1.3,
    baseCarbs: 27.0,
    baseFat: 0.3,
    baseServingGrams: 118,
  },
  {
    foodId: 'food_black_beans_cooked',
    canonicalName: 'Black Beans (Cooked)',
    aliases: ['black beans', 'cooked black beans', 'frijoles'],
    defaultUnit: 'cup',
    defaultQty: 1,
    baseCalories: 227,
    baseProtein: 15.2,
    baseCarbs: 40.8,
    baseFat: 0.9,
    baseServingGrams: 172,
  },
  {
    foodId: 'food_corn_tortilla',
    canonicalName: 'Corn Tortilla',
    aliases: ['corn tortilla', 'tortilla', 'tortillas'],
    defaultUnit: 'piece',
    defaultQty: 1,
    baseCalories: 60,
    baseProtein: 1.5,
    baseCarbs: 12.0,
    baseFat: 0.75,
    baseServingGrams: 28,
  },
  {
    foodId: 'food_avocado_medium',
    canonicalName: 'Avocado (Fresh Hass)',
    aliases: ['avocado', 'hass avocado', 'guacamole'],
    defaultUnit: 'piece',
    defaultQty: 0.5,
    baseCalories: 120,
    baseProtein: 1.5,
    baseCarbs: 6.0,
    baseFat: 11.0,
    baseServingGrams: 75,
  },
  {
    foodId: 'food_hummus_classic',
    canonicalName: 'Classic Hummus',
    aliases: ['classic hummus', 'hummus'],
    defaultUnit: 'tbsp',
    defaultQty: 2,
    baseCalories: 140,
    baseProtein: 4.0,
    baseCarbs: 10.0,
    baseFat: 9.0,
    baseServingGrams: 60,
  },
  {
    foodId: 'food_falafel_baked',
    canonicalName: 'Falafel (Baked Chickpea Patties)',
    aliases: ['falafel', 'falafels', 'baked falafel'],
    defaultUnit: 'piece',
    defaultQty: 3,
    baseCalories: 210,
    baseProtein: 8.0,
    baseCarbs: 24.0,
    baseFat: 8.5,
    baseServingGrams: 90,
  },
  {
    foodId: 'food_halloumi_grilled',
    canonicalName: 'Grilled Halloumi Cheese',
    aliases: ['halloumi', 'grilled halloumi', 'halloumi cheese'],
    defaultUnit: 'g',
    defaultQty: 50,
    baseCalories: 160,
    baseProtein: 10.5,
    baseCarbs: 1.0,
    baseFat: 13.0,
    baseServingGrams: 50,
  },
  {
    foodId: 'food_whole_wheat_pasta',
    canonicalName: 'Whole Wheat Pasta (Cooked)',
    aliases: ['whole wheat pasta', 'pasta', 'penne', 'rigatoni', 'spaghetti'],
    defaultUnit: 'cup',
    defaultQty: 1,
    baseCalories: 174,
    baseProtein: 7.5,
    baseCarbs: 37.0,
    baseFat: 0.8,
    baseServingGrams: 140,
  },
  {
    foodId: 'food_lentil_bolognese',
    canonicalName: 'Red Lentil Bolognese Sauce',
    aliases: ['red lentil bolognese', 'lentil bolognese', 'lentil sauce'],
    defaultUnit: 'cup',
    defaultQty: 1,
    baseCalories: 190,
    baseProtein: 11.0,
    baseCarbs: 28.0,
    baseFat: 3.5,
    baseServingGrams: 200,
  },
  {
    foodId: 'food_firm_tofu',
    canonicalName: 'Firm Tofu (Pan-seared)',
    aliases: ['firm tofu', 'tofu', 'tofu cubes', 'pan-seared tofu'],
    defaultUnit: 'g',
    defaultQty: 100,
    baseCalories: 144,
    baseProtein: 15.5,
    baseCarbs: 3.0,
    baseFat: 8.0,
    baseServingGrams: 100,
  },
  {
    foodId: 'food_edamame_steamed',
    canonicalName: 'Edamame (Steamed in Pods)',
    aliases: ['edamame', 'steamed edamame', 'soybeans'],
    defaultUnit: 'cup',
    defaultQty: 1,
    baseCalories: 188,
    baseProtein: 18.4,
    baseCarbs: 13.8,
    baseFat: 8.0,
    baseServingGrams: 155,
  },
  {
    foodId: 'food_peanut_butter',
    canonicalName: 'Peanut Butter (Natural 100%)',
    aliases: ['peanut butter', 'pb'],
    defaultUnit: 'tbsp',
    defaultQty: 1,
    baseCalories: 95,
    baseProtein: 4.0,
    baseCarbs: 3.0,
    baseFat: 8.0,
    baseServingGrams: 16,
  },
  {
    foodId: 'food_rolled_oats',
    canonicalName: 'Rolled Oats (Dry)',
    aliases: ['oats', 'rolled oats', 'oatmeal', 'quick oats'],
    defaultUnit: 'g',
    defaultQty: 40,
    baseCalories: 150,
    baseProtein: 5.5,
    baseCarbs: 27.0,
    baseFat: 2.5,
    baseServingGrams: 40,
  },
  {
    foodId: 'food_whey_protein',
    canonicalName: 'Whey Protein Powder',
    aliases: ['whey', 'whey protein', 'protein powder', 'plant protein', 'isolate', 'protein shake'],
    defaultUnit: 'scoop',
    defaultQty: 1,
    baseCalories: 120,
    baseProtein: 24.0,
    baseCarbs: 2.0,
    baseFat: 1.5,
    baseServingGrams: 30,
  },
  {
    foodId: 'food_milk_toned',
    canonicalName: 'Milk (Cow / Toned)',
    aliases: ['milk', 'toned milk', 'cow milk', 'whole milk', 'doodh'],
    defaultUnit: 'ml',
    defaultQty: 200,
    baseCalories: 125,
    baseProtein: 6.5,
    baseCarbs: 9.5,
    baseFat: 6.0,
    baseServingGrams: 200,
  },
  {
    foodId: 'food_almond_milk',
    canonicalName: 'Almond Milk (Unsweetened)',
    aliases: ['almond milk', 'soy milk', 'oat milk'],
    defaultUnit: 'ml',
    defaultQty: 200,
    baseCalories: 60,
    baseProtein: 3.0,
    baseCarbs: 3.0,
    baseFat: 3.5,
    baseServingGrams: 200,
  },
  {
    foodId: 'food_ghee',
    canonicalName: 'Pure Desi Ghee / Butter',
    aliases: ['ghee', 'desi ghee', 'butter', 'makhan', 'olive oil'],
    defaultUnit: 'tsp',
    defaultQty: 1,
    baseCalories: 45,
    baseProtein: 0.0,
    baseCarbs: 0.0,
    baseFat: 5.0,
    baseServingGrams: 5,
  },
  {
    foodId: 'food_almonds_nuts',
    canonicalName: 'Almonds & Nuts (Raw)',
    aliases: ['almonds', 'almond', 'badam', 'walnuts', 'cashews', 'mixed nuts'],
    defaultUnit: 'piece',
    defaultQty: 10,
    baseCalories: 70,
    baseProtein: 2.5,
    baseCarbs: 2.5,
    baseFat: 6.0,
    baseServingGrams: 12,
  },
  {
    foodId: 'food_chia_seeds',
    canonicalName: 'Chia Seeds',
    aliases: ['chia seeds', 'chia seed', 'flax seeds', 'flaxseed'],
    defaultUnit: 'tbsp',
    defaultQty: 1,
    baseCalories: 60,
    baseProtein: 2.0,
    baseCarbs: 5.0,
    baseFat: 4.0,
    baseServingGrams: 12,
  },
  {
    foodId: 'food_bread_toast',
    canonicalName: 'Whole Wheat Bread / Toast',
    aliases: ['bread', 'toast', 'whole wheat bread', 'brown bread', 'multigrain bread', 'slice bread'],
    defaultUnit: 'slice',
    defaultQty: 2,
    baseCalories: 150,
    baseProtein: 7.0,
    baseCarbs: 28.0,
    baseFat: 2.0,
    baseServingGrams: 60,
  },
  {
    foodId: 'food_paneer_bhurji',
    canonicalName: 'Spiced Paneer Bhurji',
    aliases: ['paneer bhurji', 'paneer scramble', 'scrambled paneer'],
    defaultUnit: 'g',
    defaultQty: 100,
    baseCalories: 285,
    baseProtein: 18.0,
    baseCarbs: 5.0,
    baseFat: 22.0,
    baseServingGrams: 100,
  },
  {
    foodId: 'food_khichdi',
    canonicalName: 'Moong Dal Khichdi',
    aliases: ['khichdi', 'dal khichdi', 'moong dal khichdi', 'kichdi'],
    defaultUnit: 'bowl',
    defaultQty: 1,
    baseCalories: 275,
    baseProtein: 9.0,
    baseCarbs: 45.0,
    baseFat: 6.0,
    baseServingGrams: 250,
  },
  {
    foodId: 'food_apple',
    canonicalName: 'Apple (Fresh Medium)',
    aliases: ['apple', 'apples', 'seb'],
    defaultUnit: 'piece',
    defaultQty: 1,
    baseCalories: 95,
    baseProtein: 0.5,
    baseCarbs: 25.0,
    baseFat: 0.3,
    baseServingGrams: 180,
  },
  {
    foodId: 'food_tea_chai',
    canonicalName: 'Indian Masala Chai / Milk Tea',
    aliases: ['chai', 'tea', 'masala chai', 'milk tea'],
    defaultUnit: 'cup',
    defaultQty: 1,
    baseCalories: 75,
    baseProtein: 2.0,
    baseCarbs: 9.0,
    baseFat: 3.0,
    baseServingGrams: 150,
  },
  {
    foodId: 'food_black_coffee',
    canonicalName: 'Black Coffee (Espresso / Americano)',
    aliases: ['coffee', 'black coffee', 'espresso', 'americano'],
    defaultUnit: 'cup',
    defaultQty: 1,
    baseCalories: 5,
    baseProtein: 0.3,
    baseCarbs: 0.5,
    baseFat: 0.0,
    baseServingGrams: 200,
  },
  {
    foodId: 'food_peanuts',
    canonicalName: 'Peanuts / Groundnuts',
    aliases: ['peanuts', 'peanut', 'groundnuts', 'moongphali', 'singdana', 'roasted peanuts'],
    defaultUnit: 'g',
    defaultQty: 30,
    baseCalories: 567,
    baseProtein: 25.8,
    baseCarbs: 16.1,
    baseFat: 49.2,
    baseServingGrams: 100,
  },
  {
    foodId: 'food_kiwi',
    canonicalName: 'Kiwi (Fresh)',
    aliases: ['kiwi', 'kiwis'],
    defaultUnit: 'piece',
    defaultQty: 1,
    baseCalories: 42,
    baseProtein: 0.8,
    baseCarbs: 10.1,
    baseFat: 0.4,
    baseServingGrams: 70,
  },
  {
    foodId: 'food_grapes',
    canonicalName: 'Grapes (Fresh Green / Black)',
    aliases: ['grapes', 'grape', 'angoor'],
    defaultUnit: 'cup',
    defaultQty: 1,
    baseCalories: 104,
    baseProtein: 1.1,
    baseCarbs: 27.3,
    baseFat: 0.2,
    baseServingGrams: 150,
  },
  {
    foodId: 'food_orange',
    canonicalName: 'Orange (Fresh Medium)',
    aliases: ['orange', 'oranges', 'santra', 'tangerine', 'clementine'],
    defaultUnit: 'piece',
    defaultQty: 1,
    baseCalories: 62,
    baseProtein: 1.2,
    baseCarbs: 15.4,
    baseFat: 0.2,
    baseServingGrams: 130,
  },
  {
    foodId: 'food_banana',
    canonicalName: 'Banana (Medium Fresh)',
    aliases: ['banana', 'bananas', 'kela'],
    defaultUnit: 'piece',
    defaultQty: 1,
    baseCalories: 105,
    baseProtein: 1.3,
    baseCarbs: 27.0,
    baseFat: 0.3,
    baseServingGrams: 118,
  },
  {
    foodId: 'food_broccoli',
    canonicalName: 'Broccoli (Steamed / Florets)',
    aliases: ['broccoli', 'steamed broccoli'],
    defaultUnit: 'cup',
    defaultQty: 1,
    baseCalories: 31,
    baseProtein: 2.6,
    baseCarbs: 6.0,
    baseFat: 0.3,
    baseServingGrams: 90,
  },
  {
    foodId: 'food_capsicum',
    canonicalName: 'Bell Peppers / Capsicum',
    aliases: ['capsicum', 'bell pepper', 'bell peppers', 'green pepper', 'red pepper', 'shimla mirch'],
    defaultUnit: 'cup',
    defaultQty: 1,
    baseCalories: 30,
    baseProtein: 1.2,
    baseCarbs: 7.0,
    baseFat: 0.3,
    baseServingGrams: 100,
  },
  {
    foodId: 'food_mixed_veg',
    canonicalName: 'Mixed Vegetables Curry / Sabzi',
    aliases: ['mixed vegetables', 'mixed veg', 'mixed vegetables curry', 'sabzi', 'mixed sabzi'],
    defaultUnit: 'katori',
    defaultQty: 1,
    baseCalories: 120,
    baseProtein: 3.5,
    baseCarbs: 16.0,
    baseFat: 5.0,
    baseServingGrams: 180,
  },
  {
    foodId: 'food_vermicelli',
    canonicalName: 'Vermicelli Upma / Sevai',
    aliases: ['vermicelli', 'semiya', 'sevai', 'vermicelli upma'],
    defaultUnit: 'bowl',
    defaultQty: 1,
    baseCalories: 180,
    baseProtein: 4.5,
    baseCarbs: 34.0,
    baseFat: 3.5,
    baseServingGrams: 150,
  },
  {
    foodId: 'food_kheer',
    canonicalName: 'Rice Kheer / Payasam',
    aliases: ['kheer', 'payasam', 'rice kheer', 'seviyan kheer'],
    defaultUnit: 'bowl',
    defaultQty: 1,
    baseCalories: 220,
    baseProtein: 5.5,
    baseCarbs: 34.0,
    baseFat: 7.0,
    baseServingGrams: 150,
  },
  {
    foodId: 'food_macaroni',
    canonicalName: 'Macaroni / Pasta (Cooked)',
    aliases: ['macaroni', 'macroni', 'pasta', 'cooked pasta', 'penne'],
    defaultUnit: 'cup',
    defaultQty: 1,
    baseCalories: 180,
    baseProtein: 6.0,
    baseCarbs: 36.0,
    baseFat: 1.2,
    baseServingGrams: 140,
  },
  {
    foodId: 'food_moong_chilla',
    canonicalName: 'Moong Dal Chilla',
    aliases: ['moong dal chilla', 'moong daal chilla', 'moong chilla', 'moong cheela'],
    defaultUnit: 'piece',
    defaultQty: 1,
    baseCalories: 130,
    baseProtein: 7.5,
    baseCarbs: 17.0,
    baseFat: 3.5,
    baseServingGrams: 80,
  },
  {
    foodId: 'food_tofu_burger',
    canonicalName: 'Tofu Veggie Burger',
    aliases: ['tofu burger', 'veggie burger', 'burger'],
    defaultUnit: 'piece',
    defaultQty: 1,
    baseCalories: 340,
    baseProtein: 18.0,
    baseCarbs: 38.0,
    baseFat: 12.0,
    baseServingGrams: 200,
  },
  {
    foodId: 'food_apple',
    canonicalName: 'Apple (Fresh Medium)',
    aliases: ['apple', 'apples', 'seb'],
    defaultUnit: 'piece',
    defaultQty: 1,
    baseCalories: 95,
    baseProtein: 0.5,
    baseCarbs: 25.0,
    baseFat: 0.3,
    baseServingGrams: 182,
  },
  {
    foodId: 'food_whole_milk',
    canonicalName: 'Whole Milk (Full Cream)',
    aliases: ['milk', 'whole milk', 'full cream milk', 'doodh', 'glass of milk'],
    defaultUnit: 'cup',
    defaultQty: 1,
    baseCalories: 150,
    baseProtein: 8.0,
    baseCarbs: 12.0,
    baseFat: 8.0,
    baseServingGrams: 244,
  },
  {
    foodId: 'food_skim_milk',
    canonicalName: 'Skim / Low-Fat Milk',
    aliases: ['skim milk', 'low fat milk', 'toned milk', 'double toned milk'],
    defaultUnit: 'cup',
    defaultQty: 1,
    baseCalories: 90,
    baseProtein: 8.5,
    baseCarbs: 12.0,
    baseFat: 1.0,
    baseServingGrams: 245,
  },
  {
    foodId: 'food_whey_protein',
    canonicalName: 'Whey Protein Powder',
    aliases: ['whey', 'whey protein', 'protein powder', 'protein shake', 'whey isolate'],
    defaultUnit: 'scoop',
    defaultQty: 1,
    baseCalories: 120,
    baseProtein: 24.0,
    baseCarbs: 2.5,
    baseFat: 1.5,
    baseServingGrams: 30,
  },
  {
    foodId: 'food_oats',
    canonicalName: 'Rolled Oats / Oatmeal',
    aliases: ['oats', 'oatmeal', 'rolled oats', 'porridge'],
    defaultUnit: 'cup',
    defaultQty: 1,
    baseCalories: 150,
    baseProtein: 5.5,
    baseCarbs: 27.0,
    baseFat: 2.5,
    baseServingGrams: 150,
  },
  {
    foodId: 'food_wheat_bread',
    canonicalName: 'Whole Wheat Bread / Toast',
    aliases: ['bread', 'wheat bread', 'brown bread', 'toast', 'slice of bread'],
    defaultUnit: 'slice',
    defaultQty: 1,
    baseCalories: 75,
    baseProtein: 3.5,
    baseCarbs: 13.5,
    baseFat: 1.0,
    baseServingGrams: 30,
  },
  {
    foodId: 'food_peanut_butter',
    canonicalName: 'Peanut Butter (Natural)',
    aliases: ['peanut butter', 'pb'],
    defaultUnit: 'tbsp',
    defaultQty: 1,
    baseCalories: 95,
    baseProtein: 4.0,
    baseCarbs: 3.5,
    baseFat: 8.0,
    baseServingGrams: 16,
  },
  {
    foodId: 'food_almonds',
    canonicalName: 'Almonds (Raw / Roasted)',
    aliases: ['almonds', 'almond', 'badam'],
    defaultUnit: 'g',
    defaultQty: 25,
    baseCalories: 145,
    baseProtein: 5.3,
    baseCarbs: 5.4,
    baseFat: 12.5,
    baseServingGrams: 25,
  },
  {
    foodId: 'food_idli',
    canonicalName: 'Idli (Steamed Rice & Lentil Cake)',
    aliases: ['idli', 'idlis', 'steamed idli'],
    defaultUnit: 'piece',
    defaultQty: 2,
    baseCalories: 120,
    baseProtein: 4.0,
    baseCarbs: 24.0,
    baseFat: 0.8,
    baseServingGrams: 100,
  },
  {
    foodId: 'food_plain_dosa',
    canonicalName: 'Plain Dosa',
    aliases: ['dosa', 'plain dosa', 'sada dosa'],
    defaultUnit: 'piece',
    defaultQty: 1,
    baseCalories: 135,
    baseProtein: 3.5,
    baseCarbs: 24.0,
    baseFat: 3.0,
    baseServingGrams: 90,
  },
  {
    foodId: 'food_masala_dosa',
    canonicalName: 'Masala Dosa',
    aliases: ['masala dosa'],
    defaultUnit: 'piece',
    defaultQty: 1,
    baseCalories: 250,
    baseProtein: 5.5,
    baseCarbs: 40.0,
    baseFat: 8.0,
    baseServingGrams: 160,
  },
  {
    foodId: 'food_sambar',
    canonicalName: 'Sambar (Lentil & Vegetable Stew)',
    aliases: ['sambar', 'sambhar'],
    defaultUnit: 'katori',
    defaultQty: 1,
    baseCalories: 120,
    baseProtein: 5.0,
    baseCarbs: 18.0,
    baseFat: 3.0,
    baseServingGrams: 180,
  },
  {
    foodId: 'food_palak_paneer',
    canonicalName: 'Palak Paneer (Spinach & Cottage Cheese)',
    aliases: ['palak paneer', 'spinach paneer', 'saag paneer'],
    defaultUnit: 'cup',
    defaultQty: 1,
    baseCalories: 240,
    baseProtein: 14.0,
    baseCarbs: 8.0,
    baseFat: 17.0,
    baseServingGrams: 200,
  },
  {
    foodId: 'food_dal_makhani',
    canonicalName: 'Dal Makhani (Black Lentils)',
    aliases: ['dal makhani', 'daal makhani', 'makhani dal', 'maa ki dal'],
    defaultUnit: 'cup',
    defaultQty: 1,
    baseCalories: 260,
    baseProtein: 9.0,
    baseCarbs: 28.0,
    baseFat: 12.0,
    baseServingGrams: 200,
  },
  {
    foodId: 'food_veg_pulao',
    canonicalName: 'Vegetable Pulao / Biryani',
    aliases: ['pulao', 'veg pulao', 'vegetable pulao', 'veg biryani', 'vegetable biryani'],
    defaultUnit: 'cup',
    defaultQty: 1,
    baseCalories: 220,
    baseProtein: 4.5,
    baseCarbs: 42.0,
    baseFat: 4.0,
    baseServingGrams: 180,
  },
  {
    foodId: 'food_paratha_plain',
    canonicalName: 'Paratha (Whole Wheat Plain / Stuffed)',
    aliases: ['paratha', 'paranthas', 'aloo paratha', 'gobi paratha', 'paneer paratha'],
    defaultUnit: 'piece',
    defaultQty: 1,
    baseCalories: 210,
    baseProtein: 4.5,
    baseCarbs: 32.0,
    baseFat: 7.5,
    baseServingGrams: 90,
  },
  {
    foodId: 'food_veg_sandwich',
    canonicalName: 'Vegetable Sandwich',
    aliases: ['sandwich', 'veg sandwich', 'vegetable sandwich', 'cheese sandwich', 'paneer sandwich'],
    defaultUnit: 'piece',
    defaultQty: 1,
    baseCalories: 240,
    baseProtein: 7.0,
    baseCarbs: 36.0,
    baseFat: 7.0,
    baseServingGrams: 160,
  },
  {
    foodId: 'food_khichdi',
    canonicalName: 'Moong Dal Khichdi',
    aliases: ['khichdi', 'khichri', 'dal khichdi'],
    defaultUnit: 'bowl',
    defaultQty: 1,
    baseCalories: 200,
    baseProtein: 7.0,
    baseCarbs: 36.0,
    baseFat: 3.5,
    baseServingGrams: 200,
  },
];

/**
 * Normalizes number words to numerical values
 */
function parseQuantityWord(word: string): number | null {
  const clean = word.toLowerCase().trim();
  const numMap: Record<string, number> = {
    'one': 1,
    'two': 2,
    'three': 3,
    'four': 4,
    'five': 5,
    'six': 6,
    'seven': 7,
    'eight': 8,
    'nine': 9,
    'ten': 10,
    'half': 0.5,
    'quarter': 0.25,
    '1/2': 0.5,
    '1/4': 0.25,
    '3/4': 0.75,
    '1.5': 1.5,
    '2.5': 2.5,
    'a': 1,
    'an': 1,
  };
  if (numMap[clean] !== undefined) return numMap[clean];

  const parsed = parseFloat(clean);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Checks for dietary exclusions per Jay's profile:
 * - Eggs: NO
 * - Mushrooms: NO
 * - Non-veg: NO
 */
export function checkDietaryViolations(text: string): string[] {
  const warnings: string[] = [];
  const lower = text.toLowerCase();

  // Egg check
  const eggRegex = /\b(egg|eggs|anda|omelet|omelette|bhurji egg|scrambled egg|boiled egg|poached egg|egg white|egg whites)\b/i;
  if (eggRegex.test(lower)) {
    warnings.push('⚠️ Dietary Alert: Eggs detected! Jay has strictly excluded eggs in his profile.');
  }

  // Mushroom check
  const mushroomRegex = /\b(mushroom|mushrooms|khumb|cremini|portobello|shiitake|button mushroom)\b/i;
  if (mushroomRegex.test(lower)) {
    warnings.push('⚠️ Dietary Alert: Mushrooms detected! Jay has excluded mushrooms in his profile.');
  }

  // General Non-veg check
  const nonVegRegex = /\b(chicken|mutton|fish|meat|beef|pork|bacon|prawn|salmon|tuna|turkey)\b/i;
  if (nonVegRegex.test(lower)) {
    warnings.push('⚠️ Dietary Alert: Non-vegetarian food detected! Jay follows a strictly vegetarian diet.');
  }

  return warnings;
}

/**
 * Splits a free-form meal description into individual clauses.
 * Handles separators like comma, "and", "with", plus sign "+", semicolons,
 * and strips leading prepositions and articles.
 */
function splitMealPhrases(text: string): string[] {
  let cleaned = text
    .replace(/\b(breakfast|lunch|dinner|snack|was|had|ate|eating|for|meal)\b/gi, ' ')
    .replace(/[;+&]/g, ',')
    .replace(/\band\b/gi, ',')
    .replace(/\bwith\b/gi, ',');

  return cleaned
    .split(',')
    .map((s) => s.trim())
    .map((s) => s.replace(/^(on|of|in|with|and|a|an)\s+/i, '').trim())
    .filter((s) => s.length > 0);
}

/**
 * Analyzes a single food phrase, extracting quantity, unit, and matched food profile.
 */
function parsePhrase(phrase: string, index: number): ParsedItemResult {
  const lower = phrase.toLowerCase().trim();

  // 1. Try to find a matching food from FOOD_RULES
  let matchedRule: FoodAliasMap | null = null;
  let bestMatchLen = 0;

  for (const rule of FOOD_RULES) {
    for (const alias of rule.aliases) {
      const aliasLower = alias.toLowerCase();
      if (lower.includes(aliasLower) && aliasLower.length > bestMatchLen) {
        matchedRule = rule;
        bestMatchLen = aliasLower.length;
      }
    }
  }

  // 2. Extract quantities and units
  // Look for patterns like: "100g", "100 g", "2 pieces", "1 cup", "2.5 scoops", "2", "half", "1/2"
  let quantity: number | null = null;
  let unit: string = matchedRule ? matchedRule.defaultUnit : 'serving';
  let hasExplicitQuantity = false;

  // Pattern: (\d+(?:\.\d+)?|\d+\/\d+|one|two|three|four|five|half|a|an)\s*(g|gm|gms|gram|grams|cup|cups|katori|katoris|piece|pieces|slice|slices|tbsp|tsp|plate|plates|ml|scoop|scoops|bowl|bowls)?
  const qtyRegex = /(?:^|\s)(\d+(?:\.\d+)?|\d+\/\d+|one|two|three|four|five|half|quarter|a|an)\s*(g|gm|gms|gram|grams|cup|cups|katori|katoris|piece|pieces|slice|slices|tbsp|tablespoon|tsp|teaspoon|plate|plates|ml|scoop|scoops|bowl|bowls)?(?:\s|$)/i;
  const match = lower.match(qtyRegex);

  if (match) {
    const qVal = parseQuantityWord(match[1]);
    if (qVal !== null && qVal > 0) {
      quantity = qVal;
      hasExplicitQuantity = true;
    }

    if (match[2]) {
      const rawUnit = match[2].toLowerCase();
      if (['g', 'gm', 'gms', 'gram', 'grams'].includes(rawUnit)) unit = 'g';
      else if (['cup', 'cups'].includes(rawUnit)) unit = 'cup';
      else if (['katori', 'katoris'].includes(rawUnit)) unit = 'katori';
      else if (['piece', 'pieces', 'slice', 'slices'].includes(rawUnit)) unit = 'piece';
      else if (['tbsp', 'tablespoon'].includes(rawUnit)) unit = 'tbsp';
      else if (['tsp', 'teaspoon'].includes(rawUnit)) unit = 'tsp';
      else if (['plate', 'plates'].includes(rawUnit)) unit = 'plate';
      else if (['scoop', 'scoops'].includes(rawUnit)) unit = 'scoop';
      else if (['bowl', 'bowls'].includes(rawUnit)) unit = 'bowl';
      else if (rawUnit === 'ml') unit = 'ml';
    }
  }

  // If no matched rule in FOOD_RULES, classify by category keywords or realistic density
  if (!matchedRule) {
    const fallbackQty = quantity || 1;
    const isWeightOrVolume = unit === 'g' || unit === 'ml';

    let fallbackCal = 120;
    let fallbackPro = 4.0;
    let fallbackCarbs = 18.0;
    let fallbackFat = 3.5;
    let categoryReason = 'Estimated standard portion. Tap to enter exact grams or edit macros.';

    if (isWeightOrVolume && quantity) {
      // Grams or ml specified (e.g. 50g)
      fallbackCal = Math.round(quantity * 1.25);
      fallbackPro = Math.round(quantity * 0.06 * 10) / 10;
      fallbackCarbs = Math.round(quantity * 0.16 * 10) / 10;
      fallbackFat = Math.round(quantity * 0.04 * 10) / 10;
      categoryReason = `${quantity}${unit} portion estimated at ~1.25 kcal/g density.`;
    } else {
      // Household unit or piece: classify by category keywords
      if (lower.includes('shake') || lower.includes('protein') || lower.includes('smoothie')) {
        fallbackCal = 160;
        fallbackPro = 22.0;
        fallbackCarbs = 8.0;
        fallbackFat = 3.0;
        categoryReason = 'Protein beverage / shake estimated.';
      } else if (lower.includes('milk') || lower.includes('doodh') || lower.includes('dahi') || lower.includes('curd') || lower.includes('yogurt') || lower.includes('lassi') || lower.includes('chaas')) {
        fallbackCal = 130;
        fallbackPro = 7.0;
        fallbackCarbs = 11.0;
        fallbackFat = 6.0;
        categoryReason = 'Dairy portion estimated.';
      } else if (lower.includes('wrap') || lower.includes('sandwich') || lower.includes('burger') || lower.includes('roll')) {
        fallbackCal = 240;
        fallbackPro = 7.0;
        fallbackCarbs = 36.0;
        fallbackFat = 7.0;
        categoryReason = 'Wrap / sandwich meal estimated.';
      } else if (lower.includes('dal') || lower.includes('daal') || lower.includes('curry') || lower.includes('sambar') || lower.includes('chole') || lower.includes('rajma') || lower.includes('soup')) {
        fallbackCal = 170;
        fallbackPro = 9.0;
        fallbackCarbs = 26.0;
        fallbackFat = 3.5;
        categoryReason = 'Lentil / curry portion estimated.';
      } else if (lower.includes('sabzi') || lower.includes('subzi') || lower.includes('veg') || lower.includes('salad') || lower.includes('spinach') || lower.includes('palak')) {
        fallbackCal = 110;
        fallbackPro = 3.5;
        fallbackCarbs = 14.0;
        fallbackFat = 4.5;
        categoryReason = 'Vegetable / sabzi portion estimated.';
      } else if (lower.includes('fruit') || lower.includes('berry') || lower.includes('berries') || lower.includes('mango') || lower.includes('papaya') || lower.includes('guava') || lower.includes('melon')) {
        fallbackCal = 75;
        fallbackPro = 1.0;
        fallbackCarbs = 18.0;
        fallbackFat = 0.3;
        categoryReason = 'Fresh fruit portion estimated.';
      } else if (lower.includes('bread') || lower.includes('toast') || lower.includes('rice') || lower.includes('roti') || lower.includes('noodle') || lower.includes('pasta')) {
        fallbackCal = 190;
        fallbackPro = 5.0;
        fallbackCarbs = 36.0;
        fallbackFat = 3.0;
        categoryReason = 'Grain / carb staple estimated.';
      } else if (lower.includes('nut') || lower.includes('seed') || lower.includes('badam') || lower.includes('kaju') || lower.includes('almond') || lower.includes('cashew') || lower.includes('walnut')) {
        fallbackCal = 150;
        fallbackPro = 4.5;
        fallbackCarbs = 5.0;
        fallbackFat = 13.0;
        categoryReason = 'Nuts / healthy fats estimated.';
      } else if (lower.includes('kheer') || lower.includes('halwa') || lower.includes('sweet') || lower.includes('dessert') || lower.includes('cake') || lower.includes('ice cream')) {
        fallbackCal = 220;
        fallbackPro = 4.0;
        fallbackCarbs = 35.0;
        fallbackFat = 7.0;
        categoryReason = 'Sweet / dessert portion estimated.';
      }

      // Scale by fallbackQty if user specified e.g. "2 apples" or "2 glasses of milk"
      if (fallbackQty > 1) {
        fallbackCal = Math.round(fallbackCal * fallbackQty);
        fallbackPro = Math.round(fallbackPro * fallbackQty * 10) / 10;
        fallbackCarbs = Math.round(fallbackCarbs * fallbackQty * 10) / 10;
        fallbackFat = Math.round(fallbackFat * fallbackQty * 10) / 10;
      }
    }

    return {
      id: `item_${Date.now()}_${index}`,
      food_name: phrase.charAt(0).toUpperCase() + phrase.slice(1),
      quantity: fallbackQty,
      unit: unit || 'serving',
      calories: fallbackCal,
      protein: fallbackPro,
      carbs: fallbackCarbs,
      fat: fallbackFat,
      confidence_score: 'low',
      clarification_needed: 1,
      clarification_reason: categoryReason,
    };
  }

  // Matched rule found!
  const finalQty = quantity !== null ? quantity : matchedRule.defaultQty;
  const finalUnit = unit;

  // Calculate scaling factor
  let scaleFactor = 1.0;

  if (finalUnit === 'g' && matchedRule.baseServingGrams) {
    // If unit is grams, scale linearly by baseServingGrams
    scaleFactor = finalQty / matchedRule.baseServingGrams;
  } else if (finalUnit === matchedRule.defaultUnit) {
    // If unit matches default unit (e.g. piece or cup), scale by defaultQty
    scaleFactor = finalQty / matchedRule.defaultQty;
  } else if (finalUnit === 'katori' && matchedRule.defaultUnit === 'cup') {
    // 1 katori ~ 0.9 cup
    scaleFactor = (finalQty * 0.9) / matchedRule.defaultQty;
  } else if (finalUnit === 'cup' && matchedRule.defaultUnit === 'katori') {
    // 1 cup ~ 1.1 katori
    scaleFactor = (finalQty * 1.1) / matchedRule.defaultQty;
  } else if (finalUnit === 'g' && !matchedRule.baseServingGrams) {
    scaleFactor = finalQty / 100;
  } else {
    // Fallback multiplier
    scaleFactor = finalQty;
  }

  let cal = Math.round(matchedRule.baseCalories * scaleFactor);
  let pro = Math.round(matchedRule.baseProtein * scaleFactor * 10) / 10;
  let carbs = Math.round(matchedRule.baseCarbs * scaleFactor * 10) / 10;
  let fat = Math.round(matchedRule.baseFat * scaleFactor * 10) / 10;

  // Atwater validation check
  const atwaterKcal = Math.round((pro * 4) + (carbs * 4) + (fat * 9));
  if (cal > 0 && Math.abs(cal - atwaterKcal) > Math.max(15, cal * 0.15)) {
    cal = atwaterKcal;
  }

  let confidence: 'high' | 'medium' | 'low' = 'high';
  let clarificationReason: string | undefined = undefined;
  let clarificationNeeded = 0;

  if (!hasExplicitQuantity) {
    confidence = 'medium';
    clarificationNeeded = 1;
    clarificationReason = `Standard serving (${matchedRule.defaultQty} ${matchedRule.defaultUnit}) assumed. Tap to adjust if measured differently.`;
  }

  return {
    id: `item_${Date.now()}_${index}`,
    food_name: matchedRule.canonicalName,
    quantity: finalQty,
    unit: finalUnit,
    calories: cal,
    protein: pro,
    carbs: carbs,
    fat: fat,
    confidence_score: confidence,
    clarification_needed: clarificationNeeded,
    clarification_reason: clarificationReason,
  };
}

/**
 * Main Natural Language Food Parser (`analyzeMeal`)
 */
export function analyzeMeal(
  rawText: string,
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'lunch'
): MealAnalysisResult {
  const warnings = checkDietaryViolations(rawText);
  const phrases = splitMealPhrases(rawText);

  if (phrases.length === 0) {
    return {
      rawText,
      mealType,
      items: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      confidence: 'low',
      warnings,
    };
  }

  const items = phrases.map((phrase, idx) => parsePhrase(phrase, idx));

  const totalCalories = Math.round(items.reduce((sum, item) => sum + item.calories, 0));
  const totalProtein = Math.round(items.reduce((sum, item) => sum + item.protein, 0) * 10) / 10;
  const totalCarbs = Math.round(items.reduce((sum, item) => sum + item.carbs, 0) * 10) / 10;
  const totalFat = Math.round(items.reduce((sum, item) => sum + item.fat, 0) * 10) / 10;

  // Overall confidence: if any item is low -> low; if any medium -> medium; else high
  let overallConfidence: 'high' | 'medium' | 'low' = 'high';
  if (items.some((i) => i.confidence_score === 'low')) {
    overallConfidence = 'low';
  } else if (items.some((i) => i.confidence_score === 'medium')) {
    overallConfidence = 'medium';
  }

  return {
    rawText,
    mealType,
    items,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    confidence: overallConfidence,
    warnings,
  };
}

/**
 * Async Natural Language Food Parser:
 * Attempts Gemini LLM first for high-fidelity extraction, household unit-to-gram conversion,
 * and Atwater consistency; seamlessly falls back to local rules if Gemini is unavailable/unconfigured.
 */
export async function analyzeMealAsync(
  rawText: string,
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'lunch'
): Promise<MealAnalysisResult> {
  try {
    const { parseMealWithGemini } = await import('./geminiMealParser');
    const geminiResult = await parseMealWithGemini(rawText, mealType);
    if (geminiResult && geminiResult.items && geminiResult.items.length > 0) {
      return geminiResult;
    }
  } catch (err) {
    console.warn('[MealParser] Fallback to local rule engine:', err);
  }

  return analyzeMeal(rawText, mealType);
}
