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
    const cleanSql = sql.trim().replace(/\s+/g, ' ');

    // Handle SELECT COUNT(*) FROM <table>
    const countMatch = cleanSql.match(/SELECT COUNT\(\*\)\s*(?:as \w+)?\s*FROM (\w+)/i);
    if (countMatch) {
      const table = countMatch[1];
      const rows = this.tables.get(table) || [];
      return [{ count: rows.length } as unknown as T];
    }

    // Handle SELECT <columns> FROM <table> WHERE <col> (=|>=|<=|>|<) (?|'val'|num) [ORDER BY <col> [ASC|DESC]] [LIMIT ?|<num>]
    const whereMatch = cleanSql.match(/^SELECT ([\s\S]+?) FROM (\w+)\s+WHERE\s+(\w+)\s*(=|>=|<=|>|<|!=)\s*(\?|'[^']*'|\d+)(?:\s+ORDER\s+BY\s+([\w\s,]+?))?(?:\s+LIMIT\s+(\?|\d+))?$/i);
    if (whereMatch) {
      const selectColsRaw = whereMatch[1].trim();
      const table = whereMatch[2];
      const col = whereMatch[3];
      const op = whereMatch[4];
      const valRaw = whereMatch[5];
      const orderByClause = whereMatch[6];
      const limitRaw = whereMatch[7];

      let paramIdx = 0;
      let val: any;
      if (valRaw === '?') {
        val = params[paramIdx++];
      } else {
        val = valRaw.startsWith("'") ? valRaw.slice(1, -1) : Number(valRaw);
      }

      let limit: number | undefined;
      if (limitRaw === '?') {
        limit = params[paramIdx++];
      } else if (limitRaw) {
        limit = parseInt(limitRaw, 10);
      }

      let rows = (this.tables.get(table) || []).filter((r) => {
        const itemVal = r[col];
        if (op === '=') return itemVal == val;
        if (op === '!=') return itemVal != val;
        if (op === '>=') return itemVal >= val;
        if (op === '<=') return itemVal <= val;
        if (op === '>') return itemVal > val;
        if (op === '<') return itemVal < val;
        return false;
      });

      if (orderByClause) {
        const primaryOrder = orderByClause.split(',')[0].trim();
        const parts = primaryOrder.split(/\s+/);
        const orderCol = parts[0];
        const orderDir = (parts[1] || 'ASC').toUpperCase();
        rows.sort((a, b) => {
          if (a[orderCol] < b[orderCol]) return orderDir === 'DESC' ? 1 : -1;
          if (a[orderCol] > b[orderCol]) return orderDir === 'DESC' ? -1 : 1;
          return 0;
        });
      }
      if (limit !== undefined) {
        rows = rows.slice(0, limit);
      }

      if (selectColsRaw !== '*') {
        const colsToPick = selectColsRaw.split(',').map((c) => c.trim().split(/\s+as\s+/i)[0].trim());
        return rows.map((r) => {
          const picked: any = {};
          colsToPick.forEach((c) => {
            picked[c] = r[c];
          });
          return picked;
        }) as unknown as T[];
      }

      return rows as unknown as T[];
    }

    // Handle SELECT * FROM <table> WHERE <col> IN (?, ?, ...)
    const inMatch = cleanSql.match(/SELECT ([\s\S]+?) FROM (\w+)\s+WHERE\s+(\w+)\s*IN\s*\(([^)]+)\)/i);
    if (inMatch) {
      const table = inMatch[2];
      const col = inMatch[3];
      const valSet = new Set(params);
      const rows = (this.tables.get(table) || []).filter((r) => valSet.has(r[col]));
      return rows as unknown as T[];
    }

    // Handle SELECT <columns> FROM <table> [ORDER BY <cols>] [LIMIT ?|<num>]
    const selectOrderMatch = cleanSql.match(/^SELECT ([\s\S]+?) FROM (\w+)(?:\s+ORDER\s+BY\s+([\w\s,]+?))?(?:\s+LIMIT\s+(\?|\d+))?$/i);
    if (selectOrderMatch) {
      const selectColsRaw = selectOrderMatch[1].trim();
      const table = selectOrderMatch[2];
      const orderByClause = selectOrderMatch[3];
      const limitRaw = selectOrderMatch[4];
      let limit: number | undefined;
      if (limitRaw === '?') {
        limit = params[0];
      } else if (limitRaw) {
        limit = parseInt(limitRaw, 10);
      }

      const rows = [...(this.tables.get(table) || [])];
      if (orderByClause) {
        const primaryOrder = orderByClause.split(',')[0].trim();
        const parts = primaryOrder.split(/\s+/);
        const orderCol = parts[0];
        const orderDir = (parts[1] || 'ASC').toUpperCase();
        rows.sort((a, b) => {
          if (a[orderCol] < b[orderCol]) return orderDir === 'DESC' ? 1 : -1;
          if (a[orderCol] > b[orderCol]) return orderDir === 'DESC' ? -1 : 1;
          return 0;
        });
      }
      const sliced = limit !== undefined ? rows.slice(0, limit) : rows;

      if (selectColsRaw !== '*') {
        const colsToPick = selectColsRaw.split(',').map((c) => c.trim().split(/\s+as\s+/i)[0].trim());
        return sliced.map((r) => {
          const picked: any = {};
          colsToPick.forEach((c) => {
            picked[c] = r[c];
          });
          return picked;
        }) as unknown as T[];
      }

      return sliced as unknown as T[];
    }

    return [];
  }

  runSync(sql: string, params: any[] = []): { changes: number; lastInsertRowId: number } {
    const cleanSql = sql.trim().replace(/\s+/g, ' ');

    // Handle DELETE FROM <table> [WHERE <col> <op> ?]
    const deleteMatch = cleanSql.match(/DELETE FROM (\w+)(?:\s+WHERE\s+(\w+)\s*(=|<|>|<=|>=)\s*(\?|'[^']*'|\d+))?/i);
    if (deleteMatch) {
      const table = deleteMatch[1];
      const col = deleteMatch[2];
      const op = deleteMatch[3];
      const valRaw = deleteMatch[4];
      if (!this.tables.has(table)) {
        return { changes: 0, lastInsertRowId: 0 };
      }
      let rows = this.tables.get(table)!;
      const initialCount = rows.length;
      if (col && op && valRaw) {
        const val: any = valRaw === '?' ? params[0] : (typeof valRaw === 'string' && valRaw.startsWith("'") ? valRaw.slice(1, -1) : Number(valRaw));
        rows = rows.filter((r) => {
          const itemVal = r[col];
          if (op === '=') return itemVal != val;
          if (op === '<') return !(itemVal < val);
          if (op === '>') return !(itemVal > val);
          if (op === '<=') return !(itemVal <= val);
          if (op === '>=') return !(itemVal >= val);
          return true;
        });
        this.tables.set(table, rows);
        this.saveToStorage();
        return { changes: initialCount - rows.length, lastInsertRowId: 0 };
      } else if (!cleanSql.toLowerCase().includes('where')) {
        // Only clear entire table if NO WHERE clause was provided at all!
        this.tables.set(table, []);
        this.saveToStorage();
        return { changes: initialCount, lastInsertRowId: 0 };
      } else {
        // Complex WHERE clause not matched by simple regex (e.g. NOT IN or LIKE) — preserve rows safely!
        return { changes: 0, lastInsertRowId: 0 };
      }
    }

    // Handle INSERT (OR REPLACE / OR IGNORE) INTO <table> (<cols>) VALUES (...)
    const insertMatch = cleanSql.match(/INSERT\s*(?:OR\s+REPLACE\s+|OR\s+IGNORE\s+)?INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES/i);
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
      // If table has primary key 'id' or 'key' or 'date', replace or append
      const keyCol = cols.includes('key') ? 'key' : cols.includes('id') ? 'id' : cols.includes('date') ? 'date' : null;
      if (keyCol && row[keyCol] !== undefined) {
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
    const updateMatch = cleanSql.match(/UPDATE (\w+) SET ([\s\S]+?) WHERE (\w+)\s*=\s*\?/i);
    if (updateMatch) {
      const table = updateMatch[1];
      const rawSetClauses = updateMatch[2].split(',').map((s) => s.trim());
      const whereCol = updateMatch[3];
      const whereVal = params[params.length - 1];

      const rows = this.tables.get(table) || [];
      const target = rows.find((r) => r[whereCol] == whereVal);

      if (target) {
        let paramIdx = 0;
        for (const clause of rawSetClauses) {
          const parts = clause.split('=').map((p) => p.trim());
          const colName = parts[0];
          const valExpr = parts[1];
          if (valExpr === '?') {
            target[colName] = params[paramIdx++];
          } else {
            const num = Number(valExpr);
            target[colName] = !isNaN(num) ? num : valExpr.replace(/^['"]|['"]$/g, '');
          }
        }
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
