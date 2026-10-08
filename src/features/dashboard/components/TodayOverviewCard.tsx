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
}

export const TodayOverviewCard: React.FC<TodayOverviewCardProps> = ({
  log,
  goals,
  currentWeight,
}) => {
  const { colors } = useAppTheme();

  const calorieProgress = goals.calories_target > 0 ? log.calories_consumed / goals.calories_target : 0;
  const proteinProgress = goals.protein_target_max > 0 ? log.protein_consumed / goals.protein_target_max : 0;
  const waterProgress = goals.water_target_liters > 0 ? log.water_liters / goals.water_target_liters : 0;

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
        <StatusBadge status={log.coach_status} />
      </View>

      {/* Primary 3 Pillars: Calories, Protein, Water */}
      <View style={styles.tileGrid}>
        <View style={styles.gridRow}>
          <StatTile
            label="Calories"
            value={log.calories_consumed.toLocaleString()}
            target={`${goals.calories_target.toLocaleString()} kcal`}
            progress={calorieProgress}
            accentColor={colors.calories}
            isEstimated={true}
            subtitle={`${Math.max(0, Math.round(goals.calories_target - log.calories_consumed))} kcal left`}
          />
          <View style={{ width: Spacing.sm }} />
          <StatTile
            label="Protein"
            value={`${Math.round(log.protein_consumed)}`}
            target={`${goals.protein_target_max} g`}
            progress={proteinProgress}
            accentColor={colors.protein}
            isEstimated={true}
            subtitle={`${Math.max(0, Math.round(goals.protein_target_max - log.protein_consumed))} g left`}
          />
        </View>

        <View style={[styles.gridRow, { marginTop: Spacing.sm }]}>
          <StatTile
            label="Hydration"
            value={`${log.water_liters.toFixed(1)}`}
            target={`${goals.water_target_liters} L`}
            progress={waterProgress}
            accentColor={colors.water}
            isEstimated={false}
            subtitle="Measured"
          />
          <View style={{ width: Spacing.sm }} />
          <StatTile
            label="Weight"
            value={`${(log.weight ?? currentWeight).toFixed(1)}`}
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
