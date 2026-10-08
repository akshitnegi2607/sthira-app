import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { ExerciseRepository } from '@/database/repositories/exerciseRepository';
import { Exercise, WorkoutPlan } from '@/types/database';

export default function WorkoutScreen() {
  const { colors, isDark } = useAppTheme();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    try {
      const p = ExerciseRepository.getAllWorkoutPlans();
      const ex = ExerciseRepository.getAllExercises();
      setPlans(p);
      setExercises(ex);
    } catch (e) {
      console.warn('Could not load exercises', e);
    }
  }, []);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      {/* Current Weekly Programme */}
      <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
        WEEKLY TRAINING SCHEDULE
      </Text>

      {plans.map((plan) => {
        const dayLabel = plan.day_of_week !== null && plan.day_of_week !== undefined
          ? days[plan.day_of_week]
          : '';
        const isRest = plan.name.toLowerCase().includes('rest');

        return (
          <Card key={plan.id} style={styles.planCard}>
            <View style={styles.planHeader}>
              <View style={styles.dayBadge}>
                <Text style={[styles.dayText, { color: colors.accent }]}>
                  {dayLabel}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text style={[styles.planTitle, { color: colors.text }]}>
                  {plan.name}
                </Text>
                <Text style={[styles.planDesc, { color: colors.textMuted }]}>
                  {plan.description}
                </Text>
              </View>
              <Ionicons
                name={isRest ? 'bed-outline' : 'barbell-outline'}
                size={20}
                color={isRest ? colors.textMuted : colors.accent}
              />
            </View>
          </Card>
        );
      })}

      {/* Exercise Library Preview */}
      <Text style={[styles.sectionHeading, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
        EXERCISE LIBRARY ({exercises.length} EXERCISES)
      </Text>

      {exercises.slice(0, 5).map((item) => (
        <Card key={item.id} style={styles.exerciseCard}>
          <View style={styles.exerciseHeader}>
            <Text style={[styles.exName, { color: colors.text }]}>{item.name}</Text>
            <View style={[styles.targetPill, { backgroundColor: colors.cardBorder }]}>
              <Text style={[styles.targetText, { color: colors.textSecondary }]}>
                {item.target_sets} × {item.target_rep_range}
              </Text>
            </View>
          </View>

          <Text style={[styles.muscleText, { color: colors.textMuted }]}>
            Primary: {item.primary_muscle} • {item.equipment}
          </Text>

          <View style={styles.progressionRow}>
            <Text style={[styles.progressionLabel, { color: colors.textMuted }]}>
              Recommended load:
            </Text>
            <Text style={[styles.progressionVal, { color: colors.accent }]}>
              {item.current_recommended_weight_kg ? `${item.current_recommended_weight_kg} kg` : 'Starting weight not established'}
            </Text>
          </View>
        </Card>
      ))}

      <Text style={[styles.phaseNote, { color: colors.textMuted }]}>
        Interactive live workout logging with rest timers, RIR tracking, and progressive overload calculations will be unlocked in Phase 3.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  planCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayBadge: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  planTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  planDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  exerciseCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exName: {
    fontSize: 15,
    fontWeight: '700',
  },
  targetPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  targetText: {
    fontSize: 11,
    fontWeight: '600',
  },
  muscleText: {
    fontSize: 12,
    marginTop: 4,
  },
  progressionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs + 2,
  },
  progressionLabel: {
    fontSize: 12,
  },
  progressionVal: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  phaseNote: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
});
