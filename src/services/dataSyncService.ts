import { getDatabase } from '@/database/db';
import { useProfileStore } from '@/stores/useProfileStore';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { useWorkoutStore } from '@/stores/useWorkoutStore';
import { useProgressStore } from '@/stores/useProgressStore';
import { useJournalStore } from '@/stores/useJournalStore';

export interface ExportDataPayload {
  version: number;
  exportedAt: string;
  userName: string;
  stats: {
    meals: number;
    workouts: number;
    weightEntries: number;
    dailyLogs: number;
    journalEntries: number;
    painEntries: number;
  };
  tables: Record<string, any[]>;
}

const USER_TABLES = [
  'UserProfile',
  'Goals',
  'DailyLogs',
  'WeightEntries',
  'MealEntries',
  'FoodItems',
  'NutritionEstimates',
  'WaterEntries',
  'SleepEntries',
  'JournalEntries',
  'WorkoutSessions',
  'WorkoutExercises',
  'WorkoutSets',
  'PainEntries',
  'AIRecommendations',
];

export const DataSyncService = {
  /**
   * Export all user data from local SQLite database as a structured JSON object.
   */
  exportData(): ExportDataPayload {
    const db = getDatabase();
    const tablesData: Record<string, any[]> = {};

    for (const table of USER_TABLES) {
      try {
        const rows = db.getAllSync(`SELECT * FROM ${table}`);
        tablesData[table] = rows || [];
      } catch (e) {
        console.warn(`Could not export table ${table}:`, e);
        tablesData[table] = [];
      }
    }

    const userProfile = tablesData['UserProfile']?.[0] || {};
    const userName = userProfile.name || 'Jay';

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      userName,
      stats: {
        meals: tablesData['MealEntries']?.length || 0,
        workouts: tablesData['WorkoutSessions']?.length || 0,
        weightEntries: tablesData['WeightEntries']?.length || 0,
        dailyLogs: tablesData['DailyLogs']?.length || 0,
        journalEntries: tablesData['JournalEntries']?.length || 0,
        painEntries: tablesData['PainEntries']?.length || 0,
      },
      tables: tablesData,
    };
  },

  /**
   * Export as pretty JSON string
   */
  exportDataAsString(): string {
    return JSON.stringify(this.exportData(), null, 2);
  },

  /**
   * Import data from JSON payload and restore into local database
   */
  importData(jsonString: string): { success: boolean; message: string; stats?: ExportDataPayload['stats'] } {
    let payload: ExportDataPayload;
    try {
      payload = JSON.parse(jsonString);
    } catch {
      return { success: false, message: 'Invalid JSON format. Please paste valid backup data.' };
    }

    if (!payload.tables || typeof payload.tables !== 'object') {
      return { success: false, message: 'Invalid backup structure: missing tables object.' };
    }

    const db = getDatabase();

    try {
      for (const table of USER_TABLES) {
        const rows = payload.tables[table];
        if (!Array.isArray(rows) || rows.length === 0) continue;

        // Clear existing data for this table
        try {
          db.runSync(`DELETE FROM ${table}`);
        } catch (e) {
          console.warn(`Error clearing table ${table}:`, e);
        }

        // Insert restored rows
        for (const row of rows) {
          const keys = Object.keys(row);
          if (keys.length === 0) continue;

          const placeholders = keys.map(() => '?').join(', ');
          const sql = `INSERT OR REPLACE INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
          const values = keys.map((k) => row[k]);

          try {
            db.runSync(sql, values);
          } catch (insertErr) {
            console.warn(`Error inserting row into ${table}:`, insertErr);
          }
        }
      }

      // Refresh all zustand stores to propagate newly imported data instantly
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

      return {
        success: true,
        message: `Successfully restored data for ${payload.userName || 'user'}!`,
        stats: payload.stats,
      };
    } catch (err: any) {
      console.error('Import error:', err);
      return { success: false, message: `Import failed: ${err?.message || 'Unknown database error'}` };
    }
  },
};
