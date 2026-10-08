import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useProfileStore } from '@/stores/useProfileStore';
import { useDashboardStore } from '@/stores/useDashboardStore';

export default function NutritionScreen() {
  const { colors, isDark } = useAppTheme();
  const goals = useProfileStore((s) => s.goals);
  const todayLog = useDashboardStore((s) => s.todayLog);

  const calRemaining = Math.max(0, goals.calories_target - todayLog.calories_consumed);
  const proRemaining = Math.max(0, goals.protein_target_max - todayLog.protein_consumed);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      {/* Nutrition Header Card */}
      <Card elevated style={styles.card}>
        <View style={styles.badgeRow}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            DAILY TARGETS
          </Text>
          <View style={[styles.pill, { backgroundColor: colors.cardBorder }]}>
            <Text style={[styles.pillText, { color: colors.textMuted }]}>ESTIMATED</Text>
          </View>
        </View>

        <Text style={[styles.mainVal, { color: colors.text }]}>
          {todayLog.calories_consumed.toLocaleString()}{' '}
          <Text style={[styles.mainValTarget, { color: colors.textMuted }]}>
            / {goals.calories_target.toLocaleString()} kcal
          </Text>
        </Text>
        <Text style={[styles.remainingText, { color: colors.calories }]}>
          {calRemaining} kcal remaining
        </Text>

        <View style={{ marginTop: Spacing.md }}>
          <ProgressBar
            progress={todayLog.calories_consumed / goals.calories_target}
            color={colors.calories}
            height={8}
          />
        </View>

        {/* Macro Bars */}
        <View style={styles.macroRow}>
          <View style={styles.macroItem}>
            <Text style={[styles.macroLabel, { color: colors.textMuted }]}>Protein</Text>
            <Text style={[styles.macroVal, { color: colors.protein }]}>
              {Math.round(todayLog.protein_consumed)} / {goals.protein_target_max}g
            </Text>
            <Text style={[styles.macroSub, { color: colors.textMuted }]}>
              {proRemaining}g remaining
            </Text>
          </View>

          <View style={styles.macroItem}>
            <Text style={[styles.macroLabel, { color: colors.textMuted }]}>Carbs</Text>
            <Text style={[styles.macroVal, { color: colors.text }]}>
              {Math.round(todayLog.carbs_consumed)} / {goals.carbs_target}g
            </Text>
            <Text style={[styles.macroSub, { color: colors.textMuted }]}>Remaining kcal</Text>
          </View>

          <View style={styles.macroItem}>
            <Text style={[styles.macroLabel, { color: colors.textMuted }]}>Fat</Text>
            <Text style={[styles.macroVal, { color: colors.text }]}>
              {Math.round(todayLog.fat_consumed)} / {goals.fat_target_max}g
            </Text>
            <Text style={[styles.macroSub, { color: colors.textMuted }]}>Healthy fats</Text>
          </View>
        </View>
      </Card>

      {/* Natural Language Logger Preview */}
      <Card style={styles.card}>
        <View style={styles.headerWithIcon}>
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: isDark
                  ? 'rgba(245, 158, 11, 0.16)'
                  : 'rgba(217, 119, 6, 0.12)',
              },
            ]}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.calories} />
          </View>
          <View>
            <Text style={[styles.featureTitle, { color: colors.text }]}>
              Natural Language Food Logger
            </Text>
            <Text style={[styles.featureSub, { color: colors.textMuted }]}>
              Scheduled for Phase 2
            </Text>
          </View>
        </View>

        <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
          "Breakfast was 2 besan chillas with 100g paneer, curd and a banana."
        </Text>
        <Text style={[styles.noteText, { color: colors.textMuted }]}>
          AI will automatically parse items, calculate calories, protein, carbs, fat, and assign confidence levels (High/Medium/Low) for user verification.
        </Text>
      </Card>

      {/* Cuisine Exploration Preview */}
      <Card style={styles.card}>
        <View style={styles.headerWithIcon}>
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: isDark
                  ? 'rgba(56, 189, 248, 0.16)'
                  : 'rgba(2, 132, 199, 0.12)',
              },
            ]}>
            <Ionicons name="globe-outline" size={18} color={colors.protein} />
          </View>
          <View>
            <Text style={[styles.featureTitle, { color: colors.text }]}>
              Cuisine Exploration
            </Text>
            <Text style={[styles.featureSub, { color: colors.textMuted }]}>
              Indian • Mexican • Mediterranean • Italian • Asian
            </Text>
          </View>
        </View>

        <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
          Ask for vegetarian high-protein meals tailored to your calorie budget without eggs or mushrooms.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  card: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  pill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  pillText: {
    fontSize: 9,
    fontWeight: '700',
  },
  mainVal: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: 4,
  },
  mainValTarget: {
    fontSize: 18,
    fontWeight: '500',
  },
  remainingText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  macroItem: {
    flex: 1,
  },
  macroLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  macroVal: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  macroSub: {
    fontSize: 10,
    marginTop: 1,
  },
  headerWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  featureSub: {
    fontSize: 11,
    fontWeight: '500',
  },
  bodyText: {
    fontSize: 13.5,
    lineHeight: 20,
    fontStyle: 'italic',
    marginVertical: Spacing.xs,
  },
  noteText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
