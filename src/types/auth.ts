export type UserRole = 'master' | 'friend';

export interface UserAccount {
  id: string; // 'jay', 'arjun', 'rohan', 'priya'
  username: string;
  displayName: string;
  pin: string; // 4-digit numeric PIN
  role: UserRole;
  avatarEmoji: string;
  dbName: string; // SQLite database file, e.g. 'aicoach.db' for Jay
  webStorageKey: string; // Web localStorage key, e.g. '__aicoach_web_db__' for Jay
  bio?: string;
  initialWeight?: number;
  targetWeight?: number;
  createdAt: string;
}

export const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    id: 'jay',
    username: 'jay',
    displayName: 'Jay',
    pin: '1234',
    role: 'master',
    avatarEmoji: '👑',
    dbName: 'aicoach.db',
    webStorageKey: '__aicoach_web_db__',
    bio: 'Master Account • Lean Bulk 64.0 → 67.0 kg',
    initialWeight: 65.8,
    targetWeight: 67.0,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'arjun',
    username: 'arjun',
    displayName: 'Arjun',
    pin: '1111',
    role: 'friend',
    avatarEmoji: '⚡',
    dbName: 'aicoach_arjun.db',
    webStorageKey: '__aicoach_web_db_arjun__',
    bio: 'Strength & Hypertrophy • 68.0 → 72.0 kg',
    initialWeight: 68.0,
    targetWeight: 72.0,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'rohan',
    username: 'rohan',
    displayName: 'Rohan',
    pin: '2222',
    role: 'friend',
    avatarEmoji: '🎯',
    dbName: 'aicoach_rohan.db',
    webStorageKey: '__aicoach_web_db_rohan__',
    bio: 'Functional Conditioning • 70.0 → 75.0 kg',
    initialWeight: 70.0,
    targetWeight: 75.0,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'priya',
    username: 'priya',
    displayName: 'Priya',
    pin: '3333',
    role: 'friend',
    avatarEmoji: '🌸',
    dbName: 'aicoach_priya.db',
    webStorageKey: '__aicoach_web_db_priya__',
    bio: 'Toning & Athletic Mobility • 55.0 → 58.0 kg',
    initialWeight: 55.0,
    targetWeight: 58.0,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
];
