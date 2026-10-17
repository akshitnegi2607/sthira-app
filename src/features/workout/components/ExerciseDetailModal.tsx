/**
 * Sthira — Exercise Detail Modal
 * Calm, clean reference sheet for exercise execution, form cues, and common mistakes.
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
import { Exercise } from '@/types/database';
import { WorkoutRepository } from '@/database/repositories/workoutRepository';
import { ExerciseVisualGuide } from './ExerciseVisualGuide';

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  onClose: () => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  onClose,
}) => {
  const { colors, isDark } = useAppTheme();

  const lastPerf = useMemo(() => {
    if (!exercise) return null;
    try {
      return WorkoutRepository.getLastPerformanceForExercise(exercise.id);
    } catch {
      return null;
    }
  }, [exercise?.id]);

  if (!exercise) return null;

  return (
    <Modal
      visible={!!exercise}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]}>{exercise.name}</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                {exercise.category} • {exercise.equipment}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.cardBorder }]}>
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Visual Guide with Animated GIF & Photos */}
            <ExerciseVisualGuide
              exerciseId={exercise.id}
              exerciseName={exercise.name}
            />

            {/* Quick Metrics */}
            <View style={[styles.metricsRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC' }]}>
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>TARGET SETS</Text>
                <Text style={[styles.metricValue, { color: colors.text }]}>{exercise.target_sets}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>REP RANGE</Text>
                <Text style={[styles.metricValue, { color: colors.text }]}>{exercise.target_rep_range}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>REST</Text>
                <Text style={[styles.metricValue, { color: colors.text }]}>{exercise.rest_seconds}s</Text>
              </View>
            </View>

            {/* Previous Workout History */}
            <View
              style={[
                styles.historySection,
                {
                  backgroundColor: isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(37, 99, 235, 0.05)',
                  borderColor: isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(37, 99, 235, 0.2)',
                },
              ]}>
              <View style={styles.historyHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="time-outline" size={14} color={isDark ? '#60A5FA' : '#2563EB'} />
                  <Text style={[styles.historyTitle, { color: isDark ? '#93C5FD' : '#1E40AF' }]}>
                    PREVIOUS PERFORMANCE
                  </Text>
                </View>
                {lastPerf?.lastDate ? (
                  <Text style={[styles.historyDate, { color: colors.textMuted }]}>
                    {lastPerf.lastDate}
                  </Text>
                ) : null}
              </View>

              {lastPerf?.hasHistory && lastPerf.lastSets.length > 0 ? (
                <View style={styles.historySetsContainer}>
                  <Text style={[styles.historySummaryText, { color: colors.text }]}>
                    Best: <Text style={{ fontWeight: '700', color: colors.accent }}>{lastPerf.bestSetText}</Text> ({lastPerf.lastSets.length} sets logged)
                  </Text>
                  <View style={styles.historySetsGrid}>
                    {lastPerf.lastSets.map((s) => (
                      <View
                        key={s.setNumber}
                        style={[
                          styles.historySetChip,
                          {
                            backgroundColor: colors.card,
                            borderColor: colors.cardBorder,
                          },
                        ]}>
                        <Text style={[styles.historySetNum, { color: colors.textMuted }]}>
                          Set {s.setNumber}
                        </Text>
                        <Text style={[styles.historySetWeight, { color: colors.text }]}>
                          {s.weightKg} kg
                        </Text>
                        <Text style={[styles.historySetReps, { color: colors.textSecondary }]}>
                          {s.reps} reps
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                <Text style={[styles.noHistoryText, { color: colors.textMuted }]}>
                  No past completed sets recorded yet. Target starting load: {exercise.current_recommended_weight_kg ?? exercise.starting_weight_kg ?? 20} kg.
                </Text>
              )}
            </View>

            {/* Target Muscles */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>MUSCLE GROUPS</Text>
              <Text style={[styles.bodyText, { color: colors.text }]}>
                <Text style={{ fontWeight: '700' }}>Primary: </Text>
                {exercise.primary_muscle}
              </Text>
              {exercise.secondary_muscles ? (
                <Text style={[styles.bodyText, { color: colors.textMuted, marginTop: 4 }]}>
                  <Text style={{ fontWeight: '600' }}>Secondary: </Text>
                  {exercise.secondary_muscles}
                </Text>
              ) : null}
            </View>

            {/* Instructions */}
            {exercise.instructions ? (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>EXECUTION & FORM</Text>
                <Text style={[styles.bodyText, { color: colors.text, lineHeight: 22 }]}>
                  {exercise.instructions}
                </Text>
              </View>
            ) : null}

            {/* Common Mistakes */}
            {exercise.common_mistakes ? (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.statusAttention }]}>COMMON MISTAKES TO AVOID</Text>
                <Text style={[styles.bodyText, { color: colors.text, lineHeight: 22 }]}>
                  {exercise.common_mistakes}
                </Text>
              </View>
            ) : null}

            {/* Substitutions */}
            {exercise.substitutions ? (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>COMMON ALTERNATIVES</Text>
                <Text style={[styles.bodyText, { color: colors.textMuted }]}>
                  {exercise.substitutions}
                </Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: colors.accent }]}
              onPress={onClose}>
              <Text style={styles.doneBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
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
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
  },
  historySection: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  historyTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  historyDate: {
    fontSize: 11,
    fontWeight: '600',
  },
  historySetsContainer: {
    marginTop: 4,
  },
  historySummaryText: {
    fontSize: 12,
    marginBottom: 8,
  },
  historySetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  historySetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 70,
  },
  historySetNum: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  historySetWeight: {
    fontSize: 13,
    fontWeight: '700',
  },
  historySetReps: {
    fontSize: 11,
  },
  noHistoryText: {
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  bodyText: {
    fontSize: 13,
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  doneBtn: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
