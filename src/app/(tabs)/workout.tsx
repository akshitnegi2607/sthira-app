/**
 * Sthira — Workout & Training Screen (Phase 3)
 * Full interactive training hub:
 * - Weekly training schedule (Upper A, Lower A, Upper B, Lower B, Yoga, Swimming, Rest)
 * - Live active session logger with double progression, RIR tracking, and rest timers
 * - Exercise substitutions & library
 * - Joint pain & fatigue tracking with injury prevention warnings
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { useWorkoutStore } from '@/stores/useWorkoutStore';
import { ActiveWorkoutModal } from '@/features/workout/components/ActiveWorkoutModal';
import { ExerciseDetailModal } from '@/features/workout/components/ExerciseDetailModal';
import { PainLoggingModal } from '@/features/workout/components/PainLoggingModal';
import { WorkoutHistoryDetailModal } from '@/features/workout/components/WorkoutHistoryDetailModal';
import { WorkoutPlan, Exercise } from '@/types/database';
import { getTodayDateString } from '@/utils/date';

export default function WorkoutScreen() {
  const { colors, isDark } = useAppTheme();

  const plans = useWorkoutStore((s) => s.plans);
  const exercises = useWorkoutStore((s) => s.exercises);
  const todayPlan = useWorkoutStore((s) => s.todayPlan);
  const history = useWorkoutStore((s) => s.history);
  const recentPain = useWorkoutStore((s) => s.recentPain);
  const isSessionActive = useWorkoutStore((s) => s.isSessionActive);
  const activeSession = useWorkoutStore((s) => s.activeSession);
  const elapsedSeconds = useWorkoutStore((s) => s.elapsedSeconds);

  const init = useWorkoutStore((s) => s.init);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const openExerciseInfo = useWorkoutStore((s) => s.openExerciseInfo);
  const selectedExerciseForInfo = useWorkoutStore((s) => s.selectedExerciseForInfo);
  const closeExerciseInfo = useWorkoutStore((s) => s.closeExerciseInfo);
  const openPainModal = useWorkoutStore((s) => s.openPainModal);
  const openHistoryModal = useWorkoutStore((s) => s.openHistoryModal);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [exerciseQuery, setExerciseQuery] = useState<string>('');

  useEffect(() => {
    init();
  }, [init]);

  useFocusEffect(
    useCallback(() => {
      init();
    }, [init])
  );

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayDayIndex = new Date().getDay();
  const todayStr = getTodayDateString();

  // Find if today's session has already been completed
  const todayCompleted = history.find(
    (h) => h.session.date === todayStr && h.session.status === 'completed'
  );

  // Monday-first week order: Mon(1)->1, Tue(2)->2, Wed(3)->3, Thu(4)->4, Fri(5)->5, Sat(6)->6, Sun(0)->7
  const toWeekOrder = (d: number | null | undefined) => {
    if (d === null || d === undefined) return 0;
    return d === 0 ? 7 : d;
  };
  const todayOrder = toWeekOrder(todayDayIndex);

  const categories = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

  const filteredExercises = exercises.filter((ex) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      ex.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesQuery =
      ex.name.toLowerCase().includes(exerciseQuery.toLowerCase()) ||
      ex.primary_muscle.toLowerCase().includes(exerciseQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const activeDurationMinutes = Math.floor(elapsedSeconds / 60);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      {/* 1. Today's Training Banner / Active Workout Card / Completed Card */}
      {isSessionActive && activeSession ? (
        <Card
          style={[
            styles.heroCard,
            {
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)',
              borderColor: colors.accent,
            },
          ]}>
          <View style={styles.heroHeader}>
            <View style={styles.liveIndicator}>
              <View style={[styles.liveDot, { backgroundColor: colors.accent }]} />
              <Text style={[styles.liveText, { color: colors.accent }]}>
                WORKOUT IN PROGRESS
              </Text>
            </View>
            <Text style={[styles.heroClock, { color: colors.text }]}>
              {activeDurationMinutes}m elapsed
            </Text>
          </View>

          <Text style={[styles.heroTitle, { color: colors.text }]}>
            {activeSession.session.title}
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
            {activeSession.completedSetsCount} sets completed •{' '}
            {activeSession.totalVolumeKg.toLocaleString()} kg lifted
          </Text>

          <TouchableOpacity
            style={[styles.resumeBtn, { backgroundColor: colors.accent }]}
            onPress={() => {
              // Active workout modal is bound to isSessionActive
            }}>
            <Ionicons name="barbell-outline" size={18} color="#FFFFFF" />
            <Text style={styles.resumeBtnText}>Open Live Session</Text>
          </TouchableOpacity>
        </Card>
      ) : todayCompleted ? (
        <Card
          style={[
            styles.heroCard,
            {
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)',
              borderColor: colors.accent,
              borderWidth: 1.5,
            },
          ]}>
          <View style={styles.heroHeader}>
            <View style={[styles.dayPill, { backgroundColor: 'rgba(16, 185, 129, 0.18)' }]}>
              <Ionicons name="checkmark-circle" size={13} color={colors.accent} style={{ marginRight: 4 }} />
              <Text style={[styles.dayPillText, { color: colors.accent }]}>
                TODAY'S SESSION COMPLETED ✓
              </Text>
            </View>
            {todayCompleted.session.difficulty_perceived ? (
              <View
                style={[
                  styles.diffBadge,
                  {
                    backgroundColor:
                      todayCompleted.session.difficulty_perceived === 'Very hard' ||
                      todayCompleted.session.difficulty_perceived === 'Hard'
                        ? 'rgba(245, 158, 11, 0.16)'
                        : 'rgba(16, 185, 129, 0.16)',
                  },
                ]}>
                <Text
                  style={[
                    styles.diffBadgeText,
                    {
                      color:
                        todayCompleted.session.difficulty_perceived === 'Very hard' ||
                        todayCompleted.session.difficulty_perceived === 'Hard'
                          ? colors.statusAttention
                          : colors.accent,
                    },
                  ]}>
                  {todayCompleted.session.difficulty_perceived}
                </Text>
              </View>
            ) : (
              <Ionicons name="trophy-outline" size={20} color={colors.accent} />
            )}
          </View>

          <Text style={[styles.heroTitle, { color: colors.text }]}>
            {todayCompleted.session.title}
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
            {todayCompleted.completedSetsCount} sets logged •{' '}
            {todayCompleted.totalVolumeKg.toLocaleString()} kg lifted •{' '}
            {Math.floor((todayCompleted.session.duration_seconds || 0) / 60)}m duration
          </Text>

          <View style={styles.heroActionsRow}>
            <TouchableOpacity
              style={[styles.startWorkoutBtn, { backgroundColor: colors.accent, flex: 1 }]}
              onPress={() => openHistoryModal(todayCompleted)}>
              <Ionicons name="eye-outline" size={16} color="#FFFFFF" />
              <Text style={styles.startWorkoutText}>View Completed Summary</Text>
            </TouchableOpacity>

            {todayPlan && (
              <TouchableOpacity
                style={[
                  styles.secondaryActionBtn,
                  {
                    borderColor: colors.cardBorder,
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9',
                  },
                ]}
                onPress={() => startWorkout(todayPlan.id, `${todayPlan.name} (Extra)`)}>
                <Ionicons name="add" size={15} color={colors.textSecondary} />
                <Text style={[styles.secondaryActionText, { color: colors.textSecondary }]}>
                  Extra
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>
      ) : todayPlan ? (
        <Card style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={[styles.dayPill, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
              <Text style={[styles.dayPillText, { color: colors.accent }]}>
                TODAY • {days[todayDayIndex].toUpperCase()}
              </Text>
            </View>
            <Ionicons
              name={
                todayPlan.name.toLowerCase().includes('rest')
                  ? 'bed-outline'
                  : todayPlan.name.toLowerCase().includes('yoga')
                  ? 'body-outline'
                  : todayPlan.name.toLowerCase().includes('swim')
                  ? 'water-outline'
                  : 'barbell-outline'
              }
              size={20}
              color={colors.accent}
            />
          </View>

          <Text style={[styles.heroTitle, { color: colors.text }]}>{todayPlan.name}</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
            {todayPlan.description}
          </Text>

          <View style={styles.heroActionsRow}>
            {!todayPlan.name.toLowerCase().includes('rest') ? (
              <TouchableOpacity
                style={[styles.startWorkoutBtn, { backgroundColor: colors.accent }]}
                onPress={() => startWorkout(todayPlan.id)}>
                <Ionicons name="play" size={16} color="#FFFFFF" />
                <Text style={styles.startWorkoutText}>Start {todayPlan.name}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.startWorkoutBtn, { backgroundColor: colors.cardBorder }]}
                onPress={() => startWorkout(null, 'Active Recovery Session')}>
                <Ionicons name="walk-outline" size={16} color={colors.text} />
                <Text style={[styles.startWorkoutText, { color: colors.text }]}>
                  Log Light Recovery
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>
      ) : null}

      {/* 2. Joint & Fatigue Status Strip */}
      <View style={styles.painStrip}>
        <View style={styles.painStripLeft}>
          <Ionicons
            name={recentPain.length > 0 ? 'warning-outline' : 'shield-checkmark-outline'}
            size={18}
            color={recentPain.length > 0 ? colors.statusAttention : colors.accent}
          />
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <Text style={[styles.painStripTitle, { color: colors.text }]}>
              {recentPain.length > 0
                ? `${recentPain.length} Joint Discomfort Note${recentPain.length > 1 ? 's' : ''}`
                : 'Joints & Recovery: All Clear'}
            </Text>
            <Text style={[styles.painStripSub, { color: colors.textMuted }]}>
              {recentPain.length > 0
                ? recentPain
                    .slice(0, 2)
                    .map((p) => `${p.body_area} (${p.pain_level}/10)`)
                    .join(' • ')
                : 'No active fatigue deloads triggered'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logPainBtn, { backgroundColor: colors.cardBorder }]}
          onPress={openPainModal}>
          <Ionicons name="add" size={14} color={colors.text} />
          <Text style={[styles.logPainText, { color: colors.text }]}>Log Pain</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Weekly Split Schedule */}
      <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
        WEEKLY TRAINING SCHEDULE
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scheduleRow}>
        {plans.map((plan) => {
          const dayLabel =
            plan.day_of_week !== null && plan.day_of_week !== undefined
              ? days[plan.day_of_week]
              : '';
          const planOrder = toWeekOrder(plan.day_of_week);
          const isPlanToday = planOrder === todayOrder;
          const isPastDay = planOrder < todayOrder;
          const isFutureDay = planOrder > todayOrder;
          const isRest = plan.name.toLowerCase().includes('rest');

          return (
            <Card
              key={plan.id}
              style={[
                styles.scheduleCard,
                isPlanToday && { borderColor: colors.accent, borderWidth: 1.5 },
                (isPastDay || isFutureDay) && { opacity: 0.8 },
              ]}>
              <View style={styles.schedDayRow}>
                <View
                  style={[
                    styles.schedBadge,
                    {
                      backgroundColor: isPlanToday
                        ? colors.accent
                        : isDark
                        ? 'rgba(255,255,255,0.05)'
                        : '#F1F5F9',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.schedBadgeText,
                      { color: isPlanToday ? '#FFFFFF' : colors.textMuted },
                    ]}>
                    {dayLabel}
                  </Text>
                </View>
                {isPlanToday && (
                  <Text style={[styles.todayTag, { color: colors.accent }]}>TODAY</Text>
                )}
                {isFutureDay && (
                  <Ionicons name="lock-closed-outline" size={13} color={colors.textMuted} />
                )}
              </View>

              <Text style={[styles.schedTitle, { color: colors.text }]} numberOfLines={1}>
                {plan.name}
              </Text>
              <Text
                style={[styles.schedDesc, { color: colors.textMuted }]}
                numberOfLines={2}>
                {plan.description}
              </Text>

              {/* Action Button based on day status */}
              {isPlanToday ? (
                todayCompleted ? (
                  <TouchableOpacity
                    style={[
                      styles.schedCompletedBtn,
                      {
                        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.16)' : 'rgba(16, 185, 129, 0.12)',
                        borderColor: colors.accent,
                      },
                    ]}
                    onPress={() => openHistoryModal(todayCompleted)}>
                    <Ionicons name="checkmark-circle" size={13} color={colors.accent} />
                    <Text style={[styles.schedCompletedText, { color: colors.accent }]}>
                      Completed ✓
                    </Text>
                  </TouchableOpacity>
                ) : isRest ? (
                  <View
                    style={[
                      styles.schedLockedBtn,
                      { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9' },
                    ]}>
                    <Ionicons name="bed-outline" size={13} color={colors.textMuted} />
                    <Text style={[styles.schedLockedText, { color: colors.textMuted }]}>
                      Rest Day
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.schedStartBtn, { backgroundColor: colors.accent }]}
                    onPress={() => startWorkout(plan.id)}>
                    <Ionicons name="play" size={13} color="#FFFFFF" />
                    <Text style={[styles.schedStartText, { color: '#FFFFFF' }]}>
                      Start Session
                    </Text>
                  </TouchableOpacity>
                )
              ) : isPastDay ? (
                <View
                  style={[
                    styles.schedLockedBtn,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' },
                  ]}>
                  <Ionicons name="time-outline" size={12} color={colors.textMuted} />
                  <Text style={[styles.schedLockedText, { color: colors.textMuted }]}>
                    Past Day
                  </Text>
                </View>
              ) : (
                <View
                  style={[
                    styles.schedLockedBtn,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' },
                  ]}>
                  <Ionicons name="lock-closed-outline" size={12} color={colors.textMuted} />
                  <Text style={[styles.schedLockedText, { color: colors.textMuted }]}>
                    Scheduled • {dayLabel}
                  </Text>
                </View>
              )}
            </Card>
          );
        })}
      </ScrollView>

      {/* 4. Recent Workout History */}
      {history.length > 0 && (
        <View style={styles.section}>
          <View style={styles.histSectionHeader}>
            <Text style={[styles.sectionHeading, { color: colors.textSecondary, marginBottom: 0 }]}>
              RECENT COMPLETED SESSIONS
            </Text>
            <View style={[styles.histCountPillWrap, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)' }]}>
              <Text style={[styles.histCountPill, { color: colors.accent }]}>
                {history.length} logged
              </Text>
            </View>
          </View>

          {history.slice(0, 4).map((item) => {
            const sess = item.session;
            const mins = Math.floor((sess.duration_seconds || 0) / 60);

            return (
              <TouchableOpacity
                key={sess.id}
                activeOpacity={0.85}
                onPress={() => openHistoryModal(item)}>
                <Card style={styles.historyCard}>
                  <View style={styles.histHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.histTitle, { color: colors.text }]}>
                        {sess.title}
                      </Text>
                      <Text style={[styles.histDate, { color: colors.textMuted }]}>
                        {sess.date} • {mins > 0 ? `${mins} mins` : 'Completed'}
                      </Text>
                    </View>
                    {sess.difficulty_perceived && (
                      <View
                        style={[
                          styles.diffBadge,
                          {
                            backgroundColor:
                              sess.difficulty_perceived === 'Very hard' || sess.difficulty_perceived === 'Hard'
                                ? 'rgba(245, 158, 11, 0.12)'
                                : 'rgba(16, 185, 129, 0.12)',
                          },
                        ]}>
                        <Text
                          style={[
                            styles.diffBadgeText,
                            {
                              color:
                                sess.difficulty_perceived === 'Very hard' || sess.difficulty_perceived === 'Hard'
                                  ? colors.statusAttention
                                  : colors.accent,
                            },
                          ]}>
                          {sess.difficulty_perceived}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Volume and Sets Row */}
                  <View style={styles.histMetricsRow}>
                    <View style={styles.histMetricChip}>
                      <Ionicons name="barbell-outline" size={13} color={colors.accent} />
                      <Text style={[styles.histMetricText, { color: colors.text }]}>
                        {item.totalVolumeKg > 0 ? `${item.totalVolumeKg.toLocaleString()} kg` : 'Bodyweight'}
                      </Text>
                    </View>
                    <View style={styles.histMetricChip}>
                      <Ionicons name="layers-outline" size={13} color={colors.textMuted} />
                      <Text style={[styles.histMetricText, { color: colors.text }]}>
                        {item.completedSetsCount} sets
                      </Text>
                    </View>
                    <View style={styles.histMetricChip}>
                      <Ionicons name="fitness-outline" size={13} color={colors.textMuted} />
                      <Text style={[styles.histMetricText, { color: colors.text }]}>
                        {item.exercises.length} exercises
                      </Text>
                    </View>
                  </View>

                  {/* Exercises Tags */}
                  {item.exercises.length > 0 && (
                    <View style={styles.histExercisesRow}>
                      <Text style={[styles.histExerciseNames, { color: colors.textMuted }]} numberOfLines={1}>
                        {item.exercises.map((e) => e.exercise.name).join(' • ')}
                      </Text>
                    </View>
                  )}

                  {sess.notes ? (
                    <Text style={[styles.histNotes, { color: colors.textMuted }]} numberOfLines={2}>
                      "{sess.notes}"
                    </Text>
                  ) : null}

                  {/* Tap to View Details CTA */}
                  <View style={[styles.histFooter, { borderTopColor: colors.cardBorder }]}>
                    <Text style={[styles.histFooterCta, { color: colors.accent }]}>
                      View full workout details & sets
                    </Text>
                    <Ionicons name="chevron-forward" size={13} color={colors.accent} />
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* 5. Exercise Library & Progressive Overload Targets */}
      <View style={styles.section}>
        <View style={styles.libraryHeader}>
          <Text style={[styles.sectionHeading, { color: colors.textSecondary, marginBottom: 0 }]}>
            EXERCISE LIBRARY ({exercises.length})
          </Text>
          <View style={styles.measuredPill}>
            <Text style={[styles.measuredPillText, { color: colors.textMuted }]}>
              ESTIMATED PROGRESSION
            </Text>
          </View>
        </View>

        {/* Search Input */}
        <TextInput
          style={[
            styles.searchInput,
            {
              color: colors.text,
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
              borderColor: colors.cardBorder,
            },
          ]}
          placeholder="Search by exercise or muscle group..."
          placeholderTextColor={colors.textMuted}
          value={exerciseQuery}
          onChangeText={setExerciseQuery}
        />

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.catChip,
                  {
                    backgroundColor: isSelected
                      ? colors.accent
                      : isDark
                      ? 'rgba(255,255,255,0.03)'
                      : '#FFFFFF',
                    borderColor: isSelected ? colors.accent : colors.cardBorder,
                  },
                ]}
                onPress={() => setSelectedCategory(cat)}>
                <Text
                  style={[
                    styles.catChipText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.text,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Exercises List */}
        {filteredExercises.slice(0, 10).map((ex) => (
          <TouchableOpacity
            key={ex.id}
            activeOpacity={0.8}
            onPress={() => openExerciseInfo(ex)}>
            <Card style={styles.libCard}>
              <View style={styles.libCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.libExName, { color: colors.text }]}>{ex.name}</Text>
                  <Text style={[styles.libMuscle, { color: colors.textMuted }]}>
                    {ex.primary_muscle} • {ex.equipment}
                  </Text>
                </View>
                <View style={[styles.repPill, { backgroundColor: colors.cardBorder }]}>
                  <Text style={[styles.repPillText, { color: colors.textSecondary }]}>
                    {ex.target_sets} × {ex.target_rep_range}
                  </Text>
                </View>
              </View>

              <View style={styles.progressionFooter}>
                <View style={styles.progressionLoadBox}>
                  <Text style={[styles.loadDesc, { color: colors.textMuted }]}>
                    Target load:
                  </Text>
                  <Text style={[styles.loadValue, { color: colors.accent }]}>
                    {ex.current_recommended_weight_kg
                      ? `${ex.current_recommended_weight_kg} kg`
                      : 'Starting load'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.infoLink,
                    {
                      backgroundColor: isDark
                        ? 'rgba(56, 189, 248, 0.12)'
                        : 'rgba(2, 132, 199, 0.08)',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                      gap: 4,
                    },
                  ]}>
                  <Ionicons name="videocam-outline" size={13} color={colors.protein} />
                  <Text style={[styles.infoLinkText, { color: colors.protein, fontWeight: '600' }]}>
                    Animated Form
                  </Text>
                  <Ionicons name="chevron-forward" size={12} color={colors.protein} />
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      {/* Phase 3 Interactive Modals */}
      <ActiveWorkoutModal />
      <ExerciseDetailModal
        exercise={selectedExerciseForInfo}
        onClose={closeExerciseInfo}
      />
      <PainLoggingModal />
      <WorkoutHistoryDetailModal />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl * 2,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  section: {
    marginTop: Spacing.lg,
  },
  heroCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroClock: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  dayPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  dayPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: Spacing.xs,
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  heroActionsRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
  },
  startWorkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
  },
  startWorkoutText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  resumeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  painStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    backgroundColor: 'rgba(150, 150, 150, 0.08)',
  },
  painStripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  painStripTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  painStripSub: {
    fontSize: 10,
    marginTop: 1,
  },
  logPainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
  },
  logPainText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scheduleRow: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  scheduleCard: {
    width: 200,
    padding: Spacing.md,
  },
  schedDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  schedBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  schedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  todayTag: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  schedTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  schedDesc: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 3,
    minHeight: 30,
  },
  schedStartBtn: {
    paddingVertical: 7,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    marginTop: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  schedStartText: {
    fontSize: 11,
    fontWeight: '700',
  },
  schedCompletedBtn: {
    paddingVertical: 7,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    marginTop: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
  },
  schedCompletedText: {
    fontSize: 11,
    fontWeight: '700',
  },
  schedLockedBtn: {
    paddingVertical: 7,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    marginTop: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  schedLockedText: {
    fontSize: 11,
    fontWeight: '600',
  },
  secondaryActionBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  secondaryActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  historyCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  histHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  histTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  histDate: {
    fontSize: 12,
    marginTop: 2,
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  diffBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  histNotes: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },
  histSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  histCountPillWrap: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  histCountPill: {
    fontSize: 11,
    fontWeight: '700',
  },
  histMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  histMetricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  histMetricText: {
    fontSize: 11,
    fontWeight: '600',
  },
  histExercisesRow: {
    marginTop: 6,
  },
  histExerciseNames: {
    fontSize: 11,
    lineHeight: 16,
  },
  histFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  histFooterCta: {
    fontSize: 12,
    fontWeight: '700',
  },
  libraryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  measuredPill: {
    backgroundColor: 'rgba(150, 150, 150, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  measuredPillText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  searchInput: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 13,
    marginBottom: Spacing.sm,
  },
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: 6,
  },
  catChipText: {
    fontSize: 12,
  },
  libCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  libCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  libExName: {
    fontSize: 15,
    fontWeight: '700',
  },
  libMuscle: {
    fontSize: 12,
    marginTop: 2,
  },
  repPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  repPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
  },
  progressionLoadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  loadDesc: {
    fontSize: 11,
  },
  loadValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  infoLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  infoLinkText: {
    fontSize: 11,
  },
});
