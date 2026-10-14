import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getDatabase } from '@/database/db';

let cachedClient: SupabaseClient | null = null;
let cachedUrl: string | null = null;
let cachedKey: string | null = null;

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * Sanitizes Supabase URL by removing trailing slashes and /rest/v1 paths.
 */
export function cleanSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let u = rawUrl.trim();
  u = u.replace(/\/rest\/v1\/?$/i, '');
  u = u.replace(/\/+$/, '');
  return u;
}

export const DEFAULT_SUPABASE_URL = 'https://mnupkkaveffdghylxokn.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'sb_publishable_4sIO_02adW7ufGW_jkKzRQ_q6WFDYQF';

/**
 * Retrieves saved Supabase credentials from local AppSettings table,
 * localStorage on web, falling back to EXPO_PUBLIC environment variables or project defaults.
 */
export function getSupabaseCredentials(): SupabaseConfig {
  const envUrl = cleanSupabaseUrl(process.env.EXPO_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL);
  const envKey = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY).trim();

  let savedUrl = '';
  let savedKey = '';

  // 1. Direct Web localStorage fallback (instant, immune to DB state)
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      savedUrl = window.localStorage.getItem('__sthira_supabase_url__') || '';
      savedKey = window.localStorage.getItem('__sthira_supabase_key__') || '';
    } catch {}
  }

  // 2. Query AppSettings table
  try {
    const db = getDatabase();
    const rows = db.getAllSync<{ key: string; value: string }>('SELECT * FROM AppSettings');
    for (const r of rows || []) {
      if (r.key === 'supabase_url' && r.value) savedUrl = r.value;
      if (r.key === 'supabase_anon_key' && r.value) savedKey = r.value;
    }
  } catch (e) {
    console.warn('Could not read AppSettings for Supabase', e);
  }

  return {
    url: cleanSupabaseUrl(savedUrl || envUrl || DEFAULT_SUPABASE_URL),
    anonKey: (savedKey || envKey || DEFAULT_SUPABASE_KEY).trim(),
  };
}

/**
 * Persists Supabase credentials into AppSettings table and localStorage, resetting client cache.
 */
export function saveSupabaseCredentials(url: string, anonKey: string): void {
  const cleanUrl = cleanSupabaseUrl(url);
  const cleanKey = anonKey.trim();

  // 1. Direct Web localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem('__sthira_supabase_url__', cleanUrl);
      window.localStorage.setItem('__sthira_supabase_key__', cleanKey);
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }

  // 2. Persist to AppSettings SQLite table
  try {
    const db = getDatabase();
    const now = new Date().toISOString();

    db.runSync(
      `INSERT OR REPLACE INTO AppSettings (key, value, updated_at) VALUES (?, ?, ?)`,
      ['supabase_url', cleanUrl, now]
    );
    db.runSync(
      `INSERT OR REPLACE INTO AppSettings (key, value, updated_at) VALUES (?, ?, ?)`,
      ['supabase_anon_key', cleanKey, now]
    );
  } catch (e) {
    console.error('Failed to save Supabase credentials', e);
  }

  // Invalidate cached client
  cachedClient = null;
  cachedUrl = null;
  cachedKey = null;
}

/**
 * Checks if Supabase credentials are configured.
 */
export function isSupabaseConfigured(): boolean {
  const creds = getSupabaseCredentials();
  return Boolean(creds.url && creds.anonKey && creds.url.startsWith('https://'));
}

/**
 * Returns a configured Supabase client, or null if not yet configured.
 */
export function getSupabaseClient(): SupabaseClient | null {
  const creds = getSupabaseCredentials();
  if (!creds.url || !creds.anonKey || !creds.url.startsWith('https://')) {
    return null;
  }

  if (cachedClient && cachedUrl === creds.url && cachedKey === creds.anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(creds.url, creds.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    cachedUrl = creds.url;
    cachedKey = creds.anonKey;
    return cachedClient;
  } catch (e) {
    console.error('Failed to initialize Supabase client:', e);
    return null;
  }
}
