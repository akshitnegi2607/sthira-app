import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatTile } from '@/components/ui/StatTile';
import { DailyLog, Goals } from '@/types/database';

interface TodayOverviewCardProps {
  log: DailyLog;
  goals: Goals;
  currentWeight: number;
  onPressWater?: () => void;
}

export const TodayOverviewCard: React.FC<TodayOverviewCardProps> = ({
  log,
  goals,
  currentWeight,
  onPressWater,
}) => {
  const { colors } = useAppTheme();

  const caloriesTarget = Number(goals?.calories_target) || 2450;
  const caloriesConsumed = Number(log?.calories_consumed) || 0;
  const proteinTargetMax = Number(goals?.protein_target_max) || 125;
  const proteinConsumed = Number(log?.protein_consumed) || 0;
  const waterLiters = Number(log?.water_liters) || 0;
  const displayWeight = Number(log?.weight) || Number(currentWeight) || 65.8;

  const calorieProgress = caloriesTarget > 0 ? caloriesConsumed / caloriesTarget : 0;
  const proteinProgress = proteinTargetMax > 0 ? proteinConsumed / proteinTargetMax : 0;
  const waterProgress = (Number(goals?.water_target_liters) || 2.5) > 0
    ? waterLiters / (Number(goals?.water_target_liters) || 2.5)
    : 0;

  // Format sleep duration (e.g. 7.25h -> 7h 15m)
  const formatSleep = (hours: number | null | undefined) => {
    if (!hours) return '7h 15m';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m > 0 ? `${m}m` : ''}`;
  };

  return (
    <Card elevated style={styles.card}>
      {/* Header with Title and Overall Status */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.dateText, { color: colors.textMuted }]}>
            TODAY'S STATUS
          </Text>
          <Text style={[styles.mainTitle, { color: colors.text }]}>
            Daily Snapshot
          </Text>
        </View>
        <StatusBadge status={log?.coach_status ?? 'ON TRACK'} />
      </View>

      {/* Primary 3 Pillars: Calories, Protein, Water */}
      <View style={styles.tileGrid}>
        <View style={styles.gridRow}>
          <StatTile
            label="Calories"
            value={caloriesConsumed.toLocaleString()}
            target={`${caloriesTarget.toLocaleString()} kcal`}
            progress={calorieProgress}
            accentColor={colors.calories}
            isEstimated={true}
            subtitle={`${Math.max(0, Math.round(caloriesTarget - caloriesConsumed))} kcal left`}
          />
          <View style={{ width: Spacing.sm }} />
          <StatTile
            label="Protein"
            value={`${Math.round(proteinConsumed)}`}
            target={`${proteinTargetMax} g`}
            progress={proteinProgress}
            accentColor={colors.protein}
            isEstimated={true}
            subtitle={`${Math.max(0, Math.round(proteinTargetMax - proteinConsumed))} g left`}
          />
        </View>

        <View style={[styles.gridRow, { marginTop: Spacing.sm }]}>
          <StatTile
            label="Hydration"
            value={`${waterLiters.toFixed(1)}`}
            target={`${goals?.water_target_liters ?? 2.5} L`}
            progress={waterProgress}
            accentColor={colors.water}
            isEstimated={false}
            subtitle={onPressWater ? 'Measured • Tap to log' : 'Measured'}
            onPress={onPressWater}
          />
          <View style={{ width: Spacing.sm }} />
          <StatTile
            label="Weight"
            value={`${displayWeight.toFixed(1)}`}
            unit="kg"
            accentColor={colors.accent}
            isEstimated={false}
            subtitle="+0.15 kg/wk target"
          />
        </View>
      </View>

      {/* Wellness & Recovery Row */}
      <View style={[styles.wellnessRow, { borderTopColor: colors.cardBorder }]}>
        <View style={styles.wellnessItem}>
          <Text style={[styles.wellnessLabel, { color: colors.textMuted }]}>Sleep</Text>
          <Text style={[styles.wellnessValue, { color: colors.text }]}>
            {formatSleep(log.sleep_hours)}
          </Text>
        </View>

        <View style={[styles.wellnessDivider, { backgroundColor: colors.cardBorder }]} />

        <View style={styles.wellnessItem}>
          <Text style={[styles.wellnessLabel, { color: colors.textMuted }]}>Energy</Text>
          <Text style={[styles.wellnessValue, { color: colors.text }]}>
            {log.energy_rating ? `${log.energy_rating}/10` : '8/10'}
          </Text>
        </View>

        <View style={[styles.wellnessDivider, { backgroundColor: colors.cardBorder }]} />

        <View style={styles.wellnessItem}>
          <Text style={[styles.wellnessLabel, { color: colors.textMuted }]}>Recovery</Text>
          <Text style={[styles.wellnessValue, { color: colors.statusOnTrack }]}>
            {log.recovery_rating ? `${log.recovery_rating}/10` : 'Optimal'}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  tileGrid: {
    marginVertical: Spacing.xs,
  },
  gridRow: {
    flexDirection: 'row',
  },
  wellnessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  wellnessItem: {
    flex: 1,
    alignItems: 'center',
  },
  wellnessLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  wellnessValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  wellnessDivider: {
    width: 1,
    height: 24,
  },
});
