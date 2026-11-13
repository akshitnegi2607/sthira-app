export type UserRole = 'master' | 'friend';

export interface UserAccount {
  id: string; // 'jay', 'akku', 'ashish', 'div'
  username: string; // lowercase handle for case-insensitive matching
  displayName: string;
  password: string; // user password
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
    password: 'Quercus2026',
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
    id: 'akku',
    username: 'akku',
    displayName: 'Akku',
    password: 'Akku1234',
    role: 'friend',
    avatarEmoji: '⚡',
    dbName: 'aicoach_akku.db',
    webStorageKey: '__aicoach_web_db_akku__',
    bio: 'Strength & Hypertrophy',
    initialWeight: 68.0,
    targetWeight: 72.0,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'ashish',
    username: 'ashish',
    displayName: 'Ashish',
    password: 'Ashish1234',
    role: 'friend',
    avatarEmoji: '🎯',
    dbName: 'aicoach_ashish.db',
    webStorageKey: '__aicoach_web_db_ashish__',
    bio: 'Conditioning & Performance',
    initialWeight: 70.0,
    targetWeight: 75.0,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'div',
    username: 'div',
    displayName: 'Div',
    password: 'Isha1234',
    role: 'friend',
    avatarEmoji: '🌸',
    dbName: 'aicoach_div.db',
    webStorageKey: '__aicoach_web_db_div__',
    bio: 'Athletic Toning & Mobility',
    initialWeight: 55.0,
    targetWeight: 58.0,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
];
