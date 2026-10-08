import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/Card';

interface TodayWorkoutCardProps {
  planTitle?: string;
  isCompleted?: boolean;
  onPressWorkout?: () => void;
}

export const TodayWorkoutCard: React.FC<TodayWorkoutCardProps> = ({
  planTitle = 'Upper Body A',
  isCompleted = true,
  onPressWorkout,
}) => {
  const { colors, isDark } = useAppTheme();

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Text style={[styles.subheading, { color: colors.textMuted }]}>
            TODAY'S TRAINING
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>{planTitle}</Text>
        </View>

        {isCompleted ? (
          <View
            style={[
              styles.completedBadge,
              {
                backgroundColor: isDark
                  ? 'rgba(16, 185, 129, 0.18)'
                  : 'rgba(5, 150, 105, 0.12)',
              },
            ]}>
            <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
            <Text style={[styles.completedText, { color: colors.accent }]}>
              COMPLETED
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.completedBadge,
              {
                backgroundColor: isDark
                  ? 'rgba(245, 158, 11, 0.18)'
                  : 'rgba(217, 119, 6, 0.12)',
              },
            ]}>
            <Ionicons name="time" size={16} color={colors.statusAttention} />
            <Text style={[styles.completedText, { color: colors.statusAttention }]}>
              PLANNED
            </Text>
          </View>
        )}
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Ionicons name="barbell-outline" size={15} color={colors.textMuted} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            7 Exercises
          </Text>
        </View>
        <View style={styles.bulletDot} />
        <View style={styles.detailItem}>
          <Ionicons name="repeat-outline" size={15} color={colors.textMuted} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            21 Sets • 226 Reps
          </Text>
        </View>
        <View style={styles.bulletDot} />
        <View style={styles.detailItem}>
          <Ionicons name="trending-up-outline" size={15} color={colors.accent} />
          <Text style={[styles.detailText, { color: colors.accent }]}>
            3 Progressed
          </Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        style={[
          styles.actionButton,
          {
            backgroundColor: colors.cardElevated,
            borderColor: colors.cardBorder,
          },
        ]}
        onPress={onPressWorkout}>
        <Text style={[styles.actionButtonText, { color: colors.text }]}>
          {isCompleted ? 'View Workout Performance' : 'Start Workout Session'}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  titleGroup: {
    flex: 1,
  },
  subheading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
  },
  completedText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
    letterSpacing: 0.4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12.5,
    fontWeight: '500',
    marginLeft: 4,
  },
  bulletDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#64748B',
    marginHorizontal: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
