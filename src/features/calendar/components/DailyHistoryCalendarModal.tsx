/**
 * Sthira — Daily History & Calendar Modal
 * Interactive calendar history modal accessible via the top-bar calendar icon beside settings.
 * Allows browsing past days and inspecting full workout sets/weights, nutrition, and journal logs.
 */

import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useCalendarStore } from '@/stores/useCalendarStore';
import { CalendarHistoryService } from '@/services/calendarHistoryService';
import { MonthCalendarGrid } from './MonthCalendarGrid';
import { DaySnapshotView } from './DaySnapshotView';
import { ChangeWorkoutModal } from '@/features/workout/components/ChangeWorkoutModal';
import { useWorkoutStore } from '@/stores/useWorkoutStore';

export const DailyHistoryCalendarModal: React.FC = () => {
  const { colors, isDark } = useAppTheme();

  const isCalendarOpen = useCalendarStore((s) => s.isCalendarOpen);
  const selectedDate = useCalendarStore((s) => s.selectedDate);
  const currentYear = useCalendarStore((s) => s.currentYear);
  const currentMonth = useCalendarStore((s) => s.currentMonth);

  const closeCalendar = useCalendarStore((s) => s.closeCalendar);
  const setSelectedDate = useCalendarStore((s) => s.setSelectedDate);
  const prevMonth = useCalendarStore((s) => s.prevMonth);
  const nextMonth = useCalendarStore((s) => s.nextMonth);
  const goToToday = useCalendarStore((s) => s.goToToday);

  // Workout store for starting or catching up on workout
  const workoutPlans = useWorkoutStore((s) => s.plans);
  const todayPlan = useWorkoutStore((s) => s.todayPlan);
  const startWorkoutSession = useWorkoutStore((s) => s.startWorkout);
  const switchTodayPlan = useWorkoutStore((s) => s.switchTodayPlan);

  const [isChangeWorkoutModalOpen, setIsChangeWorkoutModalOpen] = useState(false);

  const snapshot = useMemo(() => {
    return CalendarHistoryService.getDaySnapshot(selectedDate);
  }, [selectedDate]);

  if (!isCalendarOpen) return null;

  return (
    <Modal
      visible={isCalendarOpen}
      transparent
      animationType="slide"
      onRequestClose={closeCalendar}>
      <SafeAreaView style={styles.overlay}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}>
          {/* 1. Modal Header */}
          <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
            <View style={{ flex: 1 }}>
              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                  <Ionicons name="calendar" size={11} color={colors.accent} />
                  <Text style={[styles.badgeText, { color: colors.accent }]}>
                    ACTIVITY & HISTORY CALENDAR
                  </Text>
                </View>
              </View>
              <Text style={[styles.title, { color: colors.text }]}>Daily Activity Logs</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Browse past workouts, nutrition macros, and mindset reflections
              </Text>
            </View>

            <TouchableOpacity
              onPress={closeCalendar}
              style={[
                styles.closeBtn,
                { backgroundColor: colors.cardElevated, borderColor: colors.cardBorder },
              ]}>
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* 2. Scrollable Body */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Interactive Month Grid */}
            <MonthCalendarGrid
              year={currentYear}
              month={currentMonth}
              selectedDate={selectedDate}
              onSelectDate={(d) => setSelectedDate(d)}
              onPrevMonth={prevMonth}
              onNextMonth={nextMonth}
              onGoToToday={goToToday}
            />

            {/* Selected Day Full Snapshot */}
            <DaySnapshotView
              snapshot={snapshot}
              onLogWorkoutForDate={() => setIsChangeWorkoutModalOpen(true)}
            />
          </ScrollView>

          {/* Catch-Up / Change Workout Modal */}
          <ChangeWorkoutModal
            visible={isChangeWorkoutModalOpen}
            onClose={() => setIsChangeWorkoutModalOpen(false)}
            plans={workoutPlans}
            todayPlan={todayPlan}
            onStartPlan={(planId, title, targetDate) => {
              startWorkoutSession(planId, title, targetDate);
              closeCalendar();
            }}
            onAssignTodayPlan={(plan) => {
              switchTodayPlan(plan);
            }}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderTopWidth: 1,
    maxHeight: '94%',
    minHeight: '80%',
    display: 'flex',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  body: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
});
