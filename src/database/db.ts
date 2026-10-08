import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

const DB_NAME = 'aicoach.db';

let databaseInstance: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!databaseInstance) {
    databaseInstance = SQLite.openDatabaseSync(DB_NAME);
  }
  return databaseInstance;
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
