declare const require: any;

export interface AppDatabase {
  execSync: (sql: string) => void;
  getFirstSync: <T = any>(sql: string, params?: any[]) => T | null;
  getAllSync: <T = any>(sql: string, params?: any[]) => T[];
  runSync: (sql: string, params?: any[]) => { changes: number; lastInsertRowId: number };
}

const DB_NAME = 'aicoach.db';

let databaseInstance: AppDatabase | null = null;

export function getDatabase(): AppDatabase {
  if (databaseInstance) return databaseInstance;

  try {
    const SQLite = require('expo-sqlite');
    if (SQLite && typeof SQLite.openDatabaseSync === 'function') {
      databaseInstance = SQLite.openDatabaseSync(DB_NAME);
      return databaseInstance!;
    }
  } catch {
    // Native SQLite not available (e.g. web or test environment)
  }

  const { getDatabase: getWebDb } = require('./db.web');
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
