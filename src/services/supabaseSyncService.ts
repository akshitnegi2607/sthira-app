import { createClient } from '@supabase/supabase-js';
import { getDatabase } from '@/database/db';
import { getSupabaseClient, isSupabaseConfigured, cleanSupabaseUrl } from './supabaseClient';
import { useProfileStore } from '@/stores/useProfileStore';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { useWorkoutStore } from '@/stores/useWorkoutStore';
import { useProgressStore } from '@/stores/useProgressStore';
import { useJournalStore } from '@/stores/useJournalStore';
import { useNutritionStore } from '@/stores/useNutritionStore';
import { MealRepository } from '@/database/repositories/mealRepository';

export type SyncState = 'idle' | 'syncing' | 'synced' | 'error' | 'not_configured';

export interface SyncStatus {
  state: SyncState;
  lastSyncedAt: string | null;
  errorMessage: string | null;
  itemsPushed: number;
  itemsPulled: number;
}

const SYNC_TABLES: { name: string; keyCol: string }[] = [
  { name: 'UserProfile', keyCol: 'id' },
  { name: 'Goals', keyCol: 'id' },
  { name: 'DailyLogs', keyCol: 'date' },
  { name: 'WeightEntries', keyCol: 'id' },
  { name: 'MealEntries', keyCol: 'id' },
  { name: 'FoodItems', keyCol: 'id' },
  { name: 'NutritionEstimates', keyCol: 'id' },
  { name: 'WaterEntries', keyCol: 'id' },
  { name: 'SleepEntries', keyCol: 'id' },
  { name: 'JournalEntries', keyCol: 'id' },
  { name: 'WorkoutPlans', keyCol: 'id' },
  { name: 'WorkoutSessions', keyCol: 'id' },
  { name: 'WorkoutExercises', keyCol: 'id' },
  { name: 'WorkoutSets', keyCol: 'id' },
  { name: 'Activities', keyCol: 'id' },
  { name: 'PainEntries', keyCol: 'id' },
  { name: 'AIRecommendations', keyCol: 'id' },
  { name: 'CuisineRecipes', keyCol: 'id' },
];

let currentStatus: SyncStatus = {
  state: 'idle',
  lastSyncedAt: null,
  errorMessage: null,
  itemsPushed: 0,
  itemsPulled: 0,
};

const listeners = new Set<(status: SyncStatus) => void>();

function updateStatus(updates: Partial<SyncStatus>) {
  currentStatus = { ...currentStatus, ...updates };
  listeners.forEach((l) => l(currentStatus));
}

