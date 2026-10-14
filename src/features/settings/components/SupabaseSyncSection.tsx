import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  isSupabaseConfigured,
} from '@/services/supabaseClient';
import { SupabaseSyncService, SyncStatus } from '@/services/supabaseSyncService';
import { showAlert } from '@/utils/alert';

const SQL_SCHEMA_TEXT = `-- Sthira PostgreSQL Schema for Supabase
-- Copy and paste this into Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS "UserProfile" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  current_weight REAL NOT NULL,
  height REAL NOT NULL,
  target_weight REAL NOT NULL,
  goal_type TEXT NOT NULL,
  target_rate_kg_per_week REAL NOT NULL,
  diet_type TEXT NOT NULL,
  eats_eggs INTEGER NOT NULL DEFAULT 0,
  eats_onion INTEGER NOT NULL DEFAULT 1,
  eats_garlic INTEGER NOT NULL DEFAULT 1,
  eats_mushrooms INTEGER NOT NULL DEFAULT 0,
  cuisine_preferences TEXT NOT NULL,
  gym_days_per_week INTEGER NOT NULL DEFAULT 4,
  tuesday_activity TEXT NOT NULL DEFAULT 'Yoga',
  sunday_activity TEXT NOT NULL DEFAULT 'Swimming',
  saturday_rest INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Goals" (
  id TEXT PRIMARY KEY,
  calories_target REAL NOT NULL,
  protein_target_min REAL NOT NULL,
  protein_target_max REAL NOT NULL,
  fat_target_min REAL NOT NULL,
  fat_target_max REAL NOT NULL,
  carbs_target REAL NOT NULL,
  water_target_liters REAL NOT NULL,
  sleep_hours_target REAL NOT NULL,
  workout_days_target INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "DailyLogs" (
  id TEXT PRIMARY KEY,
  date TEXT UNIQUE NOT NULL,
  calories_consumed REAL DEFAULT 0,
  protein_consumed REAL DEFAULT 0,
  carbs_consumed REAL DEFAULT 0,
  fat_consumed REAL DEFAULT 0,
  water_liters REAL DEFAULT 0,
  weight REAL,
  sleep_hours REAL,
  energy_rating INTEGER,
  mood_rating INTEGER,
  hunger_rating INTEGER,
  recovery_rating INTEGER,
  soreness_rating INTEGER,
  stress_rating INTEGER,
  coach_status TEXT DEFAULT 'ON TRACK',
  coach_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "WeightEntries" (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  weight_kg REAL NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "MealEntries" (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  raw_text TEXT NOT NULL,
  total_calories REAL NOT NULL,
  total_protein REAL NOT NULL,
  total_carbs REAL NOT NULL,
  total_fat REAL NOT NULL,
  confidence TEXT NOT NULL,
  is_verified_by_user INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "FoodItems" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  serving_size TEXT NOT NULL,
  serving_unit TEXT NOT NULL,
  serving_grams REAL,
  calories REAL NOT NULL,
  protein REAL NOT NULL,
  carbs REAL NOT NULL,
  fat REAL NOT NULL,
  fiber REAL DEFAULT 0,
  is_custom INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "NutritionEstimates" (
  id TEXT PRIMARY KEY,
  meal_entry_id TEXT NOT NULL REFERENCES "MealEntries"(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,
  calories_estimated REAL NOT NULL,
  protein_estimated REAL NOT NULL,
  carbs_estimated REAL NOT NULL,
  fat_estimated REAL NOT NULL,
  confidence_score TEXT NOT NULL,
  clarification_needed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "WaterEntries" (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  amount_ml REAL NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "SleepEntries" (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  quality_rating INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "JournalEntries" (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  entry_type TEXT NOT NULL,
  notes TEXT NOT NULL,
  sentiment_label TEXT,
  themes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Exercises" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  primary_muscle TEXT NOT NULL,
  secondary_muscles TEXT NOT NULL,
  equipment TEXT NOT NULL,
  difficulty_level TEXT NOT NULL,
  target_sets INTEGER NOT NULL,
  target_rep_range TEXT NOT NULL,
  rest_seconds INTEGER NOT NULL,
  instructions TEXT NOT NULL,
  common_mistakes TEXT NOT NULL,
  substitutions TEXT NOT NULL,
  starting_weight_kg REAL,
  last_weight_kg REAL,
  current_recommended_weight_kg REAL,
  is_custom INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "WorkoutPlans" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  day_of_week INTEGER,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "WorkoutSessions" (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  workout_plan_id TEXT REFERENCES "WorkoutPlans"(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  duration_seconds INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  difficulty_perceived TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "WorkoutExercises" (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES "WorkoutSessions"(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES "Exercises"(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "WorkoutSets" (
  id TEXT PRIMARY KEY,
  workout_exercise_id TEXT NOT NULL REFERENCES "WorkoutExercises"(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  weight_kg REAL NOT NULL,
  reps INTEGER NOT NULL,
  perceived_difficulty TEXT,
  rir INTEGER,
  is_completed INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Activities" (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  intensity TEXT NOT NULL,
  estimated_calories_burned REAL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "PainEntries" (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  body_area TEXT NOT NULL,
  pain_level INTEGER NOT NULL,
  activity_context TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "AIRecommendations" (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  recommendation_type TEXT NOT NULL,
  content TEXT NOT NULL,
  action_items TEXT,
  rationale TEXT,
  is_acknowledged INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "CuisineRecipes" (
  id TEXT PRIMARY KEY,
  cuisine TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  estimated_calories REAL NOT NULL,
  estimated_protein REAL NOT NULL,
  estimated_carbs REAL NOT NULL,
  estimated_fat REAL NOT NULL,
  ingredients_json TEXT NOT NULL,
  instructions TEXT,
  is_vegetarian INTEGER DEFAULT 1,
  has_eggs INTEGER DEFAULT 0,
  has_onion INTEGER DEFAULT 1,
  has_garlic INTEGER DEFAULT 1,
  has_mushrooms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS and Anon Access
DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'UserProfile', 'Goals', 'DailyLogs', 'WeightEntries', 'MealEntries',
    'FoodItems', 'NutritionEstimates', 'WaterEntries', 'SleepEntries',
    'JournalEntries', 'Exercises', 'WorkoutPlans', 'WorkoutSessions',
    'WorkoutExercises', 'WorkoutSets', 'Activities', 'PainEntries',
    'AIRecommendations', 'CuisineRecipes'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Allow anon all on %s" ON %I;', tbl, tbl);
    EXECUTE format('CREATE POLICY "Allow anon all on %s" ON %I FOR ALL USING (true) WITH CHECK (true);', tbl, tbl);
  END LOOP;
END $$;
`;

