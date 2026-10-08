/**
 * Web database fallback for expo-sqlite.
 * Allows running and previewing the application in web browsers seamlessly
 * without requiring COOP/COEP SharedArrayBuffer headers for SQLite WASM workers.
 */

interface WebDBRecord {
  [key: string]: any;
}

class WebSQLiteFallback {
  private tables: Map<string, WebDBRecord[]> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem('__aicoach_web_db__');
        if (stored) {
          const parsed = JSON.parse(stored);
          for (const [table, rows] of Object.entries(parsed)) {
            this.tables.set(table, rows as WebDBRecord[]);
          }
        }
      }
    } catch (e) {
      console.warn('Could not read web database from localStorage', e);
    }
  }

  private saveToStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const obj: Record<string, WebDBRecord[]> = {};
        for (const [table, rows] of this.tables.entries()) {
          obj[table] = rows;
        }
        window.localStorage.setItem('__aicoach_web_db__', JSON.stringify(obj));
      }
    } catch (e) {
      console.warn('Could not write web database to localStorage', e);
    }
  }

  execSync(sql: string): void {
    // Basic table initialization tracker
    const matches = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/g);
    if (matches) {
      for (const m of matches) {
        const tableName = m.replace('CREATE TABLE IF NOT EXISTS ', '').trim();
        if (!this.tables.has(tableName)) {
          this.tables.set(tableName, []);
        }
      }
    }
  }

  getFirstSync<T>(sql: string, params: any[] = []): T | null {
    const all = this.getAllSync<T>(sql, params);
    return all.length > 0 ? all[0] : null;
  }

  getAllSync<T>(sql: string, params: any[] = []): T[] {
    const cleanSql = sql.trim();

    // Handle SELECT COUNT(*) FROM <table>
    const countMatch = cleanSql.match(/SELECT COUNT\(\*\) as count FROM (\w+)/i);
    if (countMatch) {
      const table = countMatch[1];
      const rows = this.tables.get(table) || [];
      return [{ count: rows.length } as unknown as T];
    }

    // Handle SELECT * FROM <table> WHERE <col> = ? LIMIT 1
    const whereMatch = cleanSql.match(/SELECT \* FROM (\w+) WHERE (\w+) = \?/i);
    if (whereMatch) {
      const table = whereMatch[1];
      const col = whereMatch[2];
      const val = params[0];
      const rows = this.tables.get(table) || [];
      const filtered = rows.filter((r) => r[col] == val);
      return filtered as unknown as T[];
    }

    // Handle SELECT * FROM <table>
    const selectAllMatch = cleanSql.match(/SELECT \* FROM (\w+)/i);
    if (selectAllMatch) {
      const table = selectAllMatch[1];
      const rows = this.tables.get(table) || [];
      return [...rows] as unknown as T[];
    }

    return [];
  }

  runSync(sql: string, params: any[] = []): { changes: number; lastInsertRowId: number } {
    const cleanSql = sql.trim();

    // Handle INSERT INTO <table> (<cols>) VALUES (...)
    const insertMatch = cleanSql.match(/INSERT INTO (\w+)\s*\(([^)]+)\)\s*VALUES/i);
    if (insertMatch) {
      const table = insertMatch[1];
      const cols = insertMatch[2].split(',').map((c) => c.trim());
      const row: WebDBRecord = {};

      cols.forEach((col, idx) => {
        row[col] = params[idx];
      });

      if (!this.tables.has(table)) {
        this.tables.set(table, []);
      }

      const rows = this.tables.get(table)!;
      // If table has primary key 'id' or 'date', replace or append
      const keyCol = cols.includes('id') ? 'id' : cols.includes('date') ? 'date' : null;
      if (keyCol && row[keyCol]) {
        const existingIdx = rows.findIndex((r) => r[keyCol] == row[keyCol]);
        if (existingIdx >= 0) {
          rows[existingIdx] = row;
        } else {
          rows.push(row);
        }
      } else {
        rows.push(row);
      }

      this.saveToStorage();
      return { changes: 1, lastInsertRowId: rows.length };
    }

    // Handle UPDATE <table> SET ... WHERE <col> = ?
    const updateMatch = cleanSql.match(/UPDATE (\w+) SET ([\s\S]+?) WHERE (\w+) = \?/i);
    if (updateMatch) {
      const table = updateMatch[1];
      const setClauses = updateMatch[2].split(',').map((s) => s.trim().split('=')[0].trim());
      const whereCol = updateMatch[3];
      const whereVal = params[params.length - 1];

      const rows = this.tables.get(table) || [];
      const target = rows.find((r) => r[whereCol] == whereVal);

      if (target) {
        setClauses.forEach((col, idx) => {
          target[col] = params[idx];
        });
        this.saveToStorage();
        return { changes: 1, lastInsertRowId: 1 };
      }
    }

    return { changes: 0, lastInsertRowId: 0 };
  }
}

let webDbInstance: WebSQLiteFallback | null = null;

export function getDatabase(): any {
  if (!webDbInstance) {
    webDbInstance = new WebSQLiteFallback();
  }
  return webDbInstance;
}

export function executeSqlSync(sql: string) {
  const db = getDatabase();
  db.execSync(sql);
}
