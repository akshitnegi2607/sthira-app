/**
 * Sthira — Deep Progress & Target Analysis Modal
 * Provides comprehensive, on-demand AI analysis across scale weight,
 * nutrition intake & surplus, and workout volume & overload with 1-tap target adjustments.
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import {
  HolisticAnalysisService,
  HolisticAnalysisReport,
} from '@/services/holisticAnalysisService';
import { showAlert } from '@/utils/alert';

interface DeepAnalysisModalProps {
  visible: boolean;
  onClose: () => void;
  onTargetsUpdated?: () => void;
}

export const DeepAnalysisModal: React.FC<DeepAnalysisModalProps> = ({
  visible,
  onClose,
  onTargetsUpdated,
}) => {
  const { colors, isDark } = useAppTheme();
  const [report, setReport] = useState<HolisticAnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  useEffect(() => {
    if (visible) {
      loadReport();
      setAppliedSuccess(false);
    }
  }, [visible]);

  const loadReport = () => {
    setIsLoading(true);
    try {
      const data = HolisticAnalysisService.generateReport();
      setReport(data);
    } catch (e) {
      console.warn('Error generating holistic report:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyTargets = () => {
    if (!report) return;
    setIsApplying(true);
    try {
      HolisticAnalysisService.applyRevisedTargets(
        report.revisions.proposedCalories,
        report.revisions.proposedProteinMin,
        report.revisions.proposedProteinMax
      );
      setAppliedSuccess(true);
      showAlert(
        'Targets Updated',
        `Daily calorie target set to ${report.revisions.proposedCalories} kcal and protein to ${report.revisions.proposedProteinMin}–${report.revisions.proposedProteinMax}g.`
      );
      if (onTargetsUpdated) {
        onTargetsUpdated();
      }
    } catch (e) {
      showAlert('Error', 'Failed to update targets. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  if (!visible) return null;

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
                  <Ionicons name="sparkles" size={12} color={colors.accent} />
                  <Text style={[styles.badgeText, { color: colors.accent }]}>
                    HOLISTIC AI AUDIT
                  </Text>
                </View>
              </View>
              <Text style={[styles.title, { color: colors.text }]}>Progress & Targets Analysis</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Workout volume • Nutrition surplus • Scale weight velocity
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

          {isLoading || !report ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Analyzing scale velocity, surplus adherence, and exercise overload...
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
              {/* 1. Overall Status Hero Banner */}
              <View
                style={[
                  styles.statusCard,
                  {
                    backgroundColor: isDark
                      ? `${report.statusBadgeColor}18`
                      : `${report.statusBadgeColor}12`,
                    borderColor: report.statusBadgeColor,
                  },
                ]}>
                <View style={styles.statusHeaderRow}>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: report.statusBadgeColor },
                    ]}>
                    <Text style={styles.statusPillText}>{report.overallStatus}</Text>
                  </View>
                  <TouchableOpacity onPress={loadReport} style={styles.refreshBtn}>
                    <Ionicons name="refresh" size={14} color={report.statusBadgeColor} />
                    <Text style={[styles.refreshText, { color: report.statusBadgeColor }]}>
                      Re-evaluate
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.statusHeadline, { color: colors.text }]}>
                  {report.headline}
                </Text>
                <Text style={[styles.statusSummary, { color: colors.textSecondary }]}>
                  {report.executiveSummary}
                </Text>
              </View>

              {/* 2. SCALE WEIGHT & VELOCITY BREAKDOWN */}
              <View
                style={[
                  styles.sectionCard,
                  { backgroundColor: colors.cardElevated, borderColor: colors.cardBorder },
                ]}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Ionicons name="scale-outline" size={17} color={colors.accent} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Scale Weight & Rate of Gain
                    </Text>
                  </View>
                  <View style={styles.measuredPill}>
                    <Text style={[styles.measuredPillText, { color: colors.textMuted }]}>
                      RAW + EMA
                    </Text>
                  </View>
                </View>

                <View style={styles.metricsGrid}>
                  <View style={styles.metricBox}>
                    <Text style={[styles.metricLabel, { color: colors.textMuted }]}>CURRENT WEIGHT</Text>
                    <Text style={[styles.metricValue, { color: colors.text }]}>
                      {report.weight.currentRawKg} kg
                    </Text>
                    <Text style={[styles.metricSub, { color: colors.textMuted }]}>
                      EMA: {report.weight.currentEmaKg} kg
                    </Text>
                  </View>

                  <View style={styles.metricBox}>
                    <Text style={[styles.metricLabel, { color: colors.textMuted }]}>GAIN VELOCITY</Text>
                    <Text
                      style={[
                        styles.metricValue,
                        {
                          color:
                            report.weight.weeklyGainRateKg >= 0.10 &&
                            report.weight.weeklyGainRateKg <= 0.20
                              ? colors.accent
                              : colors.statusAttention,
                        },
                      ]}>
                      {report.weight.weeklyGainRateKg > 0 ? '+' : ''}
                      {report.weight.weeklyGainRateKg} kg/wk
                    </Text>
                    <Text style={[styles.metricSub, { color: colors.textMuted }]}>
                      Ideal: +0.15 kg/wk
                    </Text>
                  </View>

                  <View style={styles.metricBox}>
                    <Text style={[styles.metricLabel, { color: colors.textMuted }]}>LEAN BULK TARGET</Text>
                    <Text style={[styles.metricValue, { color: colors.accent }]}>
                      {report.weight.targetWeightKg} kg
                    </Text>
                    <Text style={[styles.metricSub, { color: colors.textMuted }]}>
                      {report.weight.remainingKg} kg remaining
                    </Text>
                  </View>
                </View>

                <Text style={[styles.evalText, { color: colors.textSecondary }]}>
                  {report.weight.velocityEvaluation}
                </Text>
              </View>

              {/* 3. NUTRITION SURPLUS & PROTEIN BREAKDOWN */}
              <View
                style={[
                  styles.sectionCard,
                  { backgroundColor: colors.cardElevated, borderColor: colors.cardBorder },
                ]}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Ionicons name="restaurant-outline" size={17} color={colors.calories} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Dietary Surplus & Protein Compliance
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.measuredPill,
                      {
                        backgroundColor:
                          report.nutrition.calorieAdherencePercent >= 85
                            ? 'rgba(16, 185, 129, 0.15)'
                            : 'rgba(245, 158, 11, 0.15)',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.measuredPillText,
                        {
                          color:
                            report.nutrition.calorieAdherencePercent >= 85
                              ? colors.accent
                              : colors.statusAttention,
                        },
                      ]}>
                      {report.nutrition.surplusStatus.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.metricsGrid}>
                  <View style={styles.metricBox}>
                    <Text style={[styles.metricLabel, { color: colors.textMuted }]}>AVG CALORIES</Text>
                    <Text style={[styles.metricValue, { color: colors.text }]}>
                      {report.nutrition.averageCaloriesConsumed} kcal
                    </Text>
                    <Text style={[styles.metricSub, { color: colors.textMuted }]}>
                      Target: {report.nutrition.currentCalorieTarget} kcal ({report.nutrition.calorieAdherencePercent}%)
                    </Text>
                  </View>

                  <View style={styles.metricBox}>
                    <Text style={[styles.metricLabel, { color: colors.textMuted }]}>AVG PROTEIN</Text>
                    <Text style={[styles.metricValue, { color: colors.protein }]}>
                      {report.nutrition.averageProteinConsumed}g
                    </Text>
                    <Text style={[styles.metricSub, { color: colors.textMuted }]}>
                      Target: {report.nutrition.currentProteinTarget}g ({report.nutrition.proteinAdherencePercent}%)
                    </Text>
                  </View>

                  <View style={styles.metricBox}>
                    <Text style={[styles.metricLabel, { color: colors.textMuted }]}>PROTEIN RATIO</Text>
                    <Text style={[styles.metricValue, { color: colors.text }]}>
                      {(report.nutrition.averageProteinConsumed / report.weight.currentRawKg).toFixed(2)} g/kg
                    </Text>
                    <Text style={[styles.metricSub, { color: colors.textMuted }]}>
                      Target: 1.8–2.0 g/kg
                    </Text>
                  </View>
                </View>

                <Text style={[styles.evalText, { color: colors.textSecondary }]}>
                  {report.nutrition.nutritionVerdict}
                </Text>
              </View>

              {/* 4. WORKOUT VOLUME & PROGRESSIVE OVERLOAD */}
              <View
                style={[
                  styles.sectionCard,
                  { backgroundColor: colors.cardElevated, borderColor: colors.cardBorder },
                ]}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Ionicons name="barbell-outline" size={17} color={colors.accent} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Training Consistency & Overload
                    </Text>
                  </View>
                  <View style={styles.measuredPill}>
                    <Text style={[styles.measuredPillText, { color: colors.textMuted }]}>
                      {report.workout.completedInPast7Days} / {report.workout.targetDaysPerWeek} SESSIONS
                    </Text>
                  </View>
                </View>

                <View style={styles.metricsGrid}>
                  <View style={styles.metricBox}>
                    <Text style={[styles.metricLabel, { color: colors.textMuted }]}>WEEKLY VOLUME</Text>
                    <Text style={[styles.metricValue, { color: colors.text }]}>
                      {report.workout.totalVolumeKgPast7Days.toLocaleString()} kg
                    </Text>
                    <Text style={[styles.metricSub, { color: colors.textMuted }]}>
                      {report.workout.volumeChangePercent >= 0 ? '+' : ''}
                      {report.workout.volumeChangePercent}% vs prior week
                    </Text>
                  </View>

                  <View style={styles.metricBox}>
                    <Text style={[styles.metricLabel, { color: colors.textMuted }]}>OVERLOAD ACHIEVED</Text>
                    <Text style={[styles.metricValue, { color: colors.accent }]}>
                      {report.workout.overloadCount} Exercises
                    </Text>
                    <Text style={[styles.metricSub, { color: colors.textMuted }]}>
                      Above starting weight
                    </Text>
                  </View>

                  <View style={styles.metricBox}>
                    <Text style={[styles.metricLabel, { color: colors.textMuted }]}>JOINT FATIGUE</Text>
                    <Text
                      style={[
                        styles.metricValue,
                        {
                          color:
                            report.workout.jointFatigueFlags.length > 0
                              ? colors.statusAttention
                              : colors.accent,
                        },
                      ]}>
                      {report.workout.jointFatigueFlags.length > 0
                        ? `${report.workout.jointFatigueFlags.length} Flagged`
                        : 'All Clear'}
                    </Text>
                    <Text style={[styles.metricSub, { color: colors.textMuted }]}>
                      {report.workout.jointFatigueFlags.length > 0 ? 'Deload applied' : 'Safe to push'}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.evalText, { color: colors.textSecondary }]}>
                  {report.workout.trainingVerdict}
                </Text>

                {/* Specific Exercise Overload Recommendations */}
                {report.workout.readyForProgression.length > 0 && (
                  <View style={styles.progressionList}>
                    <Text style={[styles.progressionListHeading, { color: colors.text }]}>
                      Recommended Exercise Adjustments:
                    </Text>
                    {report.workout.readyForProgression.slice(0, 4).map((p) => (
                      <View
                        key={p.exerciseId}
                        style={[
                          styles.progressionItem,
                          {
                            backgroundColor: isDark
                              ? 'rgba(255, 255, 255, 0.04)'
                              : 'rgba(0, 0, 0, 0.03)',
                            borderLeftColor: p.isDeload ? colors.statusAttention : colors.accent,
                          },
                        ]}>
                        <View style={styles.progressionItemHeader}>
                          <Text style={[styles.progressionName, { color: colors.text }]}>
                            {p.exerciseName}
                          </Text>
                          <View
                            style={[
                              styles.progressionBadge,
                              {
                                backgroundColor: p.isDeload
                                  ? 'rgba(245, 158, 11, 0.15)'
                                  : 'rgba(16, 185, 129, 0.15)',
                              },
                            ]}>
                            <Text
                              style={[
                                styles.progressionBadgeText,
                                {
                                  color: p.isDeload ? colors.statusAttention : colors.accent,
                                },
                              ]}>
                              {p.isDeload ? 'DELOAD 15%' : 'READY TO INCREASE'}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.progressionWeight, { color: colors.textSecondary }]}>
                          {p.currentWeightKg} kg ➔{' '}
                          <Text
                            style={{
                              color: p.isDeload ? colors.statusAttention : colors.accent,
                              fontWeight: '700',
                            }}>
                            {p.recommendedWeightKg} kg
                          </Text>
                        </Text>
                        <Text style={[styles.progressionReason, { color: colors.textMuted }]}>
                          {p.reason}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* 5. REVISED ACTION PLAN & TARGETS */}
              <View
                style={[
                  styles.revisedCard,
                  {
                    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)',
                    borderColor: colors.accent,
                  },
                ]}>
                <View style={styles.revisedHeader}>
                  <View style={styles.revisedTitleRow}>
                    <Ionicons name="checkbox-outline" size={18} color={colors.accent} />
                    <Text style={[styles.revisedTitle, { color: colors.text }]}>
                      Recommended Revised Plan
                    </Text>
                  </View>
                </View>

                {/* Target Comparison Pills */}
                <View style={styles.targetComparisonRow}>
                  <View
                    style={[
                      styles.targetBox,
                      { backgroundColor: colors.card, borderColor: colors.cardBorder },
                    ]}>
                    <Text style={[styles.targetBoxLabel, { color: colors.textMuted }]}>DAILY CALORIES</Text>
                    <View style={styles.targetDiffRow}>
                      <Text style={[styles.oldTargetText, { color: colors.textMuted }]}>
                        {report.nutrition.currentCalorieTarget}
                      </Text>
                      <Ionicons name="arrow-forward" size={13} color={colors.accent} />
                      <Text style={[styles.newTargetText, { color: colors.accent }]}>
                        {report.revisions.proposedCalories} kcal
                      </Text>
                    </View>
                    {report.revisions.caloriesDelta !== 0 && (
                      <Text style={[styles.targetDeltaText, { color: colors.accent }]}>
                        {report.revisions.caloriesDelta > 0 ? '+' : ''}
                        {report.revisions.caloriesDelta} kcal adaptation
                      </Text>
                    )}
                  </View>

                  <View
                    style={[
                      styles.targetBox,
                      { backgroundColor: colors.card, borderColor: colors.cardBorder },
                    ]}>
                    <Text style={[styles.targetBoxLabel, { color: colors.textMuted }]}>DAILY PROTEIN</Text>
                    <View style={styles.targetDiffRow}>
                      <Text style={[styles.oldTargetText, { color: colors.textMuted }]}>
                        {report.nutrition.currentProteinTarget}g
                      </Text>
                      <Ionicons name="arrow-forward" size={13} color={colors.protein} />
                      <Text style={[styles.newTargetText, { color: colors.protein }]}>
                        {report.revisions.proposedProteinMin}–{report.revisions.proposedProteinMax}g
                      </Text>
                    </View>
                    <Text style={[styles.targetDeltaText, { color: colors.protein }]}>
                      Hypertrophy optimal
                    </Text>
                  </View>
                </View>

                {/* Action Points */}
                <View style={styles.actionPointsList}>
                  {report.revisions.nutritionActionPoints.map((pt, idx) => (
                    <View key={`nut_${idx}`} style={styles.actionPointRow}>
                      <Ionicons name="nutrition-outline" size={14} color={colors.accent} />
                      <Text style={[styles.actionPointText, { color: colors.text }]}>{pt}</Text>
                    </View>
                  ))}
                  {report.revisions.workoutActionPoints.map((pt, idx) => (
                    <View key={`wo_${idx}`} style={styles.actionPointRow}>
                      <Ionicons name="barbell-outline" size={14} color={colors.protein} />
                      <Text style={[styles.actionPointText, { color: colors.text }]}>{pt}</Text>
                    </View>
                  ))}
                </View>

                {/* 1-Tap Apply Button */}
                <TouchableOpacity
                  disabled={isApplying || appliedSuccess}
                  style={[
                    styles.applyButton,
                    {
                      backgroundColor: appliedSuccess ? '#059669' : colors.accent,
                      opacity: isApplying ? 0.7 : 1,
                    },
                  ]}
                  onPress={handleApplyTargets}>
                  {isApplying ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : appliedSuccess ? (
                    <>
                      <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                      <Text style={styles.applyButtonText}>Targets Applied & Active ✓</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="flash" size={16} color="#FFFFFF" />
                      <Text style={styles.applyButtonText}>
                        Apply Revised Targets to Goals
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderTopWidth: 1,
    maxHeight: '92%',
    minHeight: '75%',
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
  loadingContainer: {
    padding: Spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  body: {
    padding: Spacing.lg,
  },
  statusCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.lg,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  refreshText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusHeadline: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  statusSummary: {
    fontSize: 13,
    lineHeight: 19,
  },
  sectionCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  measuredPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  measuredPillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BorderRadius.sm,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  metricSub: {
    fontSize: 10,
    marginTop: 2,
  },
  evalText: {
    fontSize: 12,
    lineHeight: 17,
  },
  progressionList: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  progressionListHeading: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  progressionItem: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 3,
    marginBottom: 6,
  },
  progressionItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  progressionName: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  progressionBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
  },
  progressionWeight: {
    fontSize: 11.5,
    marginBottom: 2,
  },
  progressionReason: {
    fontSize: 10.5,
    lineHeight: 14,
  },
  revisedCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.xxxl,
  },
  revisedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  revisedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  revisedTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  targetComparisonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  targetBox: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  targetBoxLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  targetDiffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  oldTargetText: {
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  newTargetText: {
    fontSize: 15,
    fontWeight: '800',
  },
  targetDeltaText: {
    fontSize: 10,
    fontWeight: '700',
  },
  actionPointsList: {
    gap: 8,
    marginBottom: Spacing.lg,
  },
  actionPointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  actionPointText: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
