/**
 * Sthira — Exercise Substitution Modal
 * Displays sports-science approved movement alternatives with matched stimulus
 * and allows instant one-tap substitution during active training.
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
import { useWorkoutStore } from '@/stores/useWorkoutStore';
import { getSubstitutesForExercise } from '@/services/exerciseSubstitution';
import { Exercise } from '@/types/database';

export const ExerciseSubstitutionModal: React.FC = () => {
  const { colors, isDark } = useAppTheme();
  const isOpen = useWorkoutStore((s) => s.isSubstitutionModalOpen);
  const workoutExerciseId = useWorkoutStore((s) => s.substitutingWorkoutExerciseId);
  const close = useWorkoutStore((s) => s.closeSubstitutionModal);
  const activeSession = useWorkoutStore((s) => s.activeSession);
  const allExercises = useWorkoutStore((s) => s.exercises);
  const substituteExercise = useWorkoutStore((s) => s.substituteExercise);

  // Find the exercise currently in this slot
  const currentPopulated = useMemo(() => {
    if (!activeSession || !workoutExerciseId) return null;
    return activeSession.exercises.find(
      (e) => e.workoutExercise.id === workoutExerciseId
    );
  }, [activeSession, workoutExerciseId]);

  // Compute alternatives
  const alternatives = useMemo(() => {
    if (!currentPopulated) return [];
    return getSubstitutesForExercise(currentPopulated.exercise, allExercises);
  }, [currentPopulated, allExercises]);

  if (!isOpen || !currentPopulated) return null;

  return (
    <View style={styles.overlay}>
      <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]}>Swap Exercise</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Replacing: {currentPopulated.exercise.name}
              </Text>
            </View>
            <TouchableOpacity onPress={close} style={[styles.closeBtn, { backgroundColor: colors.cardBorder }]}>
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
              RECOMMENDED ALTERNATIVES ({alternatives.length})
            </Text>

            {alternatives.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="information-circle-outline" size={28} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  No direct alternatives found in library.
                </Text>
              </View>
            ) : (
              alternatives.map((item) => {
                const ex = item.exercise;
                const reasonLabel =
                  item.reason === 'explicit_match'
                    ? 'Best Match'
                    : item.reason === 'same_muscle'
                    ? 'Same Muscle Target'
                    : 'Same Movement Category';

                return (
                  <TouchableOpacity
                    key={ex.id}
                    activeOpacity={0.8}
                    style={[
                      styles.altCard,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                        borderColor: colors.cardBorder,
                      },
                    ]}
                    onPress={() => {
                      if (workoutExerciseId) {
                        substituteExercise(workoutExerciseId, ex.id);
                      }
                    }}>
                    <View style={styles.altHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.altName, { color: colors.text }]}>{ex.name}</Text>
                        <Text style={[styles.altMuscle, { color: colors.textMuted }]}>
                          {ex.primary_muscle} • {ex.equipment}
                        </Text>
                      </View>
                      <View style={[styles.reasonBadge, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                        <Text style={[styles.reasonText, { color: colors.accent }]}>
                          {reasonLabel}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.altFooter}>
                      <View style={styles.loadRow}>
                        <Text style={[styles.loadLabel, { color: colors.textMuted }]}>
                          Suggested load:
                        </Text>
                        <Text style={[styles.loadValue, { color: colors.accent }]}>
                          {item.recommendedStartingWeightKg} kg
                        </Text>
                      </View>
                      <View style={styles.swapAction}>
                        <Text style={[styles.swapActionText, { color: colors.accent }]}>
                          Select Swap
                        </Text>
                        <Ionicons name="arrow-forward" size={14} color={colors.accent} />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: colors.cardBorder }]}
              onPress={close}>
              <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>
                Keep Current Exercise
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
    zIndex: 9999,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: Spacing.lg,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
  },
  altCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  altHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  altName: {
    fontSize: 15,
    fontWeight: '700',
  },
  altMuscle: {
    fontSize: 12,
    marginTop: 2,
  },
  reasonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  reasonText: {
    fontSize: 10,
    fontWeight: '700',
  },
  altFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
  },
  loadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  loadLabel: {
    fontSize: 11,
  },
  loadValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  swapAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  swapActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: 13,
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  cancelBtn: {
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
