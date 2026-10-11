import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LeanBulkTrajectoryResult } from '@/services/progressAnalytics';

interface LeanBulkTrajectoryCardProps {
  trajectory: LeanBulkTrajectoryResult | null;
}

export const LeanBulkTrajectoryCard: React.FC<LeanBulkTrajectoryCardProps> = ({
  trajectory,
}) => {
  const { colors, isDark } = useAppTheme();

  if (!trajectory) return null;

  const {
    startWeightKg,
    currentEmaKg,
    targetWeightKg,
    totalGainTargetKg,
    gainedSoFarKg,
    remainingKg,
    progressPercent,
    targetRateKgPerWeek,
    projectedWeeksRemaining,
    projectedTargetDate,
  } = trajectory;

  return (
    <Card elevated style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: isDark
                  ? 'rgba(16, 185, 129, 0.16)'
                  : 'rgba(5, 150, 105, 0.12)',
              },
            ]}>
            <Ionicons name="flag-outline" size={18} color={colors.accent} />
          </View>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Lean Bulk Trajectory
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {startWeightKg.toFixed(1)} kg → {targetWeightKg.toFixed(1)} kg Goal
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.badge,
            {
              backgroundColor: isDark
                ? 'rgba(16, 185, 129, 0.12)'
                : 'rgba(5, 150, 105, 0.08)',
              borderColor: isDark
                ? 'rgba(16, 185, 129, 0.3)'
                : 'rgba(5, 150, 105, 0.2)',
            },
          ]}>
          <Text style={[styles.badgeText, { color: colors.accent }]}>
            +{targetRateKgPerWeek} kg/wk
          </Text>
        </View>
      </View>

      {/* Progress Bar & Indicators */}
      <View style={styles.progressContainer}>
        <View style={styles.progressLabels}>
          <Text style={[styles.endpointLabel, { color: colors.textMuted }]}>
            Start: {startWeightKg.toFixed(1)} kg
          </Text>
          <Text style={[styles.currentLabel, { color: colors.accent }]}>
            {currentEmaKg.toFixed(1)} kg ({progressPercent}%)
          </Text>
          <Text style={[styles.endpointLabel, { color: colors.textMuted }]}>
            Target: {targetWeightKg.toFixed(1)} kg
          </Text>
        </View>

        <ProgressBar
          progress={progressPercent / 100}
          height={8}
          color={colors.accent}
        />
      </View>

      {/* Key Metric Tiles */}
      <View style={styles.metricsGrid}>
        <View
          style={[
            styles.metricTile,
            {
              backgroundColor: colors.cardElevated,
              borderColor: colors.cardBorder,
            },
          ]}>
          <Text style={[styles.tileLabel, { color: colors.textMuted }]}>
            Gained (EMA)
          </Text>
          <Text style={[styles.tileVal, { color: colors.text }]}>
            +{gainedSoFarKg.toFixed(1)} kg
          </Text>
          <Text style={[styles.tileSub, { color: colors.textMuted }]}>
            of {totalGainTargetKg.toFixed(1)} kg target
          </Text>
        </View>

        <View
          style={[
            styles.metricTile,
            {
              backgroundColor: colors.cardElevated,
              borderColor: colors.cardBorder,
            },
          ]}>
          <Text style={[styles.tileLabel, { color: colors.textMuted }]}>
            Remaining
          </Text>
          <Text style={[styles.tileVal, { color: colors.text }]}>
            {remainingKg.toFixed(1)} kg
          </Text>
          <Text style={[styles.tileSub, { color: colors.textMuted }]}>
            ~{projectedWeeksRemaining} weeks
          </Text>
        </View>

        <View
          style={[
            styles.metricTile,
            {
              backgroundColor: colors.cardElevated,
              borderColor: colors.cardBorder,
            },
          ]}>
          <Text style={[styles.tileLabel, { color: colors.textMuted }]}>
            Projected Date
          </Text>
          <Text style={[styles.tileValDate, { color: colors.accent }]}>
            {projectedTargetDate}
          </Text>
          <Text style={[styles.tileSub, { color: colors.textMuted }]}>
            at +{targetRateKgPerWeek} kg/wk
          </Text>
        </View>
      </View>

      {/* Sports Science Protocol Note */}
      <View
        style={[
          styles.protocolBox,
          {
            backgroundColor: isDark
              ? 'rgba(255, 255, 255, 0.03)'
              : 'rgba(0, 0, 0, 0.02)',
          },
        ]}>
        <Ionicons
          name="information-circle-outline"
          size={14}
          color={colors.textMuted}
        />
        <Text style={[styles.protocolText, { color: colors.textSecondary }]}>
          Pacing gain at ~0.15 kg/week prioritizes skeletal muscle hypertrophy
          over adipose storage, keeping Jay lean throughout bulk.
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressContainer: {
    marginBottom: Spacing.md,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  endpointLabel: {
    fontSize: 11,
  },
  currentLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  metricTile: {
    flex: 1,
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  tileLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  tileVal: {
    fontSize: 16,
    fontWeight: '800',
    marginVertical: 2,
  },
  tileValDate: {
    fontSize: 12,
    fontWeight: '700',
    marginVertical: 4,
    textAlign: 'center',
  },
  tileSub: {
    fontSize: 10,
  },
  protocolBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  protocolText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
});
