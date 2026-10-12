/**
 * Sthira — Workout History Detail Modal
 * Full breakdown of a completed workout session:
 * - Exercises performed with sets, reps, weight, and RIR
 * - Total volume lifted and session metrics
 * - Perceived difficulty rating and workout notes
 * - Option to delete accidental sessions
 */

import React from 'react';
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
import { useWorkoutStore } from '@/stores/useWorkoutStore';

export const WorkoutHistoryDetailModal: React.FC = () => {
  const { colors, isDark } = useAppTheme();

  const isOpen = useWorkoutStore((s) => s.isHistoryModalOpen);
  const session = useWorkoutStore((s) => s.selectedHistorySession);
  const close = useWorkoutStore((s) => s.closeHistoryModal);
  const deleteSession = useWorkoutStore((s) => s.deleteHistorySession);

  if (!isOpen || !session) return null;

  const sess = session.session;
  const minutes = Math.floor((sess.duration_seconds || 0) / 60);
  const seconds = (sess.duration_seconds || 0) % 60;
  const durationText = minutes > 0 ? `${minutes}m ${seconds > 0 ? `${seconds}s` : ''}` : `${seconds}s`;

  const handleDelete = () => {
    Alert.alert(
      'Delete Workout?',
      'Are you sure you want to remove this completed workout from your history? This cannot be undone.',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteSession(sess.id),
        },
      ]
    );
  };

  return (
    <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: isDark ? '#0B0F17' : '#F8FAFC' },
        ]}>
        {/* Top Header */}
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity onPress={close} style={[styles.closeBtn, { backgroundColor: colors.cardBorder }]}>
            <Ionicons name="close" size={18} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
              {sess.title}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
              {sess.date} • {durationText}
            </Text>
          </View>

          <TouchableOpacity onPress={handleDelete} style={[styles.deleteBtn, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
            <Ionicons name="trash-outline" size={18} color={colors.statusAlert} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollList}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Key Metrics Banner */}
          <View style={[styles.statsGrid, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.accent }]}>
                {session.totalVolumeKg.toLocaleString()} kg
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>TOTAL VOLUME</Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />

            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {session.completedSetsCount}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>SETS DONE</Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />

            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {session.exercises.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>EXERCISES</Text>
            </View>
          </View>

          {/* Difficulty & Status Badges */}
          <View style={styles.badgesRow}>
            <View style={[styles.badge, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
              <Ionicons name="checkmark-done" size={14} color={colors.accent} />
              <Text style={[styles.badgeText, { color: colors.accent, marginLeft: 4 }]}>
                COMPLETED
              </Text>
            </View>

            {sess.difficulty_perceived && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      sess.difficulty_perceived === 'Very hard' || sess.difficulty_perceived === 'Hard'
                        ? 'rgba(245, 158, 11, 0.12)'
                        : 'rgba(16, 185, 129, 0.12)',
                  },
                ]}>
                <Ionicons
                  name="barbell-outline"
                  size={14}
                  color={
                    sess.difficulty_perceived === 'Very hard' || sess.difficulty_perceived === 'Hard'
                      ? colors.statusAttention
                      : colors.accent
                  }
                />
                <Text
                  style={[
                    styles.badgeText,
                    {
                      color:
                        sess.difficulty_perceived === 'Very hard' || sess.difficulty_perceived === 'Hard'
                          ? colors.statusAttention
                          : colors.accent,
                      marginLeft: 4,
                    },
                  ]}>
                  Exertion: {sess.difficulty_perceived}
                </Text>
              </View>
            )}
          </View>

          {/* Workout Notes */}
          {sess.notes ? (
            <View style={[styles.notesCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.notesHeader}>
                <Ionicons name="document-text-outline" size={15} color={colors.accent} />
                <Text style={[styles.notesHeading, { color: colors.textSecondary }]}>
                  SESSION NOTES
                </Text>
              </View>
              <Text style={[styles.notesText, { color: colors.text }]}>{sess.notes}</Text>
            </View>
          ) : null}

          {/* Exercise List Heading */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              EXERCISES PERFORMED ({session.exercises.length})
            </Text>
          </View>

          {/* Exercises Breakdown */}
          {session.exercises.map((item, idx) => {
            const ex = item.exercise;
            let exerciseVolume = 0;
            for (const s of item.sets) {
              if (s.is_completed) {
                exerciseVolume += (s.weight_kg || 0) * (s.reps || 0);
              }
            }

            return (
              <View
                key={item.workoutExercise.id}
                style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                {/* Exercise Header */}
                <View style={styles.exCardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.exTitleRow}>
                      <Text style={[styles.exIndex, { color: colors.accent }]}>#{idx + 1}</Text>
                      <Text style={[styles.exName, { color: colors.text }]}>{ex.name}</Text>
                    </View>
                    <Text style={[styles.exDetails, { color: colors.textMuted }]}>
                      {ex.primary_muscle} • {ex.equipment}
                    </Text>
                  </View>

                  <View style={styles.exVolBox}>
                    <Text style={[styles.exVolValue, { color: colors.text }]}>
                      {exerciseVolume > 0 ? `${exerciseVolume.toLocaleString()} kg` : 'Bodyweight'}
                    </Text>
                    <Text style={[styles.exVolLabel, { color: colors.textMuted }]}>Volume</Text>
                  </View>
                </View>

                {/* Sets Table Header */}
                <View style={styles.setsTableHeader}>
                  <Text style={[styles.setColHead, { width: 36, color: colors.textMuted }]}>SET</Text>
                  <Text style={[styles.setColHead, { flex: 1.2, color: colors.textMuted }]}>WEIGHT</Text>
                  <Text style={[styles.setColHead, { flex: 1.1, color: colors.textMuted }]}>REPS</Text>
                  <Text style={[styles.setColHead, { flex: 1.1, color: colors.textMuted }]}>RIR</Text>
                  <Text style={[styles.setColHead, { width: 44, textAlign: 'center', color: colors.textMuted }]}>
                    STATUS
                  </Text>
                </View>

                {/* Sets Rows */}
                {item.sets.map((set) => {
                  const isDone = set.is_completed === 1;

                  return (
                    <View
                      key={set.id}
                      style={[
                        styles.setTableRow,
                        {
                          backgroundColor: isDone
                            ? isDark
                              ? 'rgba(16, 185, 129, 0.05)'
                              : 'rgba(16, 185, 129, 0.04)'
                            : 'transparent',
                        },
                      ]}>
                      <View style={styles.setColNum}>
                        <Text style={[styles.setNumText, { color: colors.textMuted }]}>
                          {set.set_number}
                        </Text>
                      </View>

                      <View style={[styles.setColValue, { flex: 1.2 }]}>
                        <Text style={[styles.setValueText, { color: colors.text }]}>
                          {set.weight_kg} kg
                        </Text>
                      </View>

                      <View style={[styles.setColValue, { flex: 1.1 }]}>
                        <Text style={[styles.setValueText, { color: colors.text }]}>
                          {set.reps} reps
                        </Text>
                      </View>

                      <View style={[styles.setColValue, { flex: 1.1 }]}>
                        <Text style={[styles.setValueSub, { color: colors.textMuted }]}>
                          {set.rir !== null && set.rir !== undefined ? `${set.rir} RIR` : '—'}
                        </Text>
                      </View>

                      <View style={[styles.setColStatus, { width: 44 }]}>
                        {isDone ? (
                          <View style={[styles.doneBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                            <Ionicons name="checkmark" size={14} color={colors.accent} />
                          </View>
                        ) : (
                          <Ionicons name="remove-outline" size={14} color={colors.textMuted} />
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  statsGrid: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: '60%',
    alignSelf: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  notesCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  notesHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  sectionHeader: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  exerciseCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  exCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  exTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exIndex: {
    fontSize: 14,
    fontWeight: '800',
  },
  exName: {
    fontSize: 15,
    fontWeight: '700',
  },
  exDetails: {
    fontSize: 12,
    marginTop: 2,
  },
  exVolBox: {
    alignItems: 'flex-end',
  },
  exVolValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  exVolLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  setsTableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  setColHead: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  setTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  setColNum: {
    width: 36,
  },
  setNumText: {
    fontSize: 12,
    fontWeight: '600',
  },
  setColValue: {
    justifyContent: 'center',
  },
  setValueText: {
    fontSize: 13,
    fontWeight: '600',
  },
  setValueSub: {
    fontSize: 11,
  },
  setColStatus: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
