/**
 * Sthira — Change / Assign Workout Modal
 * Allows Jay to reschedule, catch up on missed gym workouts (e.g. Lower B on Saturday),
 * and log or assign any split plan to today, yesterday, or a custom date.
 */

import React, { useState, useMemo } from 'react';
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
import { WorkoutPlan } from '@/types/database';
import { getTodayDateString, shiftDateString, formatDateLabel } from '@/utils/date';

interface ChangeWorkoutModalProps {
  visible: boolean;
  onClose: () => void;
  plans: WorkoutPlan[];
  todayPlan: WorkoutPlan | null;
  onStartPlan: (planId: string | null, title: string, targetDate: string) => void;
  onAssignTodayPlan: (plan: WorkoutPlan) => void;
}

export const ChangeWorkoutModal: React.FC<ChangeWorkoutModalProps> = ({
  visible,
  onClose,
  plans,
  todayPlan,
  onStartPlan,
  onAssignTodayPlan,
}) => {
  const { colors, isDark } = useAppTheme();
  const todayStr = getTodayDateString();
  const yesterdayStr = shiftDateString(todayStr, -1);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Find yesterday's scheduled split plan
  const yesterdayDayIndex = (new Date().getDay() + 6) % 7; // Sunday=0 -> 6, Monday=1 -> 0, Friday=5 -> 4
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const yesterdayDayOfWeek = (new Date().getDay() + 6) % 7;
  const yesterdayDayNumber = new Date(Date.now() - 86400000).getDay();

  const yesterdayPlan = useMemo(() => {
    return plans.find((p) => p.day_of_week === yesterdayDayNumber) || null;
  }, [plans, yesterdayDayNumber]);

  if (!visible) return null;

  const handleSelectPlan = (plan: WorkoutPlan, mode: 'start' | 'assign') => {
    if (mode === 'start') {
      onStartPlan(plan.id, plan.name, selectedDate);
    } else {
      onAssignTodayPlan(plan);
    }
    onClose();
  };

  const isTodaySelected = selectedDate === todayStr;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
            <View style={{ flex: 1 }}>
              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                  <Ionicons name="swap-horizontal" size={12} color={colors.accent} />
                  <Text style={[styles.badgeText, { color: colors.accent }]}>
                    FLEXIBLE TRAINING
                  </Text>
                </View>
              </View>
              <Text style={[styles.title, { color: colors.text }]}>Change Workout Plan</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Missed gym yesterday or want to swap today's split?
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.cardElevated, borderColor: colors.cardBorder }]}>
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* 1. Date Selector Strip */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              TARGET LOG DATE
            </Text>
            <View style={styles.dateChipsRow}>
              <TouchableOpacity
                style={[
                  styles.dateChip,
                  selectedDate === todayStr && {
                    backgroundColor: colors.accent,
                    borderColor: colors.accent,
                  },
                  selectedDate !== todayStr && {
                    backgroundColor: colors.cardElevated,
                    borderColor: colors.cardBorder,
                  },
                ]}
                onPress={() => setSelectedDate(todayStr)}>
                <Ionicons
                  name="calendar-outline"
                  size={13}
                  color={selectedDate === todayStr ? '#FFFFFF' : colors.text}
                />
                <Text
                  style={[
                    styles.dateChipText,
                    { color: selectedDate === todayStr ? '#FFFFFF' : colors.text },
                  ]}>
                  Today ({formatDateLabel(todayStr)})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.dateChip,
                  selectedDate === yesterdayStr && {
                    backgroundColor: colors.accent,
                    borderColor: colors.accent,
                  },
                  selectedDate !== yesterdayStr && {
                    backgroundColor: colors.cardElevated,
                    borderColor: colors.cardBorder,
                  },
                ]}
                onPress={() => setSelectedDate(yesterdayStr)}>
                <Ionicons
                  name="time-outline"
                  size={13}
                  color={selectedDate === yesterdayStr ? '#FFFFFF' : colors.text}
                />
                <Text
                  style={[
                    styles.dateChipText,
                    { color: selectedDate === yesterdayStr ? '#FFFFFF' : colors.text },
                  ]}>
                  Yesterday ({formatDateLabel(yesterdayStr)})
                </Text>
              </TouchableOpacity>
            </View>

            {/* 2. Quick Catch-Up Card (if yesterday's workout was a gym day) */}
            {yesterdayPlan && !yesterdayPlan.name.toLowerCase().includes('rest') && (
              <View
                style={[
                  styles.catchUpCard,
                  {
                    backgroundColor: isDark ? 'rgba(56, 189, 248, 0.1)' : 'rgba(2, 132, 199, 0.08)',
                    borderColor: isDark ? 'rgba(56, 189, 248, 0.3)' : 'rgba(2, 132, 199, 0.25)',
                  },
                ]}>
                <View style={styles.catchUpHeader}>
                  <Ionicons name="flash-outline" size={16} color={colors.protein} />
                  <Text style={[styles.catchUpTitle, { color: colors.protein }]}>
                    Quick Catch-Up Recommendation
                  </Text>
                </View>
                <Text style={[styles.catchUpDesc, { color: colors.textSecondary }]}>
                  Missed {yesterdayPlan.name} yesterday? You can do it {isTodaySelected ? 'today' : 'now'} without disrupting your weekly split.
                </Text>

                <View style={styles.catchUpActions}>
                  <TouchableOpacity
                    style={[styles.catchUpBtn, { backgroundColor: colors.protein }]}
                    onPress={() => handleSelectPlan(yesterdayPlan, 'start')}>
                    <Ionicons name="play" size={14} color="#FFFFFF" />
                    <Text style={styles.catchUpBtnText}>Start {yesterdayPlan.name} Now</Text>
                  </TouchableOpacity>

                  {isTodaySelected && (
                    <TouchableOpacity
                      style={[styles.assignBtn, { borderColor: colors.protein }]}
                      onPress={() => handleSelectPlan(yesterdayPlan, 'assign')}>
                      <Text style={[styles.assignBtnText, { color: colors.protein }]}>
                        Assign to Today
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* 3. All Split Plans List */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              SELECT ANY ROUTINE TO START OR ASSIGN
            </Text>

            {plans.map((plan) => {
              const isCurrentToday = todayPlan?.id === plan.id;
              const isRest = plan.name.toLowerCase().includes('rest');
              const isYoga = plan.name.toLowerCase().includes('yoga');
              const isSwim = plan.name.toLowerCase().includes('swim');

              return (
                <View
                  key={plan.id}
                  style={[
                    styles.planCard,
                    {
                      backgroundColor: colors.cardElevated,
                      borderColor: isCurrentToday ? colors.accent : colors.cardBorder,
                    },
                  ]}>
                  <View style={styles.planCardHeader}>
                    <View style={styles.planIconPill}>
                      <Ionicons
                        name={
                          isRest
                            ? 'bed-outline'
                            : isYoga
                            ? 'body-outline'
                            : isSwim
                            ? 'water-outline'
                            : 'barbell-outline'
                        }
                        size={17}
                        color={isCurrentToday ? colors.accent : colors.text}
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
                        {isCurrentToday && (
                          <View style={[styles.activeTag, { backgroundColor: colors.accent }]}>
                            <Text style={styles.activeTagText}>CURRENT TODAY</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.planDesc, { color: colors.textMuted }]} numberOfLines={2}>
                        {plan.description}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.planCardFooter}>
                    <TouchableOpacity
                      style={[styles.footerStartBtn, { backgroundColor: colors.accent }]}
                      onPress={() => handleSelectPlan(plan, 'start')}>
                      <Ionicons name="play" size={13} color="#FFFFFF" />
                      <Text style={styles.footerStartBtnText}>
                        Start on {selectedDate === todayStr ? 'Today' : selectedDate === yesterdayStr ? 'Yesterday' : selectedDate}
                      </Text>
                    </TouchableOpacity>

                    {isTodaySelected && !isCurrentToday && (
                      <TouchableOpacity
                        style={[styles.footerAssignBtn, { borderColor: colors.cardBorder, backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9' }]}
                        onPress={() => handleSelectPlan(plan, 'assign')}>
                        <Ionicons name="repeat-outline" size={13} color={colors.textSecondary} />
                        <Text style={[styles.footerAssignBtnText, { color: colors.textSecondary }]}>
                          Set for Today
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}

            {/* 4. Custom Workout Option */}
            <TouchableOpacity
              style={[
                styles.customCard,
                {
                  backgroundColor: colors.cardElevated,
                  borderColor: colors.cardBorder,
                },
              ]}
              onPress={() => {
                onStartPlan(null, 'Custom Gym Workout', selectedDate);
                onClose();
              }}>
              <View style={styles.planIconPill}>
                <Ionicons name="add-circle-outline" size={20} color={colors.accent} />
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <Text style={[styles.planName, { color: colors.text }]}>Custom Free Workout</Text>
                <Text style={[styles.planDesc, { color: colors.textMuted }]}>
                  Build a session from scratch with your chosen exercises
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '85%',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  body: {
    padding: Spacing.lg,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: Spacing.xs + 2,
  },
  dateChipsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  dateChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  dateChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  catchUpCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  catchUpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  catchUpTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  catchUpDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  catchUpActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  catchUpBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: BorderRadius.sm,
  },
  catchUpBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  assignBtn: {
    paddingVertical: 9,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assignBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  planCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  planIconPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planName: {
    fontSize: 15,
    fontWeight: '800',
  },
  planDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  activeTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  activeTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  planCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  footerStartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
  },
  footerStartBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  footerAssignBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: Spacing.sm + 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  footerAssignBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  customCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
});
