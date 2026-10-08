import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useProfileStore } from '@/stores/useProfileStore';
import { useDashboardStore } from '@/stores/useDashboardStore';

export default function ProgressScreen() {
  const { colors, isDark } = useAppTheme();
  const profile = useProfileStore((s) => s.profile);
  const todayLog = useDashboardStore((s) => s.todayLog);

  const currentWeight = todayLog.weight ?? profile.current_weight;
  const targetWeight = profile.target_weight;
  const diff = (targetWeight - currentWeight).toFixed(1);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      {/* Weight Trend Summary */}
      <Card elevated style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            BODY WEIGHT TREND
          </Text>
          <StatusBadge status="ON TRACK" />
        </View>

        <View style={styles.weightRow}>
          <View>
            <Text style={[styles.weightBig, { color: colors.text }]}>
              {currentWeight.toFixed(1)} <Text style={[styles.unit, { color: colors.textMuted }]}>kg</Text>
            </Text>
            <Text style={[styles.weightSub, { color: colors.textMuted }]}>
              Target: {targetWeight} kg ({diff} kg to lean bulk target)
            </Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <View style={[styles.metricTile, { backgroundColor: colors.cardElevated, borderColor: colors.cardBorder }]}>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>7-Day Average</Text>
            <Text style={[styles.metricVal, { color: colors.text }]}>64.1 kg</Text>
            <Text style={[styles.metricDelta, { color: colors.accent }]}>+0.15 kg/wk</Text>
          </View>

          <View style={[styles.metricTile, { backgroundColor: colors.cardElevated, borderColor: colors.cardBorder }]}>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Target Rate</Text>
            <Text style={[styles.metricVal, { color: colors.text }]}>+0.1–0.2</Text>
            <Text style={[styles.metricDelta, { color: colors.textMuted }]}>kg / week</Text>
          </View>
        </View>
      </Card>

      {/* Analytics Engine Preview */}
      <Card style={styles.card}>
        <View style={styles.iconHeading}>
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: isDark
                  ? 'rgba(16, 185, 129, 0.16)'
                  : 'rgba(5, 150, 105, 0.12)',
              },
            ]}>
            <Ionicons name="analytics-outline" size={18} color={colors.accent} />
          </View>
          <View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Deterministic Analytics Engine
            </Text>
            <Text style={[styles.cardSub, { color: colors.textMuted }]}>
              Section 45 Architecture
            </Text>
          </View>
        </View>

        <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
          All 7-day, 14-day, and 30-day rolling averages, volume trends, and rate calculations are computed deterministically in TypeScript, then provided to the AI coach for context-aware interpretation.
        </Text>
      </Card>

      {/* Weekly Review Preview */}
      <Card style={styles.card}>
        <View style={styles.iconHeading}>
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: isDark
                  ? 'rgba(245, 158, 11, 0.16)'
                  : 'rgba(217, 119, 6, 0.12)',
              },
            ]}>
            <Ionicons name="calendar-outline" size={18} color={colors.calories} />
          </View>
          <View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Weekly Progress Review
            </Text>
            <Text style={[styles.cardSub, { color: colors.textMuted }]}>
              Scheduled for Phase 4 & 5
            </Text>
          </View>
        </View>

        <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
          "Starting: 64.0 kg • Ending: 64.2 kg (+0.2 kg). 4/4 gym sessions completed. Average sleep 7h 12m. You are progressing at an appropriate rate. Keep calories unchanged."
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  weightRow: {
    marginVertical: Spacing.xs,
  },
  weightBig: {
    fontSize: 32,
    fontWeight: '800',
  },
  unit: {
    fontSize: 18,
    fontWeight: '500',
  },
  weightSub: {
    fontSize: 13,
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  metricTile: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricVal: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 2,
  },
  metricDelta: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  iconHeading: {
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
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardSub: {
    fontSize: 11,
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: Spacing.xs,
  },
});
