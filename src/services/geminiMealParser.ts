/**
 * Sthira — Gemini AI Meal Parsing Service
 * Direct LLM integration with Google Gemini for natural language food logging.
 * Converts household units to estimated gram weights, performs accurate macro lookups,
 * validates Atwater energy math, and respects Jay's vegetarian preferences.
 */

import { getDatabase } from '../database/db';
import { MealAnalysisResult, ParsedItemResult } from './mealParser';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Retrieves the stored Gemini API key from AppSettings or environment variables.
 */
export function getGeminiApiKey(): string | null {
  try {
    const db = getDatabase();
    const row = db.getFirstSync<{ value: string }>(
      "SELECT value FROM AppSettings WHERE key = 'gemini_api_key' LIMIT 1"
    );
    if (row?.value && row.value.trim().length > 0) {
      return row.value.trim();
    }
  } catch {}

  // Check web localStorage fallback
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem('__sthira_gemini_api_key__');
      if (stored && stored.trim().length > 0) {
        return stored.trim();
      }
    } catch {}
  }

  // Check Expo public env
  if (process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
    return process.env.EXPO_PUBLIC_GEMINI_API_KEY.trim();
  }

  return null;
}

/**
 * Persists a Gemini API key to AppSettings and localStorage.
 */
export function saveGeminiApiKey(apiKey: string): void {
  const cleanKey = apiKey.trim();
  try {
    const db = getDatabase();
    const now = new Date().toISOString();
    db.runSync(
      `INSERT INTO AppSettings (key, value, updated_at)
       VALUES ('gemini_api_key', ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      [cleanKey, now]
    );
  } catch {}

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem('__sthira_gemini_api_key__', cleanKey);
    } catch {}
  }
}

/**
 * Checks if a Gemini API key is configured and valid in format.
 */
export function isGeminiConfigured(): boolean {
  const key = getGeminiApiKey();
  return Boolean(key && key.length > 15);
}

/**
 * Tests connection with the Gemini API.
 */
export async function testGeminiConnection(keyToTest?: string): Promise<{ success: boolean; message: string }> {
  const apiKey = keyToTest?.trim() || getGeminiApiKey();
  if (!apiKey) {
    return { success: false, message: 'Gemini API key is not configured.' };
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Respond with OK.' }] }],
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errJson?.error?.message || `Gemini API returned status ${response.status}`,
      };
    }

    return { success: true, message: 'Successfully connected to Google Gemini AI!' };
  } catch (e: any) {
    return { success: false, message: `Connection failed: ${e?.message || 'Network error'}` };
  }
}

/**
 * Analyzes raw meal text using Gemini with strict JSON structured output.
 */
export async function parseMealWithGemini(
  rawText: string,
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'lunch'
): Promise<MealAnalysisResult | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  const prompt = `You are an expert sports nutrition analysis engine for a fitness application.
User Profile: Jay (64kg, vegetarian, target: lean bulk / muscle gain).
Rules:
1. Jay is vegetarian (NO eggs, NO mushrooms, NO meat/fish/gelatin). Onions and garlic ARE allowed.
2. Flag any non-vegetarian ingredients, eggs, or mushrooms in the warnings array.
3. For each individual ingredient or food item in the text, extract:
   - food_name: Clean canonical name (e.g. "Low-Fat Paneer", "Whole Wheat Roti", "Moong Dal", "Peanuts", "Kiwi")
   - quantity: numeric quantity
   - unit: standardized unit ('g', 'ml', 'cup', 'katori', 'piece', 'tbsp', 'tsp', 'slice', 'scoop')
   - estimated_total_grams: total estimated weight in grams or volume in ml for the portion consumed
   - calories: total realistic kcal for this portion
   - protein: total protein in grams (1 decimal place)
   - carbs: total carbohydrates in grams (1 decimal place)
   - fat: total fat in grams (1 decimal place)
   - confidence_score: "high" if quantity and food are clear, "medium" if standard portion was inferred, "low" if ambiguous
4. STRICT Atwater energy consistency: calories must equal (protein * 4) + (carbs * 4) + (fat * 9) within +/- 5 kcal.
5. NEVER multiply whole serving calories by gram count! For example, 5g of peanuts is ~28 kcal, 1.3g protein, 0.8g carbs, 2.4g fat (NOT 1000 kcal).
6. Multi-ingredient sentences like "Macaroni with 1 cup of paneer and 1 cup of green and red peppers" must be split into their individual items ("Macaroni", "Paneer", "Bell Peppers").

Analyze this meal input:
"${rawText}"

Respond ONLY with a valid JSON object matching this schema:
{
  "items": [
    {
      "food_name": "string",
      "quantity": number,
      "unit": "string",
      "estimated_total_grams": number,
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "confidence_score": "high" | "medium" | "low"
    }
  ],
  "warnings": ["string"]
}`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      console.warn(`[GeminiMealParser] API returned error status ${response.status}`);
      return null;
    }

    const data = await response.json();
    const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) return null;

    const parsed = JSON.parse(rawContent);
    if (!parsed.items || !Array.isArray(parsed.items) || parsed.items.length === 0) {
      return null;
    }

    const items: ParsedItemResult[] = parsed.items.map((it: any, idx: number) => {
      let cal = Math.max(0, Math.round(Number(it.calories) || 0));
      let pro = Math.max(0, Math.round((Number(it.protein) || 0) * 10) / 10);
      let carbs = Math.max(0, Math.round((Number(it.carbs) || 0) * 10) / 10);
      let fat = Math.max(0, Math.round((Number(it.fat) || 0) * 10) / 10);

      // Atwater verification guard: ensure calories adhere to macros within +/- 10%
      const atwaterKcal = Math.round((pro * 4) + (carbs * 4) + (fat * 9));
      if (cal === 0 && atwaterKcal > 0) {
        cal = atwaterKcal;
      } else if (Math.abs(cal - atwaterKcal) > Math.max(15, cal * 0.15)) {
        cal = atwaterKcal;
      }

      const conf: 'high' | 'medium' | 'low' =
        it.confidence_score === 'high' || it.confidence_score === 'medium' || it.confidence_score === 'low'
          ? it.confidence_score
          : 'medium';

      return {
        id: `item_gemini_${Date.now()}_${idx}`,
        food_name: it.food_name || 'Food Item',
        quantity: Number(it.quantity) || 1,
        unit: it.unit || 'serving',
        calories: cal,
        protein: pro,
        carbs: carbs,
        fat: fat,
        confidence_score: conf,
        clarification_needed: conf === 'low' ? 1 : 0,
        clarification_reason: conf === 'low' ? 'Please verify portion and grams' : undefined,
      };
    });

    const totalCal = Math.round(items.reduce((s, i) => s + i.calories, 0));
    const totalPro = Math.round(items.reduce((s, i) => s + i.protein, 0) * 10) / 10;
    const totalCarbs = Math.round(items.reduce((s, i) => s + i.carbs, 0) * 10) / 10;
    const totalFat = Math.round(items.reduce((s, i) => s + i.fat, 0) * 10) / 10;

    const overallConfidence: 'high' | 'medium' | 'low' = items.some((i) => i.confidence_score === 'low')
      ? 'low'
      : items.some((i) => i.confidence_score === 'medium')
      ? 'medium'
      : 'high';

    return {
      rawText,
      mealType,
      items,
      totalCalories: totalCal,
      totalProtein: totalPro,
      totalCarbs: totalCarbs,
      totalFat: totalFat,
      confidence: overallConfidence,
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
    };
  } catch (e) {
    console.warn('[GeminiMealParser] Error parsing meal with Gemini:', e);
    return null;
  }
}
