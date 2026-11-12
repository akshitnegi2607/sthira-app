/**
 * Sthira — Exercise Detail Modal
 * Calm, clean reference sheet for exercise execution, form cues, and common mistakes.
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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Exercise } from '@/types/database';
import { WorkoutRepository } from '@/database/repositories/workoutRepository';
import { ExerciseVisualGuide } from './ExerciseVisualGuide';
import { getExerciseStretching } from '@/constants/exerciseStretching';
import { getExerciseVideoUrl } from '@/constants/exerciseMedia';

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  onClose: () => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  onClose,
}) => {
  const { colors, isDark } = useAppTheme();
  const [stretchTab, setStretchTab] = useState<'pre' | 'post'>('pre');

  const handleOpenVideo = () => {
    if (!exercise) return;
    const url = exercise.video_url || getExerciseVideoUrl(exercise.id, exercise.name);
    Linking.openURL(url).catch((err) => {
      console.warn('Failed to open YouTube video link:', err);
    });
  };

  const lastPerf = useMemo(() => {
    if (!exercise) return null;
    try {
      return WorkoutRepository.getLastPerformanceForExercise(exercise.id);
    } catch {
      return null;
    }
  }, [exercise?.id]);

  const stretchInfo = useMemo(() => {
    if (!exercise) return null;
    return getExerciseStretching(
      exercise.id,
      exercise.name,
      exercise.category,
      exercise.primary_muscle
    );
  }, [exercise]);

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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  {exercise.category} • {exercise.equipment}
                </Text>
                {exercise.exercise_group ? (
                  <View style={[styles.groupBadge, { backgroundColor: isDark ? 'rgba(168, 85, 247, 0.2)' : '#F3E8FF' }]}>
                    <Ionicons name="ribbon-outline" size={11} color={isDark ? '#D8B4FE' : '#7E22CE'} />
                    <Text style={[styles.groupBadgeText, { color: isDark ? '#D8B4FE' : '#7E22CE' }]}>
                      {exercise.exercise_group.toUpperCase()}
                    </Text>
                  </View>
                ) : null}
              </View>
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

            {/* YouTube Video Tutorial Button */}
            <TouchableOpacity
              style={[styles.videoBtn, { backgroundColor: isDark ? '#B91C1C' : '#DC2626' }]}
              onPress={handleOpenVideo}
              activeOpacity={0.85}>
              <Ionicons name="logo-youtube" size={18} color="#FFFFFF" />
              <Text style={styles.videoBtnText}>Watch Video Tutorial on YouTube</Text>
              <Ionicons name="open-outline" size={15} color="#FFFFFF" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

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

            {/* Pre & Post Workout Stretching Section */}
            {stretchInfo ? (
              <View
                style={[
                  styles.stretchingCard,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC',
                    borderColor: colors.cardBorder,
                  },
                ]}>
                <View style={styles.stretchingHeaderRow}>
                  <Ionicons
                    name={stretchTab === 'pre' ? 'flame-outline' : 'leaf-outline'}
                    size={16}
                    color={stretchTab === 'pre' ? '#F59E0B' : '#8B5CF6'}
                  />
                  <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
                    PRE & POST WORKOUT STRETCHING
                  </Text>
                </View>

                {/* Tab Switcher */}
                <View style={styles.stretchTabBar}>
                  <TouchableOpacity
                    style={[
                      styles.stretchTabBtn,
                      stretchTab === 'pre' && [
                        styles.stretchTabBtnActive,
                        { borderColor: '#F59E0B', backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)' },
                      ],
                    ]}
                    onPress={() => setStretchTab('pre')}>
                    <Ionicons name="flame" size={13} color={stretchTab === 'pre' ? '#F59E0B' : colors.textMuted} />
                    <Text
                      style={[
                        styles.stretchTabText,
                        { color: stretchTab === 'pre' ? '#F59E0B' : colors.textMuted, fontWeight: stretchTab === 'pre' ? '700' : '600' },
                      ]}>
                      Pre-Workout Warm-Up
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.stretchTabBtn,
                      stretchTab === 'post' && [
                        styles.stretchTabBtnActive,
                        { borderColor: '#8B5CF6', backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)' },
                      ],
                    ]}
                    onPress={() => setStretchTab('post')}>
                    <Ionicons name="leaf" size={13} color={stretchTab === 'post' ? '#8B5CF6' : colors.textMuted} />
                    <Text
                      style={[
                        styles.stretchTabText,
                        { color: stretchTab === 'post' ? '#8B5CF6' : colors.textMuted, fontWeight: stretchTab === 'post' ? '700' : '600' },
                      ]}>
                      Post-Workout Cool-Down
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Selected Protocol Content */}
                {(() => {
                  const protocol = stretchTab === 'pre' ? stretchInfo.preWorkout : stretchInfo.postWorkout;
                  return (
                    <View style={styles.protocolContainer}>
                      <Text style={[styles.protocolFocus, { color: colors.textSecondary }]}>
                        <Text style={{ fontWeight: '700', color: colors.text }}>Focus: </Text>
                        {protocol.focus}
                      </Text>

                      <View
                        style={[
                          styles.whyItHelpsMiniBox,
                          {
                            backgroundColor:
                              stretchTab === 'pre'
                                ? isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.06)'
                                : isDark ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.06)',
                            borderColor:
                              stretchTab === 'pre'
                                ? 'rgba(245, 158, 11, 0.25)'
                                : 'rgba(139, 92, 246, 0.25)',
                          },
                        ]}>
                        <Ionicons
                          name="information-circle-outline"
                          size={14}
                          color={stretchTab === 'pre' ? '#F59E0B' : '#8B5CF6'}
                        />
                        <Text style={[styles.whyItHelpsMiniText, { color: colors.text }]}>
                          {protocol.whyItHelps}
                        </Text>
                      </View>

                      {protocol.drills.map((drill, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.drillItemCard,
                            {
                              backgroundColor: colors.card,
                              borderColor: colors.cardBorder,
                            },
                          ]}>
                          <View style={styles.drillItemHeader}>
                            <View
                              style={[
                                styles.drillIndexCircle,
                                {
                                  backgroundColor:
                                    stretchTab === 'pre'
                                      ? 'rgba(245, 158, 11, 0.15)'
                                      : 'rgba(139, 92, 246, 0.15)',
                                },
                              ]}>
                              <Text
                                style={[
                                  styles.drillIndexText,
                                  { color: stretchTab === 'pre' ? '#F59E0B' : '#8B5CF6' },
                                ]}>
                                {idx + 1}
                              </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.drillItemName, { color: colors.text }]}>
                                {drill.name}
                              </Text>
                              <View style={styles.drillMetaRow}>
                                <View
                                  style={[
                                    styles.drillDurationPill,
                                    {
                                      backgroundColor:
                                        stretchTab === 'pre'
                                          ? isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.08)'
                                          : isDark ? 'rgba(139, 92, 246, 0.12)' : 'rgba(139, 92, 246, 0.08)',
                                    },
                                  ]}>
                                  <Ionicons
                                    name="time-outline"
                                    size={10}
                                    color={stretchTab === 'pre' ? '#F59E0B' : '#8B5CF6'}
                                  />
                                  <Text
                                    style={[
                                      styles.drillDurationText,
                                      { color: stretchTab === 'pre' ? '#F59E0B' : '#8B5CF6' },
                                    ]}>
                                    {drill.durationOrReps}
                                  </Text>
                                </View>
                                <Text style={[styles.drillTargetText, { color: colors.textMuted }]}>
                                  • {drill.targetArea}
                                </Text>
                              </View>
                            </View>
                          </View>
                          <Text style={[styles.drillItemDesc, { color: colors.textSecondary }]}>
                            {drill.instructions}
                          </Text>
                        </View>
                      ))}
                    </View>
                  );
                })()}
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
  stretchingCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  stretchingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  stretchTabBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  stretchTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  stretchTabBtnActive: {
    borderWidth: 1,
  },
  stretchTabText: {
    fontSize: 11,
  },
  protocolContainer: {
    marginTop: 2,
  },
  protocolFocus: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 6,
  },
  whyItHelpsMiniBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  whyItHelpsMiniText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  drillItemCard: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  drillItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  drillIndexCircle: {
    width: 18,
    height: 18,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  drillIndexText: {
    fontSize: 10,
    fontWeight: '800',
  },
  drillItemName: {
    fontSize: 13,
    fontWeight: '700',
  },
  drillMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  drillDurationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  drillDurationText: {
    fontSize: 9,
    fontWeight: '700',
  },
  drillTargetText: {
    fontSize: 10,
  },
  drillItemDesc: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
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
  groupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  groupBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  videoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  videoBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
