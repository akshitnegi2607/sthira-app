import { getDatabase } from '../db';
import { DailyLog } from '../../types/database';
import { getTodayDateString } from '../../utils/date';

export const DailyLogsRepository = {
  getLogByDate(dateStr: string): DailyLog | null {
    const db = getDatabase();
    return db.getFirstSync<DailyLog>('SELECT * FROM DailyLogs WHERE date = ?', [dateStr]);
  },

  getOrCreateLog(dateStr: string): DailyLog {
    const existing = this.getLogByDate(dateStr);
    if (existing) {
      return existing;
    }

    const db = getDatabase();
    const now = new Date().toISOString();
    const newLog: DailyLog = {
      id: `log_${dateStr}`,
      date: dateStr,
      calories_consumed: 0,
      protein_consumed: 0,
      carbs_consumed: 0,
      fat_consumed: 0,
      water_liters: 0,
      weight: null,
      sleep_hours: null,
      energy_rating: null,
      mood_rating: null,
      hunger_rating: null,
      recovery_rating: null,
      soreness_rating: null,
      stress_rating: null,
      coach_status: 'ON TRACK',
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

    if (updates.water_liters !== undefined && Number(updates.water_liters) > Number(current.water_liters || 0)) {
      try {
        const addedMl = Math.round((Number(updates.water_liters) - Number(current.water_liters || 0)) * 1000);
        const now = new Date().toISOString();
        db.runSync(
          'INSERT INTO WaterEntries (id, date, amount_ml, created_at) VALUES (?, ?, ?, ?)',
          [`water_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, dateStr, addedMl, now]
        );
      } catch (e) {
        // silent guard
      }
    }
  },

  getRecentLogs(limitDays: number = 7): DailyLog[] {
    const db = getDatabase();
    return db.getAllSync<DailyLog>(
      'SELECT * FROM DailyLogs ORDER BY date DESC LIMIT ?',
      [limitDays]
    );
  },
};
