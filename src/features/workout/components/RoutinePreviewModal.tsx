/**
 * Sthira — Routine Preview Modal
 * Allows Jay to preview today's (or any scheduled) routine exercises,
 * target sets, rep ranges, rest intervals, and form guides before starting a live session.
 */

import React, { useMemo } from 'react';
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
import { WorkoutPlan, Exercise } from '@/types/database';
import { WorkoutRepository } from '@/database/repositories/workoutRepository';

interface RoutinePreviewModalProps {
  plan: WorkoutPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onStartWorkout: (planId: string) => void;
  onOpenExerciseInfo: (exercise: Exercise) => void;
}

export const RoutinePreviewModal: React.FC<RoutinePreviewModalProps> = ({
  plan,
  isOpen,
  onClose,
  onStartWorkout,
  onOpenExerciseInfo,
}) => {
  const { colors, isDark } = useAppTheme();

  const exercises = useMemo(() => {
    if (!plan || !isOpen) return [];
    try {
      return WorkoutRepository.getExercisesForPlan(plan.id);
    } catch {
      return [];
    }
  }, [plan, isOpen]);

  const lastPerfMap = useMemo(() => {
    if (!isOpen || exercises.length === 0) return {};
    const map: Record<string, ReturnType<typeof WorkoutRepository.getLastPerformanceForExercise>> = {};
    for (const ex of exercises) {
      try {
        map[ex.id] = WorkoutRepository.getLastPerformanceForExercise(ex.id);
      } catch {
        // silent
      }
    }
    return map;
  }, [exercises, isOpen]);

  if (!isOpen || !plan) return null;

  const isRest = plan.name.toLowerCase().includes('rest');
  const isYoga = plan.name.toLowerCase().includes('yoga');
  const isSwim = plan.name.toLowerCase().includes('swim');
  const totalSets = exercises.reduce((acc, ex) => acc + (ex.target_sets || 3), 0);

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
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
            <View style={{ flex: 1, marginRight: Spacing.sm }}>
              <View style={styles.titleBadgeRow}>
                <View
                  style={[
                    styles.planBadge,
                    {
                      backgroundColor: 'rgba(16, 185, 129, 0.12)',
                      borderColor: colors.accent,
                    },
                  ]}>
                  <Text style={[styles.planBadgeText, { color: colors.accent }]}>
                    ROUTINE PREVIEW
                  </Text>
                </View>
                {!isRest && exercises.length > 0 && (
                  <Text style={[styles.metaSummaryText, { color: colors.textMuted }]}>
                    {exercises.length} exercises • ~{totalSets} sets
                  </Text>
                )}
              </View>
              <Text style={[styles.planTitle, { color: colors.text }]}>
                {plan.name}
              </Text>
              <Text style={[styles.planDesc, { color: colors.textMuted }]}>
                {plan.description}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeBtn,
                { backgroundColor: colors.cardElevated, borderColor: colors.cardBorder },
              ]}>
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Exercise List / Content */}
          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {isRest ? (
              <View style={styles.emptyState}>
                <Ionicons name="bed-outline" size={40} color={colors.textMuted} />
                <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                  Scheduled Rest & Recovery
                </Text>
                <Text style={[styles.emptyStateSub, { color: colors.textMuted }]}>
                  No heavy lifting today. Prioritize hydration, 8+ hours of sleep, and gentle walking to allow muscle tissue repair.
                </Text>
              </View>
            ) : isYoga ? (
              <View style={styles.specialCard}>
                <Ionicons name="body-outline" size={32} color={colors.accent} />
                <Text style={[styles.specialTitle, { color: colors.text }]}>
                  Active Recovery & Mobility Flow
                </Text>
                <Text style={[styles.specialSub, { color: colors.textMuted }]}>
                  Target: 30–45 minutes of gentle hip openers, thoracic spine mobility, hamstring lengthening, and parasympathetic breathwork.
                </Text>
                <View style={[styles.tipsBox, { backgroundColor: colors.cardElevated, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.tipsHeading, { color: colors.text }]}>Recommended Routine:</Text>
                  <Text style={[styles.tipItem, { color: colors.textSecondary }]}>• Cat-Cow & Child's Pose (3 mins)</Text>
                  <Text style={[styles.tipItem, { color: colors.textSecondary }]}>• World's Greatest Stretch (5 mins)</Text>
                  <Text style={[styles.tipItem, { color: colors.textSecondary }]}>• 90/90 Hip Switches & Pigeon Pose (8 mins)</Text>
                  <Text style={[styles.tipItem, { color: colors.textSecondary }]}>• Downward Dog to Cobra flow (5 mins)</Text>
                  <Text style={[styles.tipItem, { color: colors.textSecondary }]}>• Deep belly breathing / Savasana (5 mins)</Text>
                </View>
              </View>
            ) : isSwim ? (
              <View style={styles.specialCard}>
                <Ionicons name="water-outline" size={32} color={colors.water} />
                <Text style={[styles.specialTitle, { color: colors.text }]}>
                  Active Recovery Swim
                </Text>
                <Text style={[styles.specialSub, { color: colors.textMuted }]}>
                  Low-impact aerobic flushing. Keep heart rate in Zone 1–2 (conversational pace) without maximum effort sprints.
                </Text>
              </View>
            ) : (
              <View style={styles.exerciseList}>
                {exercises.map((ex, index) => (
                  <View
                    key={ex.id}
                    style={[
                      styles.exerciseCard,
                      {
                        backgroundColor: colors.cardElevated,
                        borderColor: colors.cardBorder,
                      },
                    ]}>
                    {/* Index + Name row */}
                    <View style={styles.exTopRow}>
                      <View style={styles.exIndexBadge}>
                        <Text style={[styles.exIndexText, { color: colors.accent }]}>
                          {index + 1}
                        </Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                        <Text style={[styles.exName, { color: colors.text }]}>
                          {ex.name}
                        </Text>
                        <Text style={[styles.exSub, { color: colors.textMuted }]}>
                          {ex.category} • {ex.equipment}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.infoBtn,
                          {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0',
                          },
                        ]}
                        onPress={() => onOpenExerciseInfo(ex)}>
                        <Ionicons name="information-circle-outline" size={16} color={colors.accent} />
                        <Text style={[styles.infoBtnText, { color: colors.accent }]}>
                          Form Cue
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Targets row */}
                    <View style={styles.targetsRow}>
                      <View
                        style={[
                          styles.targetPill,
                          {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9',
                            borderColor: colors.cardBorder,
                          },
                        ]}>
                        <Ionicons name="layers-outline" size={12} color={colors.textSecondary} />
                        <Text style={[styles.targetPillText, { color: colors.textSecondary }]}>
                          {ex.target_sets} sets × {ex.target_rep_range}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.targetPill,
                          {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9',
                            borderColor: colors.cardBorder,
                          },
                        ]}>
                        <Ionicons name="timer-outline" size={12} color={colors.textSecondary} />
                        <Text style={[styles.targetPillText, { color: colors.textSecondary }]}>
                          {ex.rest_seconds}s rest
                        </Text>
                      </View>

                      {(ex.current_recommended_weight_kg || ex.starting_weight_kg) && (
                        <View
                          style={[
                            styles.targetPill,
                            {
                              backgroundColor: 'rgba(16, 185, 129, 0.08)',
                              borderColor: colors.accent,
                            },
                          ]}>
                          <Ionicons name="barbell-outline" size={12} color={colors.accent} />
                          <Text style={[styles.targetPillText, { color: colors.accent, fontWeight: '700' }]}>
                            Target: {ex.current_recommended_weight_kg ?? ex.starting_weight_kg} kg
                          </Text>
                        </View>
                      )}

                      {lastPerfMap[ex.id]?.hasHistory && (
                        <View
                          style={[
                            styles.targetPill,
                            {
                              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.12)' : 'rgba(37, 99, 235, 0.08)',
                              borderColor: isDark ? '#3B82F6' : '#2563EB',
                            },
                          ]}>
                          <Ionicons name="time-outline" size={12} color={isDark ? '#60A5FA' : '#2563EB'} />
                          <Text style={[styles.targetPillText, { color: isDark ? '#93C5FD' : '#1E40AF', fontWeight: '700' }]}>
                            Last: {lastPerfMap[ex.id]?.bestSetText}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer Action */}
          <View style={[styles.footer, { borderTopColor: colors.cardBorder }]}>
            <TouchableOpacity
              style={[styles.closeSecondaryBtn, { borderColor: colors.cardBorder }]}
              onPress={onClose}>
              <Text style={[styles.closeSecondaryText, { color: colors.textSecondary }]}>
                Close
              </Text>
            </TouchableOpacity>

            {!isRest && (
              <TouchableOpacity
                style={[styles.startPrimaryBtn, { backgroundColor: colors.accent }]}
                onPress={() => {
                  onClose();
                  onStartWorkout(plan.id);
                }}>
                <Ionicons name="play" size={16} color="#FFFFFF" />
                <Text style={styles.startPrimaryText}>Start Session</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '88%',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderTopWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  planBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metaSummaryText: {
    fontSize: 11,
    fontWeight: '500',
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  planDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  closeBtn: {
    padding: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  scrollBody: {
    maxHeight: '100%',
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  exerciseList: {
    gap: Spacing.sm + 2,
  },
  exerciseCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
  },
  exTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exIndexBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exIndexText: {
    fontSize: 12,
    fontWeight: '800',
  },
  exName: {
    fontSize: 15,
    fontWeight: '700',
  },
  exSub: {
    fontSize: 12,
    marginTop: 1,
  },
  infoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  infoBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  targetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: Spacing.sm,
  },
  targetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  targetPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
    paddingHorizontal: Spacing.lg,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  emptyStateSub: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: 18,
  },
  specialCard: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  specialTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: Spacing.sm,
  },
  specialSub: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: 18,
    marginBottom: Spacing.lg,
  },
  tipsBox: {
    width: '100%',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  tipsHeading: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  tipItem: {
    fontSize: 12,
    lineHeight: 18,
    marginVertical: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  closeSecondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  startPrimaryBtn: {
    flex: 2,
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
