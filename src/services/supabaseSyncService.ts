import { getDatabase } from '@/database/db';
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import { useProfileStore } from '@/stores/useProfileStore';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { useWorkoutStore } from '@/stores/useWorkoutStore';
import { useProgressStore } from '@/stores/useProgressStore';
import { useJournalStore } from '@/stores/useJournalStore';
import { useNutritionStore } from '@/stores/useNutritionStore';

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
  { name: 'DailyLogs', keyCol: 'id' },
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
  async testConnection(): Promise<{ success: boolean; message: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, message: 'Supabase credentials are not configured.' };
    }

    try {
      const { error } = await supabase.from('Goals').select('id').limit(1);
      if (error) {
        return { success: false, message: `Connection error: ${error.message}` };
      }
      return { success: true, message: 'Successfully connected to Supabase database!' };
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
      for (const table of SYNC_TABLES) {
        // 1. PUSH: Get local rows and upsert to Supabase
        try {
          const localRows = db.getAllSync(`SELECT * FROM ${table.name}`) || [];
          if (localRows.length > 0) {
            // Upsert in batches of 50
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

        // 2. PULL: Fetch all rows from Supabase and upsert locally
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
          }
        } catch (remoteErr) {
          console.warn(`[SupabaseSync] Error pulling from ${table.name}:`, remoteErr);
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
        message: `Synced successfully! Pushed ${totalPushed} records, pulled ${totalPulled} records.`,
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
