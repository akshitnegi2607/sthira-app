import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CalorieAdaptationResult } from '@/services/progressAnalytics';
import { showAlert } from '@/utils/alert';

interface WeeklyReviewCardProps {
  currentCalorieTarget: number;
  adaptation: CalorieAdaptationResult | null;
  onApplyAdjustment: (deltaKcal: number) => Promise<void>;
}

export const WeeklyReviewCard: React.FC<WeeklyReviewCardProps> = ({
  currentCalorieTarget,
  adaptation,
  onApplyAdjustment,
}) => {
  const { colors, isDark } = useAppTheme();
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  if (!adaptation) return null;

  const {
    actualRateKgPerWeek,
    targetRateKgPerWeek,
    recommendedCalorieDelta,
    newRecommendedCalories,
    action,
    statusBadge,
    rationale,
  } = adaptation;

  const handleApply = async () => {
    if (recommendedCalorieDelta === 0) return;
    try {
      setIsApplying(true);
      await onApplyAdjustment(recommendedCalorieDelta);
      setApplied(true);
      showAlert(
        'Calorie Target Updated',
        `Your daily calorie target has been updated to ${newRecommendedCalories} kcal/day (${recommendedCalorieDelta > 0 ? '+' : ''}${recommendedCalorieDelta} kcal).`
      );
    } catch (e) {
      console.error(e);
      showAlert('Error', 'Could not apply calorie adjustment.');
    } finally {
      setIsApplying(false);
    }
  };

  const getStatusType = () => {
    switch (statusBadge) {
      case 'ON TRACK':
        return 'ON TRACK';
      case 'ADAPT SURPLUS':
      case 'TEMPER GAIN':
        return 'ATTENTION';
      case 'COMPLIANCE CHECK':
      default:
        return 'ATTENTION';
    }
  };

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
                  ? 'rgba(245, 158, 11, 0.16)'
                  : 'rgba(217, 119, 6, 0.12)',
              },
            ]}>
            <Ionicons name="sparkles" size={17} color={colors.calories} />
          </View>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Weekly Calorie Adaptation
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Adaptive Energy Balance Engine
            </Text>
          </View>
        </View>

        <StatusBadge status={getStatusType()} />
      </View>

      {/* Distinction Badge */}
      <View
        style={[
          styles.badgeEstimated,
          {
            backgroundColor: isDark
              ? 'rgba(255, 255, 255, 0.04)'
              : 'rgba(0, 0, 0, 0.03)',
            borderColor: colors.cardBorder,
          },
        ]}>
        <Ionicons name="stats-chart-outline" size={12} color={colors.textMuted} />
        <Text style={[styles.badgeEstimatedText, { color: colors.textMuted }]}>
          ESTIMATED AI RECOMMENDATION • MEASURED SCALE vs SURPLUS
        </Text>
      </View>

      {/* Comparison Grid */}
      <View style={styles.grid}>
        <View
          style={[
            styles.cell,
            {
              backgroundColor: colors.cardElevated,
              borderColor: colors.cardBorder,
            },
          ]}>
          <Text style={[styles.cellLabel, { color: colors.textMuted }]}>
            Current Target
          </Text>
          <Text style={[styles.cellVal, { color: colors.text }]}>
            {currentCalorieTarget}
            <Text style={styles.cellUnit}> kcal</Text>
          </Text>
          <Text style={[styles.cellSub, { color: colors.textMuted }]}>
            Target: +{targetRateKgPerWeek} kg/wk
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
          <Text style={[styles.cellLabel, { color: colors.textMuted }]}>
            Observed Velocity
          </Text>
          <Text
            style={[
              styles.cellVal,
              {
                color:
                  actualRateKgPerWeek >= 0.1 && actualRateKgPerWeek <= 0.2
                    ? colors.accent
                    : colors.calories,
              },
            ]}>
            {actualRateKgPerWeek >= 0 ? `+${actualRateKgPerWeek}` : actualRateKgPerWeek}
            <Text style={styles.cellUnit}> kg/wk</Text>
          </Text>
          <Text style={[styles.cellSub, { color: colors.textMuted }]}>
            7-day smoothed EMA
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
          <Text style={[styles.cellLabel, { color: colors.textMuted }]}>
            Recommended
          </Text>
          <Text
            style={[
              styles.cellVal,
              {
                color:
                  recommendedCalorieDelta !== 0 ? colors.accent : colors.text,
              },
            ]}>
            {newRecommendedCalories}
            <Text style={styles.cellUnit}> kcal</Text>
          </Text>
          <Text style={[styles.cellSub, { color: colors.accent }]}>
            {recommendedCalorieDelta === 0
              ? 'Maintain target'
              : `${recommendedCalorieDelta > 0 ? '+' : ''}${recommendedCalorieDelta} kcal`}
          </Text>
        </View>
      </View>

      {/* Rationale Body */}
      <View
        style={[
          styles.rationaleBox,
          {
            backgroundColor: isDark
              ? 'rgba(255, 255, 255, 0.03)'
              : 'rgba(0, 0, 0, 0.02)',
          },
        ]}>
        <Text style={[styles.rationaleText, { color: colors.textSecondary }]}>
          {rationale}
        </Text>
      </View>

      {/* Action CTA Button */}
      {recommendedCalorieDelta !== 0 && !applied ? (
        <TouchableOpacity
          style={[
            styles.applyButton,
            { backgroundColor: colors.accent },
            isApplying && { opacity: 0.6 },
          ]}
          onPress={handleApply}
          disabled={isApplying}
          activeOpacity={0.8}>
          <Ionicons name="checkmark-circle-outline" size={17} color="#FFF" />
          <Text style={styles.applyButtonText}>
            {isApplying
              ? 'Updating Target...'
              : `Apply ${recommendedCalorieDelta > 0 ? '+' : ''}${recommendedCalorieDelta} kcal to Nutrition Goals`}
          </Text>
        </TouchableOpacity>
      ) : applied ? (
        <View style={styles.appliedBanner}>
          <Ionicons name="checkmark-done" size={16} color={colors.accent} />
          <Text style={[styles.appliedText, { color: colors.accent }]}>
            Calorie target successfully updated in Goals
          </Text>
        </View>
      ) : null}
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
    marginBottom: Spacing.sm,
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
  badgeEstimated: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  badgeEstimatedText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  grid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  cell: {
    flex: 1,
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  cellLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cellVal: {
    fontSize: 16,
    fontWeight: '800',
    marginVertical: 2,
  },
  cellUnit: {
    fontSize: 10,
    fontWeight: '500',
  },
  cellSub: {
    fontSize: 10,
  },
  rationaleBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  rationaleText: {
    fontSize: 12,
    lineHeight: 18,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  appliedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
  },
  appliedText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
