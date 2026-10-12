/**
 * Sthira — Workout Finish Modal
 * Displays session summary, volume lifted, perceived exertion,
 * and seamless post-workout joint pain & fatigue check.
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useWorkoutStore } from '@/stores/useWorkoutStore';

export const WorkoutFinishModal: React.FC = () => {
  const { colors, isDark } = useAppTheme();
  const isOpen = useWorkoutStore((s) => s.isFinishModalOpen);
  const close = useWorkoutStore((s) => s.closeFinishModal);
  const activeSession = useWorkoutStore((s) => s.activeSession);
  const elapsedSeconds = useWorkoutStore((s) => s.elapsedSeconds);
  const finishWorkout = useWorkoutStore((s) => s.finishWorkout);

  const [difficulty, setDifficulty] = useState<'Easy' | 'Good' | 'Hard' | 'Very hard'>('Good');
  const [notes, setNotes] = useState('');
  const [hasPain, setHasPain] = useState(false);
  const [painArea, setPainArea] = useState('Shoulder');
  const [painLevel, setPainLevel] = useState(3);
  const [painNotes, setPainNotes] = useState('');

  if (!isOpen || !activeSession) return null;

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const durationLabel = `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;

  const painAreas = ['Shoulder', 'Elbow', 'Wrist', 'Lower Back', 'Knee', 'Hip', 'Neck'];

  const handleFinish = () => {
    finishWorkout({
      difficulty,
      notes: notes.trim() || undefined,
      painEntry: hasPain
        ? {
            bodyArea: painArea,
            painLevel,
            notes: painNotes.trim() || undefined,
          }
        : undefined,
    });
  };

  return (
    <View style={styles.overlay}>
      <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]}>Finish Workout</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                {activeSession.session.title}
              </Text>
            </View>
            <TouchableOpacity onPress={close} style={[styles.closeBtn, { backgroundColor: colors.cardBorder }]}>
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Session Summary Cards */}
            <View style={[styles.metricsRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }]}>
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>DURATION</Text>
                <Text style={[styles.metricValue, { color: colors.text }]}>{durationLabel}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>SETS DONE</Text>
                <Text style={[styles.metricValue, { color: colors.text }]}>
                  {activeSession.completedSetsCount}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>TOTAL VOLUME</Text>
                <Text style={[styles.metricValue, { color: colors.accent }]}>
                  {activeSession.totalVolumeKg.toLocaleString()} kg
                </Text>
              </View>
            </View>

            {/* Perceived Exertion */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                HOW DID IT FEEL?
              </Text>
              <View style={styles.diffRow}>
                {(['Easy', 'Good', 'Hard', 'Very hard'] as const).map((level) => {
                  const isSelected = difficulty === level;
                  return (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.diffChip,
                        {
                          backgroundColor: isSelected
                            ? colors.accent
                            : isDark
                            ? 'rgba(255,255,255,0.05)'
                            : '#F1F5F9',
                          borderColor: isSelected ? colors.accent : colors.cardBorder,
                        },
                      ]}
                      onPress={() => setDifficulty(level)}>
                      <Text
                        style={[
                          styles.diffText,
                          {
                            color: isSelected ? '#FFFFFF' : colors.text,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}>
                        {level}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Exercises Included */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                EXERCISES COMPLETED ({activeSession.exercises.length})
              </Text>
              <View
                style={[
                  styles.finishExList,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
                    borderColor: colors.cardBorder,
                  },
                ]}>
                {activeSession.exercises.map((item, idx) => {
                  const completedOrLogged = item.sets.filter((s) => s.is_completed || s.reps > 0);
                  const count = completedOrLogged.length > 0 ? completedOrLogged.length : item.sets.length;
                  const maxWeight = Math.max(...item.sets.map((s) => s.weight_kg), 0);

                  return (
                    <View
                      key={item.workoutExercise.id}
                      style={[
                        styles.finishExItem,
                        idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.cardBorder },
                      ]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.finishExTitle, { color: colors.text }]}>
                          {item.exercise.name}
                        </Text>
                        <Text style={[styles.finishExSub, { color: colors.textMuted }]}>
                          {item.exercise.primary_muscle} • {item.exercise.equipment}
                        </Text>
                      </View>
                      <View style={styles.finishExStats}>
                        <Text style={[styles.finishExSetsText, { color: colors.accent }]}>
                          {count} sets
                        </Text>
                        <Text style={[styles.finishExWeightText, { color: colors.textMuted }]}>
                          {maxWeight > 0 ? `${maxWeight} kg` : 'Bodyweight'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                WORKOUT NOTES (OPTIONAL)
              </Text>
              <TextInput
                style={[
                  styles.notesInput,
                  {
                    color: colors.text,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                    borderColor: colors.cardBorder,
                  },
                ]}
                placeholder="Good pump on chest, energy steady..."
                placeholderTextColor={colors.textMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
              />
            </View>

            {/* Pain / Joint Fatigue Check */}
            <View style={[styles.section, styles.painSection]}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.painToggleRow}
                onPress={() => setHasPain(!hasPain)}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.painHeading, { color: colors.text }]}>
                    Any joint pain or discomfort?
                  </Text>
                  <Text style={[styles.painSub, { color: colors.textMuted }]}>
                    Helps the coach automatically protect your joints next session
                  </Text>
                </View>
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: hasPain ? colors.statusAttention : colors.cardBorder,
                      backgroundColor: hasPain ? colors.statusAttention : 'transparent',
                    },
                  ]}>
                  {hasPain && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                </View>
              </TouchableOpacity>

              {hasPain && (
                <View style={styles.painDetails}>
                  <Text style={[styles.subLabel, { color: colors.textMuted }]}>AFFECTED AREA</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.areaScroll}>
                    {painAreas.map((area) => (
                      <TouchableOpacity
                        key={area}
                        style={[
                          styles.areaChip,
                          {
                            backgroundColor:
                              painArea === area
                                ? colors.statusAttention
                                : isDark
                                ? 'rgba(255,255,255,0.05)'
                                : '#F1F5F9',
                            borderColor: painArea === area ? colors.statusAttention : colors.cardBorder,
                          },
                        ]}
                        onPress={() => setPainArea(area)}>
                        <Text
                          style={[
                            styles.areaChipText,
                            {
                              color: painArea === area ? '#FFFFFF' : colors.text,
                              fontWeight: painArea === area ? '700' : '500',
                            },
                          ]}>
                          {area}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <View style={styles.painLevelRow}>
                    <Text style={[styles.subLabel, { color: colors.textMuted }]}>
                      DISCOMFORT LEVEL: <Text style={{ color: colors.statusAttention, fontWeight: '800' }}>{painLevel}/10</Text>
                    </Text>
                    <View style={styles.painButtonsRow}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <TouchableOpacity
                          key={num}
                          style={[
                            styles.levelBtn,
                            {
                              backgroundColor:
                                painLevel === num
                                  ? colors.statusAttention
                                  : isDark
                                  ? 'rgba(255,255,255,0.04)'
                                  : '#F1F5F9',
                            },
                          ]}
                          onPress={() => setPainLevel(num)}>
                          <Text
                            style={[
                              styles.levelBtnText,
                              {
                                color: painLevel === num ? '#FFFFFF' : colors.text,
                                fontWeight: painLevel === num ? '800' : '500',
                              },
                            ]}>
                            {num}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <TextInput
                    style={[
                      styles.painNotesInput,
                      {
                        color: colors.text,
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                        borderColor: colors.cardBorder,
                      },
                    ]}
                    placeholder="Brief detail (e.g., slight click on heavy pressing)..."
                    placeholderTextColor={colors.textMuted}
                    value={painNotes}
                    onChangeText={setPainNotes}
                  />
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer Save Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.accent }]}
              onPress={handleFinish}>
              <Text style={styles.saveBtnText}>Save & Log Workout</Text>
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
    maxHeight: '90%',
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
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  diffRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  diffChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  diffText: {
    fontSize: 12,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 13,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  finishExList: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  finishExItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  finishExTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  finishExSub: {
    fontSize: 11,
    marginTop: 2,
  },
  finishExStats: {
    alignItems: 'flex-end',
  },
  finishExSetsText: {
    fontSize: 12,
    fontWeight: '700',
  },
  finishExWeightText: {
    fontSize: 11,
    marginTop: 2,
  },
  painSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
    paddingTop: Spacing.md,
  },
  painToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  painHeading: {
    fontSize: 14,
    fontWeight: '700',
  },
  painSub: {
    fontSize: 11,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  painDetails: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  subLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  areaScroll: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  areaChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: 8,
  },
  areaChipText: {
    fontSize: 12,
  },
  painLevelRow: {
    marginTop: 4,
  },
  painButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  levelBtn: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBtnText: {
    fontSize: 11,
  },
  painNotesInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 2,
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  saveBtn: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
