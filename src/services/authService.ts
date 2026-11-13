import { DEFAULT_ACCOUNTS, UserAccount } from '../types/auth';
import { setActiveDatabase, resetDatabaseInstance } from '../database/db';
import { runMigrations } from '../database/migrations';

declare const require: any;

const AUTH_DB_NAME = 'aicoach_auth.db';
const WEB_ACCOUNTS_KEY = '__sthira_accounts_v2__';
const WEB_ACTIVE_ACCOUNT_KEY = '__sthira_active_account_id_v2__';

class AuthServiceImplementation {
  private memoryAccounts: Map<string, UserAccount> = new Map();
  private memoryActiveAccountId: string | null = null;
  private isInitialized = false;

  constructor() {
    this.init();
  }

  public init(): void {
    if (this.isInitialized) return;

    // 1. Initialize default accounts in memory map
    for (const acc of DEFAULT_ACCOUNTS) {
      this.memoryAccounts.set(acc.id, { ...acc });
    }

    // 2. Try loading from Web localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const storedAccounts = window.localStorage.getItem(WEB_ACCOUNTS_KEY);
        if (storedAccounts) {
          const parsed = JSON.parse(storedAccounts) as UserAccount[];
          for (const acc of parsed) {
            this.memoryAccounts.set(acc.id, acc);
          }
        } else {
          this.persistWebAccounts();
        }

        const storedActiveId = window.localStorage.getItem(WEB_ACTIVE_ACCOUNT_KEY);
        if (storedActiveId && this.memoryAccounts.has(storedActiveId)) {
          this.memoryActiveAccountId = storedActiveId;
        } else {
          this.memoryActiveAccountId = null;
        }
      } catch (e) {
        console.warn('AuthService: Could not read from localStorage', e);
      }
      this.isInitialized = true;
      if (this.memoryActiveAccountId) {
        this.mountActiveAccountDatabase();
      }
      return;
    }

    // 3. Try loading from Native SQLite
    try {
      const SQLite = require('expo-sqlite');
      if (SQLite && typeof SQLite.openDatabaseSync === 'function') {
        const authDb = SQLite.openDatabaseSync(AUTH_DB_NAME);

        authDb.execSync(`
          CREATE TABLE IF NOT EXISTS Accounts (
            id TEXT PRIMARY KEY,
            username TEXT NOT NULL,
            display_name TEXT NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            avatar_emoji TEXT NOT NULL,
            db_name TEXT NOT NULL,
            web_storage_key TEXT NOT NULL,
            bio TEXT,
            initial_weight REAL,
            target_weight REAL,
            created_at TEXT NOT NULL
          );
          CREATE TABLE IF NOT EXISTS AuthSession (
            id TEXT PRIMARY KEY,
            active_account_id TEXT,
            last_login_at TEXT
          );
        `);

        // Migration: add password column if previously using pin
        try {
          authDb.runSync('ALTER TABLE Accounts ADD COLUMN password TEXT');
        } catch {}

        // Seed accounts if table is empty or update default credentials
        for (const acc of DEFAULT_ACCOUNTS) {
          authDb.runSync(
            `INSERT OR REPLACE INTO Accounts (
              id, username, display_name, password, role, avatar_emoji,
              db_name, web_storage_key, bio, initial_weight, target_weight, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              acc.id,
              acc.username,
              acc.displayName,
              acc.password,
              acc.role,
              acc.avatarEmoji,
              acc.dbName,
              acc.webStorageKey,
              acc.bio || '',
              acc.initialWeight || 65,
              acc.targetWeight || 67,
              acc.createdAt,
            ]
          );
        }

        // Load existing accounts into memory
        const rows = authDb.getAllSync('SELECT * FROM Accounts') as any[];
        for (const r of rows) {
          this.memoryAccounts.set(r.id, {
            id: r.id,
            username: r.username,
            displayName: r.display_name,
            password: r.password,
            role: r.role,
            avatarEmoji: r.avatar_emoji,
            dbName: r.db_name,
            webStorageKey: r.web_storage_key,
            bio: r.bio,
            initialWeight: r.initial_weight,
            targetWeight: r.target_weight,
            createdAt: r.created_at,
          });
        }

        // Check active session
        const sessionRow = authDb.getFirstSync(
          "SELECT active_account_id FROM AuthSession WHERE id = 'current_session'"
        ) as { active_account_id: string } | null;

        if (sessionRow?.active_account_id && this.memoryAccounts.has(sessionRow.active_account_id)) {
          this.memoryActiveAccountId = sessionRow.active_account_id;
        } else {
          this.memoryActiveAccountId = null;
        }
      }
    } catch {
      // In-memory fallback
    }

    this.isInitialized = true;
    if (this.memoryActiveAccountId) {
      this.mountActiveAccountDatabase();
    }
  }

  private persistWebAccounts(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const list = Array.from(this.memoryAccounts.values());
        window.localStorage.setItem(WEB_ACCOUNTS_KEY, JSON.stringify(list));
      } catch (e) {
        console.warn('AuthService: Failed to save web accounts', e);
      }
    }
  }

  private persistActiveAccountId(accountId: string | null): void {
    this.memoryActiveAccountId = accountId;

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        if (accountId) {
          window.localStorage.setItem(WEB_ACTIVE_ACCOUNT_KEY, accountId);
        } else {
          window.localStorage.removeItem(WEB_ACTIVE_ACCOUNT_KEY);
        }
      } catch (e) {
        console.warn('AuthService: Failed to save active account to localStorage', e);
      }
    }

    try {
      const SQLite = require('expo-sqlite');
      if (SQLite && typeof SQLite.openDatabaseSync === 'function') {
        const authDb = SQLite.openDatabaseSync(AUTH_DB_NAME);
        authDb.runSync(
          "INSERT OR REPLACE INTO AuthSession (id, active_account_id, last_login_at) VALUES ('current_session', ?, ?)",
          [accountId, new Date().toISOString()]
        );
      }
    } catch {}
  }

  private mountActiveAccountDatabase(): void {
    const active = this.getActiveAccount();
    if (active) {
      setActiveDatabase(active.dbName, active.webStorageKey);
      try {
        runMigrations({
          name: active.displayName,
          current_weight: active.initialWeight,
          target_weight: active.targetWeight,
        });
      } catch (err) {
        console.warn('[AuthService] Migration warning on active mount:', err);
      }
    }
  }

  public getActiveAccount(): UserAccount | null {
    this.init();
    if (!this.memoryActiveAccountId) return null;
    return this.memoryAccounts.get(this.memoryActiveAccountId) || null;
  }

  public getActiveAccountId(): string | null {
    this.init();
    return this.memoryActiveAccountId;
  }

  public isAuthenticated(): boolean {
    return this.getActiveAccount() !== null;
  }

  /**
   * Case-insensitive username lookup and secure password verification.
   * Does NOT leak other users' presence or existence.
   */
  public login(username: string, password: string): { success: boolean; account?: UserAccount; error?: string } {
    this.init();
    const cleanUser = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUser || !cleanPassword) {
      return { success: false, error: 'Please enter both username and password.' };
    }

    // Case-insensitive lookup
    let matchedAccount: UserAccount | null = null;
    for (const acc of this.memoryAccounts.values()) {
      if (acc.username.toLowerCase() === cleanUser) {
        matchedAccount = acc;
        break;
      }
    }

    if (!matchedAccount || matchedAccount.password !== cleanPassword) {
      return { success: false, error: 'Invalid username or password.' };
    }

    // Successful login: persist session and mount isolated database
    this.persistActiveAccountId(matchedAccount.id);
    setActiveDatabase(matchedAccount.dbName, matchedAccount.webStorageKey);

    try {
      runMigrations({
        name: matchedAccount.displayName,
        current_weight: matchedAccount.initialWeight,
        target_weight: matchedAccount.targetWeight,
      });
    } catch (e) {
      console.warn('[AuthService] runMigrations warning after login:', e);
    }

    return { success: true, account: matchedAccount };
  }

  public logout(): void {
    this.init();
    this.persistActiveAccountId(null);
    resetDatabaseInstance();
  }

  public getAccounts(): UserAccount[] {
    this.init();
    return Array.from(this.memoryAccounts.values());
  }
}

export const AuthService = new AuthServiceImplementation();
