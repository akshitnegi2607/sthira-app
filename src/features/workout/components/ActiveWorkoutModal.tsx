/**
 * Sthira — Active Workout Modal
 * Live training logger featuring exercise sets, double-progression targets,
 * automatic rest timer triggers, RIR ratings, and exercise substitutions.
 */

import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useWorkoutStore } from '@/stores/useWorkoutStore';
import { RestTimerBanner } from './RestTimerBanner';
import { WorkoutFinishModal } from './WorkoutFinishModal';
import { ExerciseSubstitutionModal } from './ExerciseSubstitutionModal';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { calculateProgressiveOverload } from '@/services/progressiveOverload';
import { getAssociatedBodyArea } from '@/services/exerciseSubstitution';
import { PopulatedWorkoutExercise } from '@/database/repositories/workoutRepository';
import { Exercise } from '@/types/database';

export const ActiveWorkoutModal: React.FC = () => {
  const { colors, isDark } = useAppTheme();

  const activeSession = useWorkoutStore((s) => s.activeSession);
  const isSessionActive = useWorkoutStore((s) => s.isSessionActive);
  const elapsedSeconds = useWorkoutStore((s) => s.elapsedSeconds);
  const isTimerPaused = useWorkoutStore((s) => s.isTimerPaused);
  const tickSessionTimer = useWorkoutStore((s) => s.tickSessionTimer);
  const pauseTimer = useWorkoutStore((s) => s.pauseTimer);
  const resumeTimer = useWorkoutStore((s) => s.resumeTimer);
  const cancelWorkout = useWorkoutStore((s) => s.cancelWorkout);
  const openFinishModal = useWorkoutStore((s) => s.openFinishModal);

  const addSet = useWorkoutStore((s) => s.addSet);
  const updateSet = useWorkoutStore((s) => s.updateSet);
  const toggleCompleteSet = useWorkoutStore((s) => s.toggleCompleteSet);
  const deleteSet = useWorkoutStore((s) => s.deleteSet);
  const openSubstitutionModal = useWorkoutStore((s) => s.openSubstitutionModal);
  const openExerciseInfo = useWorkoutStore((s) => s.openExerciseInfo);
  const closeExerciseInfo = useWorkoutStore((s) => s.closeExerciseInfo);
  const selectedExerciseForInfo = useWorkoutStore((s) => s.selectedExerciseForInfo);
  const addExerciseToWorkout = useWorkoutStore((s) => s.addExerciseToWorkout);
  const allExercises = useWorkoutStore((s) => s.exercises);
  const recentPain = useWorkoutStore((s) => s.recentPain);

  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');

  // Clock tick interval
  useEffect(() => {
    if (!isSessionActive) return;
    const interval = setInterval(() => {
      tickSessionTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [isSessionActive, tickSessionTimer]);

  if (!isSessionActive || !activeSession) return null;

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timerDisplay = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const handleCancel = () => {
    Alert.alert(
      'Discard Workout?',
      'Are you sure you want to cancel and discard this active workout session?',
      [
        { text: 'Keep Going', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: cancelWorkout },
      ]
    );
  };

  const filteredExercisesToAdd = allExercises.filter(
    (ex) =>
      ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
      ex.category.toLowerCase().includes(exerciseSearch.toLowerCase())
  );

  return (
    <Modal visible={isSessionActive} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: isDark ? '#0B0F17' : '#F8FAFC' },
        ]}>
        {/* Top Navigation Bar */}
        <View style={[styles.topBar, { borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelAction}>
            <Text style={[styles.cancelText, { color: colors.statusAlert }]}>Discard</Text>
          </TouchableOpacity>

          <View style={styles.clockCenter}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.timerPill,
                { backgroundColor: isTimerPaused ? 'rgba(239, 68, 68, 0.15)' : colors.cardBorder },
              ]}
              onPress={() => (isTimerPaused ? resumeTimer() : pauseTimer())}>
              <Ionicons
                name={isTimerPaused ? 'play' : 'pause'}
                size={12}
                color={isTimerPaused ? colors.statusAlert : colors.textMuted}
              />
              <Text style={[styles.clockText, { color: colors.text }]}>{timerDisplay}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.finishBtn, { backgroundColor: colors.accent }]}
            onPress={openFinishModal}>
            <Text style={styles.finishBtnText}>Finish</Text>
          </TouchableOpacity>
        </View>

        {/* Rest Timer Banner */}
        <View style={{ paddingHorizontal: Spacing.md }}>
          <RestTimerBanner />
        </View>

        {/* Session Stats Banner */}
        <View style={[styles.statsStrip, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {activeSession.completedSetsCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Sets Done</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.accent }]}>
              {activeSession.totalVolumeKg.toLocaleString()} kg
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Volume Lifted</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {activeSession.exercises.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Exercises</Text>
          </View>
        </View>

        {/* Exercises List */}
        <ScrollView style={styles.scrollList} contentContainerStyle={styles.scrollContent}>
          {activeSession.exercises.map((item, idx) => (
            <ExerciseCard
              key={item.workoutExercise.id}
              item={item}
              index={idx}
              allExercises={allExercises}
              recentPain={recentPain}
              onAddSet={() => addSet(item.workoutExercise.id)}
              onUpdateSet={(setId, data) => updateSet(setId, data)}
              onToggleSet={(setId) =>
                toggleCompleteSet(setId, item.exercise.rest_seconds || 90)
              }
              onDeleteSet={(setId) => deleteSet(setId)}
              onSwap={() => openSubstitutionModal(item.workoutExercise.id)}
              onInfo={() => openExerciseInfo(item.exercise)}
            />
          ))}

          {/* Add Exercise to Session */}
          {!isAddingExercise ? (
            <TouchableOpacity
              style={[
                styles.addExerciseBtn,
                {
                  borderColor: colors.cardBorder,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF',
                },
              ]}
              onPress={() => setIsAddingExercise(true)}>
              <Ionicons name="add-circle-outline" size={20} color={colors.accent} />
              <Text style={[styles.addExerciseText, { color: colors.accent }]}>
                Add Exercise to Session
              </Text>
            </TouchableOpacity>
          ) : (
            <View
              style={[
                styles.addPickerBox,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}>
              <View style={styles.pickerHeader}>
                <Text style={[styles.pickerTitle, { color: colors.text }]}>
                  Choose Exercise
                </Text>
                <TouchableOpacity onPress={() => setIsAddingExercise(false)}>
                  <Ionicons name="close" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <TextInput
                style={[
                  styles.pickerInput,
                  {
                    color: colors.text,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F1F5F9',
                    borderColor: colors.cardBorder,
                  },
                ]}
                placeholder="Search exercise..."
                placeholderTextColor={colors.textMuted}
                value={exerciseSearch}
                onChangeText={setExerciseSearch}
              />

              <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                {filteredExercisesToAdd.slice(0, 10).map((ex) => (
                  <TouchableOpacity
                    key={ex.id}
                    style={styles.pickerItem}
                    onPress={() => {
                      addExerciseToWorkout(ex.id);
                      setIsAddingExercise(false);
                      setExerciseSearch('');
                    }}>
                    <View>
                      <Text style={[styles.pickerItemName, { color: colors.text }]}>
                        {ex.name}
                      </Text>
                      <Text style={[styles.pickerItemSub, { color: colors.textMuted }]}>
                        {ex.category} • {ex.equipment}
                      </Text>
                    </View>
                    <Ionicons name="add" size={18} color={colors.accent} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Bottom Complete CTA */}
          <TouchableOpacity
            style={[styles.bottomFinishBtn, { backgroundColor: colors.accent }]}
            onPress={openFinishModal}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.bottomFinishBtnText}>Complete & Save Session</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Overlays mounted directly inside active workout hierarchy */}
        <ExerciseSubstitutionModal />
        <WorkoutFinishModal />
        <ExerciseDetailModal
          exercise={selectedExerciseForInfo}
          onClose={closeExerciseInfo}
        />
      </SafeAreaView>
    </Modal>
  );
};

interface ExerciseCardProps {
  item: PopulatedWorkoutExercise;
  index: number;
  allExercises: Exercise[];
  recentPain: Array<{ body_area: string; pain_level: number }>;
  onAddSet: () => void;
  onUpdateSet: (setId: string, data: any) => void;
  onToggleSet: (setId: string) => void;
  onDeleteSet: (setId: string) => void;
  onSwap: () => void;
  onInfo: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  item,
  index,
  recentPain,
  onAddSet,
  onUpdateSet,
  onToggleSet,
  onDeleteSet,
  onSwap,
  onInfo,
}) => {
  const { colors, isDark } = useAppTheme();
  const ex = item.exercise;

  // Cross-reference with recent pain
  const associatedArea = getAssociatedBodyArea(ex.primary_muscle, ex.category);
  const matchedPain = recentPain.find(
    (p) => p.body_area.toLowerCase() === associatedArea.toLowerCase()
  );

  // Compute live progressive overload guidance
  const completedSets = item.sets.map((s) => ({
    setNumber: s.set_number,
    weightKg: s.weight_kg,
    reps: s.reps,
    rir: s.rir ?? null,
    isCompleted: s.is_completed === 1,
  }));

  const lastWeight =
    completedSets.find((s) => s.isCompleted)?.weightKg ??
    ex.current_recommended_weight_kg ??
    ex.starting_weight_kg ??
    20;

  const overload = calculateProgressiveOverload({
    exerciseId: ex.id,
    exerciseName: ex.name,
    category: ex.category,
    primaryMuscle: ex.primary_muscle,
    targetSets: ex.target_sets,
    targetRepRange: ex.target_rep_range,
    lastWeightKg: lastWeight,
    completedSets,
    recentPainLevel: matchedPain ? matchedPain.pain_level : undefined,
    recentPainArea: matchedPain ? matchedPain.body_area : undefined,
  });

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      {/* Exercise Card Header */}
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.exTitle, { color: colors.text }]}>{ex.name}</Text>
          <Text style={[styles.exSub, { color: colors.textMuted }]}>
            Target: {ex.target_sets} sets × {ex.target_rep_range} • {ex.equipment}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[
              styles.gifPillBtn,
              {
                backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.1)',
                borderColor: colors.protein,
              },
            ]}
            onPress={onInfo}
            activeOpacity={0.7}>
            <Ionicons name="videocam" size={13} color={colors.protein} />
            <Text style={[styles.gifPillText, { color: colors.protein }]}>Form GIF</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionIconBtn, { backgroundColor: colors.cardBorder }]}
            onPress={onSwap}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="swap-horizontal" size={15} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progressive Overload & Target Coach Banner */}
      <View
        style={[
          styles.progressionBanner,
          {
            backgroundColor:
              overload.action === 'increase'
                ? 'rgba(16, 185, 129, 0.12)'
                : overload.action === 'caution'
                ? 'rgba(239, 68, 68, 0.12)'
                : isDark
                ? 'rgba(255,255,255,0.03)'
                : '#F1F5F9',
            borderColor:
              overload.action === 'increase'
                ? colors.accent
                : overload.action === 'caution'
                ? colors.statusAlert
                : colors.cardBorder,
          },
        ]}>
        <View style={styles.progressionRow}>
          <View style={styles.progressionLeft}>
            <Text
              style={[
                styles.progressionStatus,
                {
                  color:
                    overload.action === 'increase'
                      ? colors.accent
                      : overload.action === 'caution'
                      ? colors.statusAlert
                      : colors.textSecondary,
                },
              ]}>
              {overload.statusBadge}
            </Text>
            <Text style={[styles.targetPillText, { color: colors.text }]}>
              Target: {overload.recommendedWeightKg} kg × {overload.recommendedReps}
            </Text>
          </View>
          <View style={styles.estimatedBadge}>
            <Text style={[styles.estimatedBadgeText, { color: colors.textMuted }]}>
              ESTIMATED TARGET
            </Text>
          </View>
        </View>
      </View>

      {/* Sets Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.colHeader, { width: 36, color: colors.textMuted }]}>SET</Text>
        <Text style={[styles.colHeader, { flex: 1.2, color: colors.textMuted }]}>KG</Text>
        <Text style={[styles.colHeader, { flex: 1.1, color: colors.textMuted }]}>REPS</Text>
        <Text style={[styles.colHeader, { flex: 1.1, color: colors.textMuted }]}>RIR</Text>
        <Text style={[styles.colHeader, { width: 44, textAlign: 'center', color: colors.textMuted }]}>
          DONE
        </Text>
      </View>

      {/* Set Rows */}
      {item.sets.map((set, sIdx) => {
        const isCompleted = set.is_completed === 1;

        return (
          <View
            key={set.id}
            style={[
              styles.setRow,
              {
                backgroundColor: isCompleted
                  ? isDark
                    ? 'rgba(16, 185, 129, 0.08)'
                    : 'rgba(16, 185, 129, 0.06)'
                  : 'transparent',
              },
            ]}>
            {/* Set Number */}
            <View style={styles.setNumBox}>
              <Text style={[styles.setNumText, { color: colors.textMuted }]}>
                {set.set_number}
              </Text>
            </View>

            {/* Weight Input with Stepper */}
            <View style={[styles.stepperContainer, { flex: 1.2 }]}>
              <TextInput
                style={[
                  styles.numInput,
                  {
                    color: colors.text,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
                    borderColor: colors.cardBorder,
                  },
                ]}
                keyboardType="decimal-pad"
                value={String(set.weight_kg)}
                onChangeText={(val) => {
                  const num = parseFloat(val);
                  onUpdateSet(set.id, { weight_kg: isNaN(num) ? 0 : num });
                }}
              />
            </View>

            {/* Reps Input with Stepper */}
            <View style={[styles.stepperContainer, { flex: 1.1 }]}>
              <TextInput
                style={[
                  styles.numInput,
                  {
                    color: colors.text,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
                    borderColor: colors.cardBorder,
                  },
                ]}
                keyboardType="number-pad"
                value={String(set.reps)}
                onChangeText={(val) => {
                  const num = parseInt(val, 10);
                  onUpdateSet(set.id, { reps: isNaN(num) ? 0 : num });
                }}
              />
            </View>

            {/* RIR (Reps in Reserve) Selector */}
            <TouchableOpacity
              style={[
                styles.rirBtn,
                {
                  flex: 1.1,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
                  borderColor: colors.cardBorder,
                },
              ]}
              onPress={() => {
                // Cycle 0 -> 1 -> 2 -> 3 -> 4 -> 0
                const current = set.rir ?? 2;
                const next = (current + 1) % 5;
                onUpdateSet(set.id, { rir: next });
              }}>
              <Text style={[styles.rirText, { color: colors.text }]}>
                {set.rir !== null && set.rir !== undefined ? `${set.rir} RIR` : '2 RIR'}
              </Text>
            </TouchableOpacity>

            {/* Checkmark Completion Button */}
            <TouchableOpacity
              style={[
                styles.checkBtn,
                {
                  backgroundColor: isCompleted ? colors.accent : colors.cardBorder,
                },
              ]}
              onPress={() => onToggleSet(set.id)}>
              <Ionicons
                name="checkmark"
                size={16}
                color={isCompleted ? '#FFFFFF' : colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        );
      })}

      {/* Add Set Button */}
      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.addSetBtn} onPress={onAddSet}>
          <Ionicons name="add" size={15} color={colors.accent} />
          <Text style={[styles.addSetText, { color: colors.accent }]}>Add Set</Text>
        </TouchableOpacity>

        {item.sets.length > 1 && (
          <TouchableOpacity
            style={styles.delSetBtn}
            onPress={() => onDeleteSet(item.sets[item.sets.length - 1].id)}>
            <Text style={[styles.delSetText, { color: colors.textMuted }]}>Remove Last Set</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cancelAction: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  clockCenter: {
    alignItems: 'center',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  clockText: {
    fontSize: 15,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  finishBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
  },
  finishBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 20,
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl * 2,
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  exTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  exSub: {
    fontSize: 11,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  actionIconBtn: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressionBanner: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    marginBottom: Spacing.sm,
  },
  progressionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressionStatus: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  targetPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  estimatedBadge: {
    backgroundColor: 'rgba(150, 150, 150, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  estimatedBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
    marginBottom: 4,
  },
  colHeader: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    gap: 6,
  },
  setNumBox: {
    width: 36,
    alignItems: 'center',
  },
  setNumText: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepperContainer: {
    alignItems: 'center',
  },
  numInput: {
    width: '100%',
    height: 34,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
  },
  rirBtn: {
    height: 34,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rirText: {
    fontSize: 11,
    fontWeight: '700',
  },
  checkBtn: {
    width: 36,
    height: 34,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  addSetText: {
    fontSize: 12,
    fontWeight: '700',
  },
  delSetBtn: {
    paddingVertical: 4,
  },
  delSetText: {
    fontSize: 11,
  },
  addExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: Spacing.lg,
  },
  addExerciseText: {
    fontSize: 14,
    fontWeight: '700',
  },
  addPickerBox: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  pickerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  pickerInput: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    fontSize: 13,
    marginBottom: Spacing.sm,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
  },
  pickerItemName: {
    fontSize: 13,
    fontWeight: '600',
  },
  pickerItemSub: {
    fontSize: 11,
    marginTop: 1,
  },
  gifPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  gifPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bottomFinishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.lg,
    marginVertical: Spacing.md,
  },
  bottomFinishBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
