import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Switch,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useProfileStore } from '@/stores/useProfileStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SthiraBrandLogo } from '@/components/ui/SthiraBrandLogo';

export default function SettingsScreen() {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();

  const profile = useProfileStore((s) => s.profile);
  const goals = useProfileStore((s) => s.goals);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const updateGoals = useProfileStore((s) => s.updateGoals);

  // Form states
  const [name, setName] = useState(profile.name);
  const [currentWeight, setCurrentWeight] = useState(profile.current_weight.toString());
  const [targetWeight, setTargetWeight] = useState(profile.target_weight.toString());
  const [height, setHeight] = useState(profile.height.toString());
  const [targetRate, setTargetRate] = useState(profile.target_rate_kg_per_week.toString());
  const [dietType, setDietType] = useState(profile.diet_type);

  // Dietary switches
  const [eatsEggs, setEatsEggs] = useState(profile.eats_eggs === 1);
  const [eatsOnion, setEatsOnion] = useState(profile.eats_onion === 1);
  const [eatsGarlic, setEatsGarlic] = useState(profile.eats_garlic === 1);
  const [eatsMushrooms, setEatsMushrooms] = useState(profile.eats_mushrooms === 1);

  // Routine
  const [gymDays, setGymDays] = useState(profile.gym_days_per_week.toString());
  const [tuesdayActivity, setTuesdayActivity] = useState(profile.tuesday_activity);
  const [sundayActivity, setSundayActivity] = useState(profile.sunday_activity);
  const [saturdayRest, setSaturdayRest] = useState(profile.saturday_rest === 1);

  // Goals
  const [caloriesTarget, setCaloriesTarget] = useState(goals.calories_target.toString());
  const [proteinTargetMax, setProteinTargetMax] = useState(goals.protein_target_max.toString());
  const [fatTargetMax, setFatTargetMax] = useState(goals.fat_target_max.toString());
  const [waterTarget, setWaterTarget] = useState(goals.water_target_liters.toString());

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    updateProfile({
      name,
      current_weight: parseFloat(currentWeight) || profile.current_weight,
      target_weight: parseFloat(targetWeight) || profile.target_weight,
      height: parseFloat(height) || profile.height,
      target_rate_kg_per_week: parseFloat(targetRate) || profile.target_rate_kg_per_week,
      diet_type: dietType,
      eats_eggs: eatsEggs ? 1 : 0,
      eats_onion: eatsOnion ? 1 : 0,
      eats_garlic: eatsGarlic ? 1 : 0,
      eats_mushrooms: eatsMushrooms ? 1 : 0,
      gym_days_per_week: parseInt(gymDays, 10) || profile.gym_days_per_week,
      tuesday_activity: tuesdayActivity,
      sunday_activity: sundayActivity,
      saturday_rest: saturdayRest ? 1 : 0,
    });

    updateGoals({
      calories_target: parseFloat(caloriesTarget) || goals.calories_target,
      protein_target_max: parseFloat(proteinTargetMax) || goals.protein_target_max,
      fat_target_max: parseFloat(fatTargetMax) || goals.fat_target_max,
      water_target_liters: parseFloat(waterTarget) || goals.water_target_liters,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      router.back();
    }, 600);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: 'transparent' }]}
      contentContainerStyle={styles.content}>
      {/* Profile Section */}
      <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
        PERSONAL PROFILE
      </Text>

      <Card style={styles.card}>
        <View style={styles.fieldRow}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Name</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.cardBorder }]}
            value={name}
            onChangeText={setName}
            placeholder="Jay"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.fieldRow}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Current Weight (kg)</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.cardBorder }]}
            value={currentWeight}
            onChangeText={setCurrentWeight}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.fieldRow}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Target Weight (kg)</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.cardBorder }]}
            value={targetWeight}
            onChangeText={setTargetWeight}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.fieldRow}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Height (cm)</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.cardBorder }]}
            value={height}
            onChangeText={setHeight}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.fieldRow}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Target Gain Rate (kg/wk)</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.cardBorder }]}
            value={targetRate}
            onChangeText={setTargetRate}
            keyboardType="decimal-pad"
          />
        </View>
      </Card>

      {/* Dietary Preferences Section */}
      <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
        DIETARY PREFERENCES
      </Text>

      <Card style={styles.card}>
        <View style={styles.fieldRow}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Diet Type</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.cardBorder }]}
            value={dietType}
            onChangeText={setDietType}
          />
        </View>

        <View style={styles.toggleRow}>
          <View>
            <Text style={[styles.toggleTitle, { color: colors.text }]}>Include Eggs</Text>
            <Text style={[styles.toggleSubtitle, { color: colors.textMuted }]}>Excluded by default</Text>
          </View>
          <Switch
            value={eatsEggs}
            onValueChange={setEatsEggs}
            trackColor={{ false: colors.cardBorder, true: colors.accent }}
          />
        </View>

        <View style={styles.toggleRow}>
          <View>
            <Text style={[styles.toggleTitle, { color: colors.text }]}>Include Onion</Text>
            <Text style={[styles.toggleSubtitle, { color: colors.textMuted }]}>Allowed in recipes</Text>
          </View>
          <Switch
            value={eatsOnion}
            onValueChange={setEatsOnion}
            trackColor={{ false: colors.cardBorder, true: colors.accent }}
          />
        </View>

        <View style={styles.toggleRow}>
          <View>
            <Text style={[styles.toggleTitle, { color: colors.text }]}>Include Garlic</Text>
            <Text style={[styles.toggleSubtitle, { color: colors.textMuted }]}>Allowed in recipes</Text>
          </View>
          <Switch
            value={eatsGarlic}
            onValueChange={setEatsGarlic}
            trackColor={{ false: colors.cardBorder, true: colors.accent }}
          />
        </View>

        <View style={styles.toggleRow}>
          <View>
            <Text style={[styles.toggleTitle, { color: colors.text }]}>Include Mushrooms</Text>
            <Text style={[styles.toggleSubtitle, { color: colors.textMuted }]}>Excluded by default</Text>
          </View>
          <Switch
            value={eatsMushrooms}
            onValueChange={setEatsMushrooms}
            trackColor={{ false: colors.cardBorder, true: colors.accent }}
          />
        </View>
      </Card>

      {/* Routine Section */}
      <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
        WEEKLY SCHEDULE
      </Text>

      <Card style={styles.card}>
        <View style={styles.fieldRow}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Gym Days / Week</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.cardBorder }]}
            value={gymDays}
            onChangeText={setGymDays}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.fieldRow}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Tuesday Activity</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.cardBorder }]}
            value={tuesdayActivity}
            onChangeText={setTuesdayActivity}
          />
        </View>

        <View style={styles.fieldRow}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Sunday Activity</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.cardBorder }]}
            value={sundayActivity}
            onChangeText={setSundayActivity}
          />
        </View>

        <View style={styles.toggleRow}>
          <View>
            <Text style={[styles.toggleTitle, { color: colors.text }]}>Saturday Rest Day</Text>
            <Text style={[styles.toggleSubtitle, { color: colors.textMuted }]}>Dedicated recovery day</Text>
          </View>
          <Switch
            value={saturdayRest}
            onValueChange={setSaturdayRest}
            trackColor={{ false: colors.cardBorder, true: colors.accent }}
          />
        </View>
      </Card>

      {/* Starting Targets Section */}
      <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
        NUTRITION TARGETS
      </Text>

      <Card style={styles.card}>
        <View style={styles.fieldRow}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Daily Calories (kcal)</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.cardBorder }]}
            value={caloriesTarget}
            onChangeText={setCaloriesTarget}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.fieldRow}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Protein Target (g)</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.cardBorder }]}
            value={proteinTargetMax}
            onChangeText={setProteinTargetMax}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.fieldRow}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Fat Target (g)</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.cardBorder }]}
            value={fatTargetMax}
            onChangeText={setFatTargetMax}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.fieldRow}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Hydration Target (L)</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.cardBorder }]}
            value={waterTarget}
            onChangeText={setWaterTarget}
            keyboardType="decimal-pad"
          />
        </View>
      </Card>

      <Button
        title={savedSuccess ? 'Changes Saved ✓' : 'Save Profile Changes'}
        onPress={handleSave}
        style={{ marginTop: Spacing.md }}
      />

      <View style={styles.footerBranding}>
        <SthiraBrandLogo size="medium" showTagline />
        <Text style={[styles.versionText, { color: colors.textMuted }]}>
          v1.0.0 • Offline-First Personal AI Coach
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footerBranding: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.xs,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
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
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    fontSize: 14,
    minWidth: 120,
    textAlign: 'right',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  toggleSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
});
