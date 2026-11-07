/**
 * Sthira — Biweekly Mesocycle Adaptation Modal
 * Reviews multi-week exercise progression, presents transparent Coach Thinking,
 * and prompts the user to accept recommended routine evolutions or continue.
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import {
  BiweeklyMesocycleReview,
  ExerciseBiweeklyAdaptation,
} from '@/services/mesocycleAdaptation';
import { WorkoutRepository } from '@/database/repositories/workoutRepository';
import { useWorkoutStore } from '@/stores/useWorkoutStore';

interface BiweeklyMesocycleModalProps {
  visible: boolean;
  review: BiweeklyMesocycleReview | null;
  onClose: () => void;
  onApplied?: () => void;
}

export function BiweeklyMesocycleModal({
  visible,
  review,
  onClose,
  onApplied,
}: BiweeklyMesocycleModalProps) {
  const { colors, isDark } = useAppTheme();
  const init = useWorkoutStore((s) => s.init);

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'evolutions' | 'on_track'>('evolutions');
  const [selectedSwaps, setSelectedSwaps] = useState<Record<string, boolean>>({});

  // Synchronize pre-selections when review changes
  React.useEffect(() => {
    if (review && review.adaptations) {
      const initial: Record<string, boolean> = {};
      review.adaptations.forEach((a) => {
        if (a.actionRecommendation === 'SWAP' && a.suggestedExerciseId) {
          const key = `${a.planId}_${a.currentExerciseId}`;
          initial[key] = a.isPreSelected;
        }
      });
      setSelectedSwaps(initial);
    }
  }, [review]);

  if (!visible || !review) return null;

  const toggleSwap = (key: string) => {
    setSelectedSwaps((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAcceptSelected = () => {
    const swapsToApply: { planId: string; oldExerciseId: string; newExerciseId: string }[] = [];

    review.adaptations.forEach((a) => {
      const key = `${a.planId}_${a.currentExerciseId}`;
      if (selectedSwaps[key] && a.suggestedExerciseId) {
        swapsToApply.push({
          planId: a.planId,
          oldExerciseId: a.currentExerciseId,
          newExerciseId: a.suggestedExerciseId,
        });
      }
    });

    if (swapsToApply.length === 0) {
      Alert.alert(
        'No Exercises Selected',
        'Please select at least one recommended routine evolution, or tap "Keep Current Routine" to continue as-is.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      WorkoutRepository.applyBiweeklyExerciseEvolution(swapsToApply);
      init(); // Reload all stores and plans with the updated exercises
      if (onApplied) onApplied();

      Alert.alert(
        'Routine Evolved! 🎉',
        `Successfully updated ${swapsToApply.length} exercise(s) in your weekly split. Your upcoming workout sessions will automatically feature these new movements.`,
        [{ text: 'Continue', onPress: onClose }]
      );
    } catch (e) {
      console.error('Failed to apply biweekly adaptations:', e);
      Alert.alert('Update Failed', 'An error occurred while saving your routine changes.');
    }
  };

  const handleKeepCurrent = () => {
    // Retain current routine and set review timestamp to today
    WorkoutRepository.setLastMesocycleReviewDate(new Date().toISOString());
    init();
    Alert.alert(
      'Current Routine Retained',
      'Your existing workout split has been preserved. The next biweekly review will be ready in 14 days.',
      [{ text: 'OK', onPress: onClose }]
    );
  };

  const evolutionCount = review.adaptations.filter((a) => a.actionRecommendation === 'SWAP').length;
  const selectedCount = Object.values(selectedSwaps).filter(Boolean).length;

  const filteredAdaptations = review.adaptations.filter((a) => {
    if (selectedFilter === 'evolutions') return a.actionRecommendation === 'SWAP';
    if (selectedFilter === 'on_track') return a.actionRecommendation === 'KEEP';
    return true;
  });

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="sparkles" size={16} color="#8B5CF6" />
              <Text style={[styles.headerPreTitle, { color: '#8B5CF6' }]}>
                BIWEEKLY MESOCYCLE REVIEW
              </Text>
            </View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Workout Routine Evolution
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]}
            onPress={onClose}>
            <Ionicons name="close" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          {/* 1. Sports Science Explanation & Coach Thinking */}
          <View
            style={[
              styles.thinkingBanner,
              {
                backgroundColor: isDark ? 'rgba(139, 92, 246, 0.12)' : 'rgba(139, 92, 246, 0.08)',
                borderColor: isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)',
              },
            ]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Ionicons name="bulb-outline" size={18} color="#8B5CF6" />
              <Text style={[styles.thinkingHeading, { color: '#8B5CF6' }]}>
                Why We Evolve Workouts Biweekly
              </Text>
            </View>
            <Text style={[styles.thinkingBody, { color: colors.text }]}>
              Repeating the same core exercises for 2–4 weeks is intentional: it allows your body to build neurological efficiency and measure true progressive overload.
            </Text>
            <Text style={[styles.thinkingBody, { color: colors.textMuted, marginTop: 6 }]}>
              Every 14 days, your AI Coach analyzes your logged weights and reps to detect plateaus, avoid overuse joint wear, and suggest smart variations (e.g. barbell vs dumbbell, angle changes, or constant-tension cables).
            </Text>
          </View>

          {/* 2. Executive Summary Metrics */}
          <View style={styles.metricsRow}>
            <View
              style={[
                styles.metricCard,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}>
              <Text style={[styles.metricNumber, { color: colors.accent }]}>
                {review.progressingWellCount}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                Progressing Cleanly
              </Text>
            </View>

            <View
              style={[
                styles.metricCard,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}>
              <Text style={[styles.metricNumber, { color: review.plateauCount > 0 ? '#F59E0B' : colors.textMuted }]}>
                {review.plateauCount}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                Plateaus Stalled
              </Text>
            </View>

            <View
              style={[
                styles.metricCard,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}>
              <Text style={[styles.metricNumber, { color: '#8B5CF6' }]}>
                {evolutionCount}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                Evolution Ideas
              </Text>
            </View>
          </View>

          {/* 3. Filter Pills */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[
                styles.filterPill,
                selectedFilter === 'evolutions' && { backgroundColor: '#8B5CF6' },
                selectedFilter !== 'evolutions' && { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' },
              ]}
              onPress={() => setSelectedFilter('evolutions')}>
              <Text
                style={[
                  styles.filterPillText,
                  { color: selectedFilter === 'evolutions' ? '#FFFFFF' : colors.textSecondary },
                ]}>
                Recommended Evolutions ({evolutionCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterPill,
                selectedFilter === 'on_track' && { backgroundColor: colors.accent },
                selectedFilter !== 'on_track' && { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' },
              ]}
              onPress={() => setSelectedFilter('on_track')}>
              <Text
                style={[
                  styles.filterPillText,
                  { color: selectedFilter === 'on_track' ? '#FFFFFF' : colors.textSecondary },
                ]}>
                On Track ({review.progressingWellCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterPill,
                selectedFilter === 'all' && { backgroundColor: isDark ? '#334155' : '#475569' },
                selectedFilter !== 'all' && { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' },
              ]}
              onPress={() => setSelectedFilter('all')}>
              <Text
                style={[
                  styles.filterPillText,
                  { color: selectedFilter === 'all' ? '#FFFFFF' : colors.textSecondary },
                ]}>
                All ({review.adaptations.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* 4. Adaptations List */}
          <View style={styles.listSection}>
            {filteredAdaptations.map((item, index) => {
              const swapKey = `${item.planId}_${item.currentExerciseId}`;
              const isSelected = !!selectedSwaps[swapKey];
              const isSwap = item.actionRecommendation === 'SWAP' && item.suggestedExerciseId;

              const badgeColor =
                item.status === 'JOINT_CAUTION'
                  ? '#EF4444'
                  : item.status === 'PLATEAU'
                  ? '#F59E0B'
                  : item.status === 'STIMULUS_VARIATION'
                  ? '#8B5CF6'
                  : colors.accent;

              return (
                <View
                  key={index}
                  style={[
                    styles.adaptationCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: isSelected && isSwap ? '#8B5CF6' : colors.cardBorder,
                      borderWidth: isSelected && isSwap ? 1.5 : 1,
                    },
                  ]}>
                  {/* Top Metadata */}
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.planPill}>
                      <Text style={[styles.planPillText, { color: colors.textSecondary }]}>
                        {item.planName.toUpperCase()}
                      </Text>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: `${badgeColor}18` }]}>
                      <Text style={[styles.statusBadgeText, { color: badgeColor }]}>
                        {item.statusBadge}
                      </Text>
                    </View>

                    {isSwap && (
                      <TouchableOpacity
                        style={[
                          styles.checkbox,
                          {
                            borderColor: isSelected ? '#8B5CF6' : colors.textMuted,
                            backgroundColor: isSelected ? '#8B5CF6' : 'transparent',
                          },
                        ]}
                        onPress={() => toggleSwap(swapKey)}>
                        {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Exercise Swap Visualizer */}
                  {isSwap ? (
                    <View style={styles.swapVisualizerRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.swapLabel, { color: colors.textMuted }]}>CURRENT</Text>
                        <Text style={[styles.swapExName, { color: colors.text }]}>
                          {item.currentExerciseName}
                        </Text>
                      </View>

                      <View style={styles.arrowContainer}>
                        <Ionicons name="arrow-forward" size={18} color="#8B5CF6" />
                      </View>

                      <View style={{ flex: 1.1 }}>
                        <Text style={[styles.swapLabel, { color: '#8B5CF6', fontWeight: '700' }]}>
                          SUGGESTED EVOLUTION
                        </Text>
                        <Text style={[styles.swapExName, { color: '#8B5CF6', fontWeight: '700' }]}>
                          {item.suggestedExerciseName}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={{ marginVertical: 4 }}>
                      <Text style={[styles.swapExName, { color: colors.text }]}>
                        {item.currentExerciseName}
                      </Text>
                      <Text style={[styles.onTrackSub, { color: colors.accent }]}>
                        ✓ Performing consistently. Maintain current loading path.
                      </Text>
                    </View>
                  )}

                  {/* Benefit & Starting Load */}
                  {isSwap && (
                    <View
                      style={[
                        styles.benefitStrip,
                        {
                          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                          borderColor: colors.cardBorder,
                        },
                      ]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name="flash-outline" size={14} color="#8B5CF6" />
                        <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                          {item.targetMuscleBenefit}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                        <Text style={[styles.startingWeightText, { color: colors.textMuted }]}>
                          Starting load: <Text style={{ color: colors.text, fontWeight: '700' }}>{item.suggestedStartingWeightKg} kg</Text>
                        </Text>
                        <Text style={[styles.startingWeightText, { color: colors.textMuted }]}>
                          Target: <Text style={{ color: colors.text, fontWeight: '700' }}>{item.suggestedRepRange} reps</Text>
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Coach Thinking Callout */}
                  <View
                    style={[
                      styles.coachThinkingBox,
                      {
                        backgroundColor: isDark ? 'rgba(139, 92, 246, 0.06)' : 'rgba(139, 92, 246, 0.04)',
                        borderColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)',
                      },
                    ]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Ionicons name="chatbubble-ellipses-outline" size={13} color="#8B5CF6" />
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#8B5CF6' }}>
                        COACH THINKING & DATA RATIONALE
                      </Text>
                    </View>
                    <Text style={[styles.coachThinkingText, { color: colors.text }]}>
                      {item.coachThinking}
                    </Text>
                    <Text style={[styles.patternSummaryText, { color: colors.textMuted }]}>
                      📊 {item.patternSummary}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={[styles.footer, { borderTopColor: colors.cardBorder, backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[styles.acceptBtn, { backgroundColor: '#8B5CF6' }]}
            onPress={handleAcceptSelected}>
            <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
            <Text style={styles.acceptBtnText}>
              Accept {selectedCount > 0 ? `${selectedCount} Changes` : 'Changes'} & Update Routine
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.keepBtn} onPress={handleKeepCurrent}>
            <Text style={[styles.keepBtnText, { color: colors.textSecondary }]}>
              Keep Current Routine (Review in 14 Days)
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerPreTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  thinkingBanner: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  thinkingHeading: {
    fontSize: 13,
    fontWeight: '700',
  },
  thinkingBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  metricCard: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  listSection: {
    gap: Spacing.md,
  },
  adaptationCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  planPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  planPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapVisualizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  swapLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  swapExName: {
    fontSize: 13,
    fontWeight: '600',
  },
  arrowContainer: {
    paddingHorizontal: 8,
  },
  onTrackSub: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  benefitStrip: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  benefitText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  startingWeightText: {
    fontSize: 11,
  },
  coachThinkingBox: {
    marginTop: Spacing.sm,
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  coachThinkingText: {
    fontSize: 11,
    lineHeight: 16,
  },
  patternSummaryText: {
    fontSize: 10,
    marginTop: 6,
    fontStyle: 'italic',
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  keepBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  keepBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
