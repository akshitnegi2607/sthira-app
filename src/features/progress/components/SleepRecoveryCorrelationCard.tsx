import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { SleepWorkoutCorrelationResult } from '@/services/progressAnalytics';

interface SleepRecoveryCorrelationCardProps {
  correlation: SleepWorkoutCorrelationResult | null;
}

export const SleepRecoveryCorrelationCard: React.FC<
  SleepRecoveryCorrelationCardProps
> = ({ correlation }) => {
  const { colors, isDark } = useAppTheme();

  if (!correlation) return null;

  const {
    hasSufficientData,
    highSleepAvgVolumeKg,
    lowSleepAvgVolumeKg,
    volumeDifferentialPercent,
    highSleepSessionCount,
    lowSleepSessionCount,
    insight,
  } = correlation;

  return (
    <Card elevated style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: isDark
                  ? 'rgba(99, 102, 241, 0.16)'
                  : 'rgba(79, 70, 229, 0.12)',
              },
            ]}>
            <Ionicons name="moon-outline" size={17} color="#818CF8" />
          </View>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Sleep & Gym Performance
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Recovery vs. Training Volume Correlation
            </Text>
          </View>
        </View>

        {hasSufficientData ? (
          <View
            style={[
              styles.diffBadge,
              {
                backgroundColor: isDark
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(5, 150, 105, 0.1)',
                borderColor: isDark
                  ? 'rgba(16, 185, 129, 0.3)'
                  : 'rgba(5, 150, 105, 0.25)',
              },
            ]}>
            <Text style={[styles.diffBadgeText, { color: colors.accent }]}>
              {volumeDifferentialPercent > 0 ? '+' : ''}
              {volumeDifferentialPercent}% Vol
            </Text>
          </View>
        ) : null}
      </View>

      {/* Comparison Grid */}
      {hasSufficientData ? (
        <View style={styles.grid}>
          <View
            style={[
              styles.cell,
              {
                backgroundColor: colors.cardElevated,
                borderColor: colors.cardBorder,
              },
            ]}>
            <View style={styles.cellHeader}>
              <Ionicons name="sparkles" size={12} color={colors.accent} />
              <Text style={[styles.cellLabel, { color: colors.accent }]}>
                Sleep ≥ 7.5h
              </Text>
            </View>
            <Text style={[styles.cellVal, { color: colors.text }]}>
              {highSleepAvgVolumeKg.toLocaleString()}
              <Text style={styles.cellUnit}> kg</Text>
            </Text>
            <Text style={[styles.cellSub, { color: colors.textMuted }]}>
              {highSleepSessionCount} sessions
            </Text>
          </View>

          <View
            style={[
              styles.cell,
              {
                backgroundColor: colors.cardElevated,
                borderColor: colors.cardBorder,
              },
            ]}>
            <View style={styles.cellHeader}>
              <Ionicons name="alert-circle-outline" size={12} color={colors.textMuted} />
              <Text style={[styles.cellLabel, { color: colors.textMuted }]}>
                Sleep &lt; 7.0h
              </Text>
            </View>
            <Text style={[styles.cellVal, { color: colors.textSecondary }]}>
              {lowSleepAvgVolumeKg.toLocaleString()}
              <Text style={styles.cellUnit}> kg</Text>
            </Text>
            <Text style={[styles.cellSub, { color: colors.textMuted }]}>
              {lowSleepSessionCount} sessions
            </Text>
          </View>
        </View>
      ) : null}

      {/* Insight Rationale Body */}
      <View
        style={[
          styles.insightBox,
          {
            backgroundColor: isDark
              ? 'rgba(255, 255, 255, 0.03)'
              : 'rgba(0, 0, 0, 0.02)',
          },
        ]}>
        <Ionicons name="bulb-outline" size={15} color={colors.accent} />
        <Text style={[styles.insightText, { color: colors.textSecondary }]}>
          {insight}
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
  titleGroup: {
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
    fontSize: 11,
    marginTop: 1,
  },
  diffBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  diffBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  cell: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  cellHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  cellLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  cellVal: {
    fontSize: 18,
    fontWeight: '800',
    marginVertical: 2,
  },
  cellUnit: {
    fontSize: 11,
    fontWeight: '500',
  },
  cellSub: {
    fontSize: 10,
  },
  insightBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  insightText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});
