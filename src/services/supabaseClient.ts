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
 * Retrieves saved Supabase credentials from local AppSettings table,
 * falling back to EXPO_PUBLIC environment variables.
 */
export function getSupabaseCredentials(): SupabaseConfig {
  const envUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  const envKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

  try {
    const db = getDatabase();
    const rows = db.getAllSync<{ key: string; value: string }>(
      "SELECT key, value FROM AppSettings WHERE key IN ('supabase_url', 'supabase_anon_key')"
    );

    let savedUrl = '';
    let savedKey = '';
    for (const r of rows || []) {
      if (r.key === 'supabase_url') savedUrl = r.value;
      if (r.key === 'supabase_anon_key') savedKey = r.value;
    }

    return {
      url: savedUrl || envUrl,
      anonKey: savedKey || envKey,
    };
  } catch (e) {
    return {
      url: envUrl,
      anonKey: envKey,
    };
  }
}

/**
 * Persists Supabase credentials into AppSettings table and resets the client cache.
 */
export function saveSupabaseCredentials(url: string, anonKey: string): void {
  try {
    const db = getDatabase();
    const now = new Date().toISOString();

    db.runSync(
      `INSERT OR REPLACE INTO AppSettings (key, value, updated_at) VALUES ('supabase_url', ?, ?)`,
      [url.trim(), now]
    );
    db.runSync(
      `INSERT OR REPLACE INTO AppSettings (key, value, updated_at) VALUES ('supabase_anon_key', ?, ?)`,
      [anonKey.trim(), now]
    );

    // Invalidate cached client
    cachedClient = null;
    cachedUrl = null;
    cachedKey = null;
  } catch (e) {
    console.error('Failed to save Supabase credentials', e);
  }
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
