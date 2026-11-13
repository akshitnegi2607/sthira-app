declare const require: any;

export interface AppDatabase {
  execSync: (sql: string) => void;
  getFirstSync: <T = any>(sql: string, params?: any[]) => T | null;
  getAllSync: <T = any>(sql: string, params?: any[]) => T[];
  runSync: (sql: string, params?: any[]) => { changes: number; lastInsertRowId: number };
}

const DEFAULT_DB_NAME = 'aicoach.db';
const DEFAULT_WEB_KEY = '__aicoach_web_db__';

let currentDbName = DEFAULT_DB_NAME;
let currentWebKey = DEFAULT_WEB_KEY;
let databaseInstance: AppDatabase | null = null;

/**
 * Dynamically switches the active SQLite database (for multi-user support).
 * Native uses `dbName` file, and web uses `webKey` localStorage partition.
 */
export function setActiveDatabase(dbName: string, webKey?: string) {
  const targetDbName = dbName || DEFAULT_DB_NAME;
  const targetWebKey = webKey || (dbName ? `__${dbName.replace('.db', '')}_web_db__` : DEFAULT_WEB_KEY);

  if (currentDbName !== targetDbName || currentWebKey !== targetWebKey) {
    currentDbName = targetDbName;
    currentWebKey = targetWebKey;
    databaseInstance = null;

    try {
      const { setActiveWebDatabase } = require('./db.web');
      if (typeof setActiveWebDatabase === 'function') {
        setActiveWebDatabase(currentWebKey);
      }
    } catch {
      // Ignore if web fallback is not applicable
    }
  }
}

export function getActiveDatabaseName(): string {
  return currentDbName;
}

export function getActiveWebStorageKey(): string {
  return currentWebKey;
}

export function resetDatabaseInstance() {
  databaseInstance = null;
}

export function getDatabase(): AppDatabase {
  if (databaseInstance) return databaseInstance;

  try {
    const SQLite = require('expo-sqlite');
    if (SQLite && typeof SQLite.openDatabaseSync === 'function') {
      databaseInstance = SQLite.openDatabaseSync(currentDbName);
      return databaseInstance!;
    }
  } catch {
    // Native SQLite not available (e.g. web or test environment)
  }

  const { getDatabase: getWebDb, setActiveWebDatabase } = require('./db.web');
  if (typeof setActiveWebDatabase === 'function') {
    setActiveWebDatabase(currentWebKey);
  }
  databaseInstance = getWebDb();
  return databaseInstance!;
}

export function executeSqlSync(sql: string) {
  try {
    const db = getDatabase();
    db.execSync(sql);
  } catch (error) {
    console.error('Database execution error:', error);
    throw error;
  }
}
