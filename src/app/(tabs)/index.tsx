import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { useProfileStore } from '@/stores/useProfileStore';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { TodayOverviewCard } from '@/features/dashboard/components/TodayOverviewCard';
import { TodayWorkoutCard } from '@/features/dashboard/components/TodayWorkoutCard';
import { CoachSummaryCard } from '@/features/dashboard/components/CoachSummaryCard';
import { QuickActionsGrid } from '@/features/dashboard/components/QuickActionsGrid';
import { QuickLogModal, QuickLogType } from '@/features/dashboard/components/QuickLogModal';
import { ChangeWorkoutModal } from '@/features/workout/components/ChangeWorkoutModal';
import { DeepAnalysisModal } from '@/features/progress/components/DeepAnalysisModal';
import { useWorkoutStore } from '@/stores/useWorkoutStore';
import { SupabaseSyncService } from '@/services/supabaseSyncService';
import { isSupabaseConfigured } from '@/services/supabaseClient';

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();

  const profile = useProfileStore((s) => s.profile);
  const goals = useProfileStore((s) => s.goals);
  const todayLog = useDashboardStore((s) => s.todayLog);
  const todayPlan = useDashboardStore((s) => s.todayPlan);
  const loadDashboard = useDashboardStore((s) => s.loadDashboard);
  const quickAddWater = useDashboardStore((s) => s.quickAddWater);
  const quickLogWeight = useDashboardStore((s) => s.quickLogWeight);

  const activeSession = useDashboardStore((s) => s.activeSession);
  const todayCompletedSession = useDashboardStore((s) => s.todayCompletedSession);
  const coachGuidance = useDashboardStore((s) => s.coachGuidance);
  const logSuggestedMeal = useDashboardStore((s) => s.logSuggestedMeal);

  const workoutPlans = useWorkoutStore((s) => s.plans);
  const startWorkoutSession = useWorkoutStore((s) => s.startWorkout);
  const switchTodayPlan = useWorkoutStore((s) => s.switchTodayPlan);

  const [refreshing, setRefreshing] = useState(false);
  const [modalType, setModalType] = useState<QuickLogType>(null);
  const [isChangeWorkoutModalOpen, setIsChangeWorkoutModalOpen] = useState(false);
  const [isDeepAnalysisOpen, setIsDeepAnalysisOpen] = useState(false);

  // Auto-refresh today's data whenever user navigates back to Home screen
  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    loadDashboard();
    if (isSupabaseConfigured()) {
      try {
        await SupabaseSyncService.syncAll();
      } catch {}
    }
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }>
        {/* 1. TOP: Today's Overview (Weight, Calories, Protein, Hydration, Sleep) */}
        <TodayOverviewCard
          log={todayLog}
          goals={goals}
          currentWeight={profile.current_weight}
          onPressWater={() => setModalType('water')}
        />

        {/* 2. LOGGING SHORTCUTS: Fast 1-tap logging right after summary */}
        <QuickActionsGrid
          onLogFood={() => setModalType('food')}
          onLogWeight={() => setModalType('weight')}
          onLogWorkout={() => setModalType('workout')}
          onLogActivity={() => setModalType('activity')}
          onLogWater={() => setModalType('water')}
          onJournal={() => setModalType('journal')}
        />

        {/* 3. TODAY'S WORKOUT: Current or Planned Session */}
        <TodayWorkoutCard
          planTitle={
            activeSession?.session.title ||
            todayCompletedSession?.title ||
            todayPlan?.name ||
            'Rest & Recovery'
          }
          isCompleted={todayCompletedSession !== null}
          isInProgress={activeSession !== null}
          session={todayCompletedSession}
          onPressWorkout={() => router.push('/workout')}
          onChangeWorkout={() => setIsChangeWorkoutModalOpen(true)}
        />

        {/* 4. AI Coach Actionable Summary */}
        <CoachSummaryCard
          guidance={coachGuidance}
          summary={
            coachGuidance?.motivationalNarrative ||
            todayLog.coach_summary ||
            "You're on track today. Calories and protein are balanced. Continue staying hydrated and get 7.5+ hours of sleep tonight."
          }
          onLogMeal={logSuggestedMeal}
          onViewAnalysis={() => setIsDeepAnalysisOpen(true)}
        />
      </ScrollView>

      {/* Quick Action Modal */}
      <QuickLogModal
        type={modalType}
        visible={modalType !== null}
        onClose={() => setModalType(null)}
        onSubmitWater={quickAddWater}
        onSubmitWeight={quickLogWeight}
        onNavigateTab={(tab) => {
          if (tab === 'nutrition') router.push('/nutrition');
          else if (tab === 'workout') router.push('/workout');
          else if (tab === 'journal') router.push('/journal');
          else if (tab === 'progress') router.push('/progress');
        }}
      />

      {/* Change / Reschedule Workout Modal */}
      <ChangeWorkoutModal
        visible={isChangeWorkoutModalOpen}
        onClose={() => setIsChangeWorkoutModalOpen(false)}
        plans={workoutPlans}
        todayPlan={todayPlan}
        onStartPlan={(planId, title, targetDate) => {
          startWorkoutSession(planId, title, targetDate);
          loadDashboard();
          router.push('/workout');
        }}
        onAssignTodayPlan={(plan) => {
          switchTodayPlan(plan);
          loadDashboard();
        }}
      />

      {/* Deep Holistic Health, Training & Nutrition Analysis Modal */}
      <DeepAnalysisModal
        visible={isDeepAnalysisOpen}
        onClose={() => setIsDeepAnalysisOpen(false)}
        onTargetsUpdated={loadDashboard}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxxl,
  },
});