export const SupabaseSyncSection: React.FC = () => {
  const { colors } = useAppTheme();

  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(SupabaseSyncService.getStatus());
  const [bannerMessage, setBannerMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const creds = getSupabaseCredentials();
    setUrl(creds.url);
    setAnonKey(creds.anonKey);

    const unsub = SupabaseSyncService.subscribe((status) => {
      setSyncStatus(status);
    });
    return unsub;
  }, []);

  const handleSaveAndTest = async () => {
    if (!url.trim() || !anonKey.trim()) {
      showAlert('Configuration Required', 'Please enter both your Supabase Project URL and Anon API Key.');
      return;
    }

    if (!url.trim().startsWith('https://')) {
      showAlert('Invalid URL', 'Supabase Project URL must start with "https://" (e.g. https://your-id.supabase.co)');
      return;
    }

    saveSupabaseCredentials(url.trim(), anonKey.trim());
    setIsTesting(true);
    setBannerMessage(null);

    const res = await SupabaseSyncService.testConnection();
    setIsTesting(false);

    if (res.success) {
      setBannerMessage({ text: res.message, type: 'success' });
      showAlert('Connected!', 'Connection to your Supabase project succeeded! Ready to sync.');
    } else {
      setBannerMessage({ text: res.message, type: 'error' });
      showAlert('Connection Issue', res.message);
    }
  };

  const handleSyncNow = async () => {
    if (!isSupabaseConfigured()) {
      showAlert('Setup Required', 'Please configure and save your Supabase URL and Key first.');
      return;
    }

    setIsSyncing(true);
    setBannerMessage(null);

    const res = await SupabaseSyncService.syncAll();
    setIsSyncing(false);

    if (res.success) {
      setBannerMessage({ text: res.message, type: 'success' });
      showAlert('Sync Complete', res.message);
    } else {
      setBannerMessage({ text: res.message, type: 'error' });
      showAlert('Sync Failed', res.message);
    }
  };

  const handleCopySchema = async () => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(SQL_SCHEMA_TEXT);
        setCopiedSchema(true);
        setTimeout(() => setCopiedSchema(false), 2500);
      } else {
        setCopiedSchema(true);
        setTimeout(() => setCopiedSchema(false), 2500);
        showAlert('Copied', 'SQL schema script is ready to paste into Supabase SQL Editor.');
      }
    } catch {
      setCopiedSchema(true);
    }
  };

  const isConfigured = Boolean(url && anonKey && url.startsWith('https://'));

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
        CENTRAL CLOUD DATABASE (SUPABASE)
      </Text>

      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <Ionicons name="cloud-done-outline" size={24} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Multi-Device Live Cloud Sync
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
              Seamless real-time synchronization between Expo Go & Mobile Browser
            </Text>
          </View>
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: isConfigured
                  ? syncStatus.state === 'error'
                    ? 'rgba(239, 68, 68, 0.15)'
                    : 'rgba(34, 197, 94, 0.15)'
                  : 'rgba(148, 163, 184, 0.15)',
              },
            ]}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: isConfigured
                    ? syncStatus.state === 'error'
                      ? '#EF4444'
                      : '#22C55E'
                    : '#94A3B8',
                },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                {
                  color: isConfigured
                    ? syncStatus.state === 'error'
                      ? '#EF4444'
                      : '#22C55E'
                    : '#94A3B8',
                },
              ]}>
              {syncStatus.state === 'syncing'
                ? 'Syncing...'
                : isConfigured
                ? 'Connected'
                : 'Not Linked'}
            </Text>
          </View>
        </View>

        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Connect your free Supabase database so meals, water, workouts, and weights automatically sync across your iPhone, Expo Go, and browser without ever losing progress.
        </Text>

        {bannerMessage && (
          <View
            style={[
              styles.banner,
              {
                backgroundColor:
                  bannerMessage.type === 'success'
                    ? 'rgba(34, 197, 94, 0.12)'
                    : 'rgba(239, 68, 68, 0.12)',
                borderColor: bannerMessage.type === 'success' ? '#22C55E' : '#EF4444',
              },
            ]}>
            <Ionicons
              name={bannerMessage.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
              size={18}
              color={bannerMessage.type === 'success' ? '#22C55E' : '#EF4444'}
            />
            <Text
              style={[
                styles.bannerText,
                { color: bannerMessage.type === 'success' ? '#22C55E' : '#EF4444' },
              ]}>
              {bannerMessage.text}
            </Text>
          </View>
        )}

        {/* Inputs */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Supabase Project URL
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.cardElevated,
                borderColor: colors.cardBorder,
                color: colors.text,
              },
            ]}
            placeholder="https://xyzabcdefg.supabase.co"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            value={url}
            onChangeText={setUrl}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Supabase Anon Public API Key
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.cardElevated,
                borderColor: colors.cardBorder,
                color: colors.text,
              },
            ]}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            value={anonKey}
            onChangeText={setAnonKey}
          />
        </View>

        {/* Actions */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
            onPress={handleSaveAndTest}
            disabled={isTesting}
            activeOpacity={0.8}>
            {isTesting ? (
              <ActivityIndicator size="small" color="#0B0F17" />
            ) : (
              <>
                <Ionicons name="link-outline" size={17} color="#0B0F17" />
                <Text style={[styles.primaryBtnText, { color: '#0B0F17' }]}>Save & Connect</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              {
                backgroundColor: colors.cardElevated,
                borderColor: colors.cardBorder,
                opacity: isConfigured ? 1 : 0.6,
              },
            ]}
            onPress={handleSyncNow}
            disabled={!isConfigured || isSyncing}
            activeOpacity={0.8}>
            {isSyncing ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : (
              <>
                <Ionicons name="sync-outline" size={17} color={colors.text} />
                <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Sync Now</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.schemaLink}
          onPress={() => setIsSchemaModalOpen(true)}
          activeOpacity={0.7}>
          <Ionicons name="code-slash-outline" size={16} color={colors.accent} />
          <Text style={[styles.schemaLinkText, { color: colors.accent }]}>
            View / Copy SQL Schema for Supabase Editor
          </Text>
        </TouchableOpacity>
      </Card>

      {/* SQL Schema Modal */}
      <Modal
        visible={isSchemaModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSchemaModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Supabase SQL Schema</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                  Copy and paste into your Supabase SQL Editor
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsSchemaModalOpen(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.schemaScroll}>
              <TextInput
                style={[
                  styles.schemaText,
                  { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.background },
                ]}
                multiline
                editable={false}
                value={SQL_SCHEMA_TEXT}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title={copiedSchema ? 'Copied to Clipboard! ✓' : 'Copy SQL Schema'}
                onPress={handleCopySchema}
                style={{ flex: 1 }}
              />
              <Button
                title="Done"
                variant="outline"
                onPress={() => setIsSchemaModalOpen(false)}
                style={{ minWidth: 80 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  bannerText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    height: 42,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
    borderRadius: BorderRadius.md,
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  schemaLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.xs,
    marginTop: 2,
  },
  schemaLinkText: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 550,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  schemaScroll: {
    maxHeight: 350,
  },
  schemaText: {
    height: 350,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
});
