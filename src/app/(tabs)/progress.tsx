import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
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
import { DeepAnalysisModal } from '@/features/progress/components/DeepAnalysisModal';

export default function ProgressScreen() {
  const { colors, isDark } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [isDeepAnalysisVisible, setIsDeepAnalysisVisible] = useState(false);

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

  useFocusEffect(
    useCallback(() => {
      loadProgressData();
    }, [loadProgressData])
  );

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
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
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

        {/* Holistic Deep Progress & Targets Audit CTA */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsDeepAnalysisVisible(true)}
          style={[
            styles.auditBanner,
            {
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.14)' : 'rgba(16, 185, 129, 0.1)',
              borderColor: colors.accent,
            },
          ]}>
          <View style={styles.auditLeft}>
            <View
              style={[
                styles.auditIconWrapper,
                { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.25)' : '#FFFFFF' },
              ]}>
              <Ionicons name="sparkles" size={18} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.auditTitle, { color: colors.text }]}>
                  Deep Health & Progress Analysis
                </Text>
                <View style={[styles.auditBadge, { backgroundColor: colors.accent }]}>
                  <Text style={styles.auditBadgeText}>NEW</Text>
                </View>
              </View>
              <Text style={[styles.auditSub, { color: colors.textMuted }]}>
                Analyze workout volume, surplus intake & scale velocity
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.accent} />
        </TouchableOpacity>

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

      {/* Deep Holistic Progress Analysis Modal */}
      <DeepAnalysisModal
        visible={isDeepAnalysisVisible}
        onClose={() => setIsDeepAnalysisVisible(false)}
        onTargetsUpdated={loadProgressData}
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
  auditBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.lg,
  },
  auditLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  auditIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  auditTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  auditBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: BorderRadius.full,
  },
  auditBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  auditSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
});
