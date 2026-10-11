import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useProgressStore } from '@/stores/useProgressStore';
import { WeightTrendChart } from '@/features/progress/components/WeightTrendChart';
import { LeanBulkTrajectoryCard } from '@/features/progress/components/LeanBulkTrajectoryCard';
import { WeeklyReviewCard } from '@/features/progress/components/WeeklyReviewCard';
import { SleepRecoveryCorrelationCard } from '@/features/progress/components/SleepRecoveryCorrelationCard';
import { WeightHistoryList } from '@/features/progress/components/WeightHistoryList';
import { LogWeightModal } from '@/features/progress/components/LogWeightModal';

export default function ProgressScreen() {
  const { colors, isDark } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);

  const {
    timeframe,
    weightHistory,
    emaSeries,
    weeklyGainRate,
    calorieAdaptation,
    sleepCorrelation,
    leanBulkTrajectory,
    isLogWeightModalVisible,
    isLoading,
    currentWeight,
    currentEmaWeight,
    targetWeight,
    currentCalorieTarget,
    loadProgressData,
    setTimeframe,
    logScaleWeight,
    deleteWeightEntry,
    applyCalorieAdjustment,
    setLogWeightModalVisible,
  } = useProgressStore();

  useEffect(() => {
    loadProgressData();
  }, [loadProgressData]);

  const onRefresh = async () => {
    setRefreshing(true);
    loadProgressData();
    setRefreshing(false);
  };

  // Convert weight entries to WeightDataPoint for chart
  const rawPoints = weightHistory.map((w) => ({
    date: w.date,
    weightKg: w.weight_kg,
  }));

  return (
    <View style={styles.screen}>
      <ScrollView
        style={[styles.container, { backgroundColor: 'transparent' }]}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }>
        {/* Measured vs Estimated Principle Badge */}
        <View
          style={[
            styles.principleCard,
            {
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.03)'
                : 'rgba(0, 0, 0, 0.02)',
              borderColor: colors.cardBorder,
            },
          ]}>
          <View style={styles.principleHeader}>
            <Ionicons name="shield-checkmark" size={14} color={colors.accent} />
            <Text style={[styles.principleTitle, { color: colors.text }]}>
              Data Integrity Framework
            </Text>
          </View>
          <Text style={[styles.principleBody, { color: colors.textMuted }]}>
            Scale weights and logged reps are strictly measured. Rolling EMA trends,
            calorie adaptations, and completion dates are mathematically estimated.
          </Text>
        </View>

        {/* 1. Weight Trend & EMA Chart */}
        <WeightTrendChart
          timeframe={timeframe}
          onSelectTimeframe={setTimeframe}
          rawPoints={rawPoints}
          emaPoints={emaSeries}
          targetWeight={targetWeight}
          currentWeight={currentWeight}
          currentEma={currentEmaWeight}
          weeklyRate={weeklyGainRate}
          onOpenLogModal={() => setLogWeightModalVisible(true)}
        />

        {/* 2. Lean Bulk Trajectory Card */}
        <LeanBulkTrajectoryCard trajectory={leanBulkTrajectory} />

        {/* 3. Weekly Calorie Adaptation Card */}
        <WeeklyReviewCard
          currentCalorieTarget={currentCalorieTarget}
          adaptation={calorieAdaptation}
          onApplyAdjustment={applyCalorieAdjustment}
        />

        {/* 4. Sleep & Gym Volume Correlation Card */}
        <SleepRecoveryCorrelationCard correlation={sleepCorrelation} />

        {/* 5. Recent Scale Entries List */}
        <WeightHistoryList
          entries={weightHistory}
          onDelete={deleteWeightEntry}
        />
      </ScrollView>

      {/* Log Weight Modal */}
      <LogWeightModal
        visible={isLogWeightModalVisible}
        onClose={() => setLogWeightModalVisible(false)}
        onSave={logScaleWeight}
        currentWeight={currentWeight}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
  },
  principleCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  principleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  principleTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  principleBody: {
    fontSize: 11,
    lineHeight: 16,
  },
});
