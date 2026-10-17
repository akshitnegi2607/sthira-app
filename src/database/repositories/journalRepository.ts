/**
 * Sthira — Journal & Reflection Repository
 * SQLite persistence for:
 * - Morning and evening reflection notes (JournalEntries)
 * - Subjective readiness & recovery ratings (DailyLogs)
 * - Daily holistic AI Coach recommendations (AIRecommendations)
 */

import { getDatabase } from '../db';
import {
  JournalEntry,
  DailyLog,
  AIRecommendation,
} from '../../types/database';
import { DailyLogsRepository } from './dailyLogsRepository';
import { extractSentimentAndThemes } from '../../services/journalAnalytics';

export const JournalRepository = {
  /**
   * Retrieves all journal entries for a given date.
   */
  getJournalEntriesForDate(dateStr: string): JournalEntry[] {
    const db = getDatabase();
    return db.getAllSync<JournalEntry>(
      'SELECT * FROM JournalEntries WHERE date = ? ORDER BY created_at ASC',
      [dateStr]
    );
  },

  /**
   * Retrieves a specific journal entry by date and type.
   */
  getJournalEntry(
    dateStr: string,
    entryType: 'morning' | 'evening' | 'general'
  ): JournalEntry | null {
    const db = getDatabase();
    const all = db.getAllSync<JournalEntry>(
      'SELECT * FROM JournalEntries WHERE date = ?',
      [dateStr]
    );
    return all.find((e) => e.entry_type === entryType) || null;
  },

  /**
   * Creates or updates a journal entry.
   */
  saveJournalEntry(data: {
    date: string;
    entry_type: 'morning' | 'evening' | 'general';
    notes: string;
    sentiment_label?: string | null;
    themes?: string | null;
  }): JournalEntry {
    const db = getDatabase();
    const now = new Date().toISOString();
    const existing = this.getJournalEntry(data.date, data.entry_type);

    let entryId: string;
    if (existing) {
      entryId = existing.id;
      db.runSync(
        `UPDATE JournalEntries SET
          notes = ?, sentiment_label = ?, themes = ?
         WHERE id = ?`,
        [
          data.notes,
          data.sentiment_label ?? existing.sentiment_label ?? null,
          data.themes ?? existing.themes ?? null,
          existing.id,
        ]
      );
    } else {
      entryId = `jrn_${data.date}_${data.entry_type}_${Date.now()}`;
      db.runSync(
        `INSERT INTO JournalEntries (id, date, entry_type, notes, sentiment_label, themes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          entryId,
          data.date,
          data.entry_type,
          data.notes,
          data.sentiment_label ?? null,
          data.themes ?? null,
          now,
        ]
      );
    }

    return (
      db.getFirstSync<JournalEntry>(
        'SELECT * FROM JournalEntries WHERE id = ?',
        [entryId]
      ) || {
        id: entryId,
        date: data.date,
        entry_type: data.entry_type,
        notes: data.notes,
        sentiment_label: data.sentiment_label ?? null,
        themes: data.themes ?? null,
        created_at: now,
      }
    );
  },

  /**
   * Saves Morning Readiness check-in.
   * Updates DailyLogs ratings and creates/updates morning journal entry.
   */
  saveMorningCheckIn(params: {
    date: string;
    sleepHours: number;
    energyRating: number;
    moodRating: number;
    sorenessRating: number;
    notes?: string;
  }): { entry: JournalEntry; dailyLog: DailyLog } {
    // 1. Update DailyLogs
    DailyLogsRepository.updateDailyLog(params.date, {
      sleep_hours: params.sleepHours,
      energy_rating: params.energyRating,
      mood_rating: params.moodRating,
      soreness_rating: params.sorenessRating,
      recovery_rating: Math.round(
        (params.energyRating + (11 - params.sorenessRating)) / 2
      ),
    });

    const updatedLog = DailyLogsRepository.getOrCreateLog(params.date);

    // 2. Extract themes & sentiment from notes
    const analysis = extractSentimentAndThemes(params.notes || '');

    // 3. Save journal entry
    const entry = this.saveJournalEntry({
      date: params.date,
      entry_type: 'morning',
      notes: params.notes || 'Morning readiness check-in completed.',
      sentiment_label: analysis.sentiment,
      themes: JSON.stringify(analysis.themes),
    });

    return { entry, dailyLog: updatedLog };
  },

  /**
   * Saves Evening Wind-Down reflection.
   * Updates DailyLogs ratings and creates/updates evening journal entry.
   */
  saveEveningReflection(params: {
    date: string;
    hungerRating: number;
    stressRating: number;
    notes: string;
  }): { entry: JournalEntry; dailyLog: DailyLog } {
    // 1. Update DailyLogs
    DailyLogsRepository.updateDailyLog(params.date, {
      hunger_rating: params.hungerRating,
      stress_rating: params.stressRating,
    });

    const updatedLog = DailyLogsRepository.getOrCreateLog(params.date);

    // 2. Extract themes & sentiment
    const analysis = extractSentimentAndThemes(params.notes);

    // 3. Save journal entry
    const entry = this.saveJournalEntry({
      date: params.date,
      entry_type: 'evening',
      notes: params.notes,
      sentiment_label: analysis.sentiment,
      themes: JSON.stringify(analysis.themes),
    });

    return { entry, dailyLog: updatedLog };
  },

  /**
   * Saves a holistic AI coach recommendation and syncs with DailyLogs.
   */
  saveAIRecommendation(data: {
    date: string;
    recommendation_type: 'daily_coach' | 'calorie_adjustment' | 'workout_progression' | 'nutrition_advice';
    content: string;
    action_items?: string;
    rationale?: string;
    statusBadge?: 'ON TRACK' | 'ATTENTION' | 'NEEDS ACTION';
  }): AIRecommendation {
    const db = getDatabase();
    const now = new Date().toISOString();
    const id = `rec_${data.date}_${data.recommendation_type}`;

    const existing = db.getFirstSync<AIRecommendation>(
      'SELECT * FROM AIRecommendations WHERE id = ?',
      [id]
    );

    if (existing) {
      db.runSync(
        `UPDATE AIRecommendations SET
          content = ?, action_items = ?, rationale = ?, created_at = ?
         WHERE id = ?`,
        [data.content, data.action_items ?? null, data.rationale ?? null, now, id]
      );
    } else {
      db.runSync(
        `INSERT INTO AIRecommendations (
          id, date, recommendation_type, content, action_items, rationale, is_acknowledged, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
        [
          id,
          data.date,
          data.recommendation_type,
          data.content,
          data.action_items ?? null,
          data.rationale ?? null,
          now,
        ]
      );
    }

    // Sync DailyLogs coach summary
    if (data.recommendation_type === 'daily_coach') {
      DailyLogsRepository.updateDailyLog(data.date, {
        coach_summary: data.content,
        coach_status: data.statusBadge || 'ON TRACK',
      });
    }

    return (
      db.getFirstSync<AIRecommendation>(
        'SELECT * FROM AIRecommendations WHERE id = ?',
        [id]
      ) || {
        id,
        date: data.date,
        recommendation_type: data.recommendation_type,
        content: data.content,
        action_items: data.action_items ?? null,
        rationale: data.rationale ?? null,
        is_acknowledged: 0,
        created_at: now,
      }
    );
  },

  /**
   * Gets the latest AI recommendation for a given date.
   */
  getLatestAIRecommendation(dateStr: string): AIRecommendation | null {
    const db = getDatabase();
    const all = db.getAllSync<AIRecommendation>(
      'SELECT * FROM AIRecommendations WHERE date = ?',
      [dateStr]
    );
    const dailyCoach = all.filter((r) => r.recommendation_type === 'daily_coach');
    return dailyCoach.length > 0 ? dailyCoach[dailyCoach.length - 1] : null;
  },

  getLatestRecommendation(dateStr: string, _type?: string): AIRecommendation | null {
    return this.getLatestAIRecommendation(dateStr);
  },

  /**
   * Retrieves recent journal entries.
   */
  getRecentJournalHistory(limit = 20): JournalEntry[] {
    const db = getDatabase();
    return db.getAllSync<JournalEntry>(
      'SELECT * FROM JournalEntries ORDER BY date DESC',
      [limit]
    );
  },
};