export const SupabaseSyncService = {
  getStatus(): SyncStatus {
    return currentStatus;
  },

  subscribe(callback: (status: SyncStatus) => void): () => void {
    listeners.add(callback);
    callback(currentStatus);
    return () => listeners.delete(callback);
  },

  /**
   * Test connection to Supabase instance.
   */
  async testConnection(customUrl?: string, customKey?: string): Promise<{ success: boolean; message: string }> {
    const cleanedUrl = customUrl ? cleanSupabaseUrl(customUrl) : undefined;
    const cleanedKey = customKey ? customKey.trim() : undefined;

    let supabase = cleanedUrl && cleanedKey ? createClient(cleanedUrl, cleanedKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    }) : getSupabaseClient();

    if (!supabase) {
      return { success: false, message: 'Supabase credentials are not configured. Please enter your Project URL and Anon API key.' };
    }

    try {
      const { error } = await supabase.from('Goals').select('id').limit(1);
      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          return {
            success: true,
            message: 'Connected to Supabase! However, the database tables have not been created yet. Please tap "View / Copy SQL Schema", copy it, and run it in your Supabase SQL Editor.',
          };
        }
        return { success: false, message: `Connection error: ${error.message}` };
      }
      return { success: true, message: 'Successfully connected to Supabase database! All tables ready.' };
    } catch (e: any) {
      return { success: false, message: `Connection failed: ${e?.message || 'Network error'}` };
    }
  },

  /**
   * Bi-directional sync between local SQLite and remote Supabase database.
   */
  async syncAll(): Promise<{ success: boolean; message: string; pushed: number; pulled: number }> {
    if (!isSupabaseConfigured()) {
      updateStatus({ state: 'not_configured', errorMessage: 'Supabase not configured' });
      return { success: false, message: 'Supabase not configured', pushed: 0, pulled: 0 };
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      updateStatus({ state: 'not_configured' });
      return { success: false, message: 'Could not initialize Supabase client', pushed: 0, pulled: 0 };
    }

    updateStatus({ state: 'syncing', errorMessage: null });

    const db = getDatabase();
    let totalPushed = 0;
    let totalPulled = 0;

    try {
      // 1. PULL: Fetch all rows from Supabase and upsert locally first
      for (const table of SYNC_TABLES) {
        try {
          const { data: remoteRows, error: pullErr } = await supabase
            .from(table.name)
            .select('*');

          if (pullErr) {
            console.warn(`[SupabaseSync] Pull error for ${table.name}:`, pullErr.message);
          } else if (remoteRows && remoteRows.length > 0) {
            for (const r of remoteRows) {
              const keys = Object.keys(r);
              if (keys.length === 0) continue;
              const placeholders = keys.map(() => '?').join(', ');
              const sql = `INSERT OR REPLACE INTO ${table.name} (${keys.join(', ')}) VALUES (${placeholders})`;
              const values = keys.map((k) => r[k]);
              try {
                db.runSync(sql, values);
                totalPulled++;
              } catch (insErr) {
                console.warn(`[SupabaseSync] Local insert error for ${table.name}:`, insErr);
              }
            }

            // If WeightEntries were pulled, ensure latest weight is synced to UserProfile and DailyLogs
            if (table.name === 'WeightEntries') {
              const sorted = [...remoteRows].sort((a: any, b: any) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));
              const latest = sorted[0];
              if (latest && latest.weight_kg) {
                try {
                  db.runSync(
                    'UPDATE UserProfile SET current_weight = ?, updated_at = ? WHERE id = ?',
                    [latest.weight_kg, new Date().toISOString(), 'user_primary']
                  );
                } catch {}
              }
              for (const w of remoteRows) {
                if (w.date && w.weight_kg) {
                  try {
                    db.runSync(
                      'UPDATE DailyLogs SET weight = ?, updated_at = ? WHERE date = ?',
                      [w.weight_kg, new Date().toISOString(), w.date]
                    );
                  } catch {}
                }
              }
            }
          }
        } catch (remoteErr) {
          console.warn(`[SupabaseSync] Error pulling from ${table.name}:`, remoteErr);
        }
      }

      // 2. Recalculate DailyLogs totals for all unique dates from pulled meals
      try {
        const allMealRows = db.getAllSync<{ date: string }>('SELECT date FROM MealEntries') || [];
        const uniqueMealDates = Array.from(new Set(allMealRows.map((m: any) => m.date).filter(Boolean)));
        for (const d of uniqueMealDates) {
          try {
            MealRepository.syncDailyLogTotals(d as string);
          } catch (e) {
            console.warn(`[SupabaseSync] Error syncing daily totals for ${d}:`, e);
          }
        }
      } catch (calcErr) {
        console.warn('[SupabaseSync] Error recalculating meal totals:', calcErr);
      }

      // 3. PUSH: Get local rows and upsert to Supabase
      for (const table of SYNC_TABLES) {
        try {
          const localRows = db.getAllSync(`SELECT * FROM ${table.name}`) || [];
          if (localRows.length > 0) {
            const batchSize = 50;
            for (let i = 0; i < localRows.length; i += batchSize) {
              const chunk = localRows.slice(i, i + batchSize);
              const { error: pushErr } = await supabase
                .from(table.name)
                .upsert(chunk, { onConflict: table.keyCol });
              if (pushErr) {
                console.warn(`[SupabaseSync] Push error for ${table.name}:`, pushErr.message);
              } else {
                totalPushed += chunk.length;
              }
            }
          }
        } catch (localErr) {
          console.warn(`[SupabaseSync] Error reading local table ${table.name}:`, localErr);
        }
      }

      // 3. Refresh Zustand stores so active UI updates immediately
      try {
        useProfileStore.getState().loadProfile();
      } catch {}
      try {
        useDashboardStore.getState().loadDashboard();
      } catch {}
      try {
        useWorkoutStore.getState().loadData();
      } catch {}
      try {
        useProgressStore.getState().loadProgressData();
      } catch {}
      try {
        useJournalStore.getState().loadJournalData();
      } catch {}
      try {
        useNutritionStore.getState().loadNutritionData();
      } catch {}

      const nowIso = new Date().toISOString();
      updateStatus({
        state: 'synced',
        lastSyncedAt: nowIso,
        errorMessage: null,
        itemsPushed: totalPushed,
        itemsPulled: totalPulled,
      });

      return {
        success: true,
        message: `Sync complete! Pushed ${totalPushed} and pulled ${totalPulled} records from cloud.`,
        pushed: totalPushed,
        pulled: totalPulled,
      };
    } catch (e: any) {
      console.error('[SupabaseSync] Sync failed:', e);
      updateStatus({ state: 'error', errorMessage: e?.message || 'Sync failed' });
      return {
        success: false,
        message: `Sync error: ${e?.message || 'Network error'}`,
        pushed: totalPushed,
        pulled: totalPulled,
      };
    }
  },
};
