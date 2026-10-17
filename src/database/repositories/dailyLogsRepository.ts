import { getDatabase } from '../db';
import { DailyLog } from '../../types/database';
import { getTodayDateString } from '../../utils/date';

export const DailyLogsRepository = {
  getWaterLitersForDate(dateStr: string): number {
    const db = getDatabase();
    try {
      const rows = db.getAllSync<{ amount_ml: number }>(
        'SELECT amount_ml FROM WaterEntries WHERE date = ?',
        [dateStr]
      );
      if (rows && rows.length > 0) {
        const sumMl = rows.reduce((acc, r) => acc + (Number(r.amount_ml) || 0), 0);
        return Math.round((sumMl / 1000) * 10) / 10;
      }
    } catch (e) {
      console.warn('Error reading water entries:', e);
    }
    return 0;
  },

  /**
   * Logs a hydration entry (in liters), creating a persistent WaterEntries record
   * and updating the DailyLogs table.
   */
  logWater(dateStr: string, amountLiters: number): DailyLog {
    const db = getDatabase();
    const ml = Math.round(Number(amountLiters) * 1000);
    const now = new Date().toISOString();

    if (ml > 0) {
      const id = `water_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      db.runSync(
        'INSERT INTO WaterEntries (id, date, amount_ml, created_at) VALUES (?, ?, ?, ?)',
        [id, dateStr, ml, now]
      );
    }

    const currentWater = this.getWaterLitersForDate(dateStr);
    const currentLog = this.getOrCreateLog(dateStr);
    const finalLiters = Math.max(
      currentWater,
      Math.round(((Number(currentLog.water_liters) || 0) + Number(amountLiters)) * 10) / 10
    );

    db.runSync(
      'UPDATE DailyLogs SET water_liters = ?, updated_at = ? WHERE date = ?',
      [finalLiters, now, dateStr]
    );

    const refreshed = this.getLogByDate(dateStr);
    return refreshed || { ...currentLog, water_liters: finalLiters, updated_at: now };
  },

  getLogByDate(dateStr: string): DailyLog | null {
    const db = getDatabase();
    const row = db.getFirstSync<DailyLog>('SELECT * FROM DailyLogs WHERE date = ?', [dateStr]);
    if (!row) return null;

    // Keep water_liters synchronized with WaterEntries single-source of truth if water entries exist
    const waterSum = this.getWaterLitersForDate(dateStr);
    if (waterSum > 0 && Math.abs(waterSum - (row.water_liters || 0)) > 0.05) {
      db.runSync('UPDATE DailyLogs SET water_liters = ? WHERE date = ?', [waterSum, dateStr]);
      row.water_liters = waterSum;
    } else if (waterSum === 0 && (row.water_liters || 0) > 0) {
      // If DailyLogs has water but WaterEntries has no rows yet, backfill a WaterEntry so it is never lost!
      const now = new Date().toISOString();
      const ml = Math.round(Number(row.water_liters) * 1000);
      try {
        db.runSync(
          'INSERT INTO WaterEntries (id, date, amount_ml, created_at) VALUES (?, ?, ?, ?)',
          [`water_init_${dateStr}`, dateStr, ml, now]
        );
      } catch {}
    }
    return row;
  },

  getOrCreateLog(dateStr: string): DailyLog {
    const existing = this.getLogByDate(dateStr);
    if (existing) {
      return existing;
    }

    const db = getDatabase();
    const now = new Date().toISOString();
    const initialWater = this.getWaterLitersForDate(dateStr);

    const newLog: DailyLog = {
      id: `log_${dateStr}`,
      date: dateStr,
      calories_consumed: 0,
      protein_consumed: 0,
      carbs_consumed: 0,
      fat_consumed: 0,
      water_liters: initialWater,
      weight: null,
      sleep_hours: null,
      energy_rating: null,
      mood_rating: null,
      hunger_rating: null,
      recovery_rating: null,
      soreness_rating: null,
      stress_rating: null,
      coach_status: 'PENDING',
      coach_summary: 'Starting your day. Fuel up and stay hydrated!',
      created_at: now,
      updated_at: now,
    };

    db.runSync(
      `INSERT INTO DailyLogs (
        id, date, calories_consumed, protein_consumed, carbs_consumed,
        fat_consumed, water_liters, weight, sleep_hours, energy_rating,
        mood_rating, hunger_rating, recovery_rating, soreness_rating,
        stress_rating, coach_status, coach_summary, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newLog.id,
        newLog.date,
        newLog.calories_consumed,
        newLog.protein_consumed,
        newLog.carbs_consumed,
        newLog.fat_consumed,
        newLog.water_liters,
        newLog.weight ?? null,
        newLog.sleep_hours ?? null,
        newLog.energy_rating ?? null,
        newLog.mood_rating ?? null,
        newLog.hunger_rating ?? null,
        newLog.recovery_rating ?? null,
        newLog.soreness_rating ?? null,
        newLog.stress_rating ?? null,
        newLog.coach_status,
        newLog.coach_summary ?? null,
        newLog.created_at,
        newLog.updated_at,
      ]
    );

    return newLog;
  },

  getTodayLog(): DailyLog {
    const todayStr = getTodayDateString();
    return this.getOrCreateLog(todayStr);
  },

  updateDailyLog(dateStr: string, updates: Partial<DailyLog>): void {
    const db = getDatabase();
    const current = this.getOrCreateLog(dateStr);
    const merged = { ...current, ...updates, updated_at: new Date().toISOString() };

    // Water synchronization: if water_liters is updated, sync with WaterEntries
    if (updates.water_liters !== undefined) {
      const targetLiters = Math.round(Number(updates.water_liters) * 10) / 10;
      const currentWaterSum = this.getWaterLitersForDate(dateStr);
      if (targetLiters > currentWaterSum) {
        const addedMl = Math.round((targetLiters - currentWaterSum) * 1000);
        if (addedMl > 0) {
          const now = new Date().toISOString();
          db.runSync(
            'INSERT INTO WaterEntries (id, date, amount_ml, created_at) VALUES (?, ?, ?, ?)',
            [`water_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, dateStr, addedMl, now]
          );
        }
      }
      merged.water_liters = Math.max(targetLiters, this.getWaterLitersForDate(dateStr));
    }

    db.runSync(
      `UPDATE DailyLogs SET
        calories_consumed = ?, protein_consumed = ?, carbs_consumed = ?,
        fat_consumed = ?, water_liters = ?, weight = ?, sleep_hours = ?,
        energy_rating = ?, mood_rating = ?, hunger_rating = ?,
        recovery_rating = ?, soreness_rating = ?, stress_rating = ?,
        coach_status = ?, coach_summary = ?, updated_at = ?
      WHERE date = ?`,
      [
        merged.calories_consumed,
        merged.protein_consumed,
        merged.carbs_consumed,
        merged.fat_consumed,
        merged.water_liters,
        merged.weight ?? null,
        merged.sleep_hours ?? null,
        merged.energy_rating ?? null,
        merged.mood_rating ?? null,
        merged.hunger_rating ?? null,
        merged.recovery_rating ?? null,
        merged.soreness_rating ?? null,
        merged.stress_rating ?? null,
        merged.coach_status,
        merged.coach_summary ?? null,
        merged.updated_at,
        dateStr,
      ]
    );
  },

  getRecentLogs(limitDays: number = 7): DailyLog[] {
    const db = getDatabase();
    return db.getAllSync<DailyLog>(
      'SELECT * FROM DailyLogs ORDER BY date DESC LIMIT ?',
      [limitDays]
    );
  },
};
