import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { WorkoutSession } from '@/types/database';

interface TodayWorkoutCardProps {
  planTitle?: string;
  isCompleted?: boolean;
  isInProgress?: boolean;
  session?: WorkoutSession | null;
  onPressWorkout?: () => void;
}

export const TodayWorkoutCard: React.FC<TodayWorkoutCardProps> = ({
  planTitle = 'Rest Day',
  isCompleted = false,
  isInProgress = false,
  session,
  onPressWorkout,
}) => {
  const { colors, isDark } = useAppTheme();
  const isRest = planTitle.toLowerCase().includes('rest');

  let badgeText = 'PLANNED';
  let badgeColor: string = colors.statusAttention;
  let badgeIcon: 'time' | 'checkmark-circle' | 'barbell' | 'bed' = 'time';
  let badgeBg: string = isDark ? 'rgba(245, 158, 11, 0.18)' : 'rgba(217, 119, 6, 0.12)';

  if (isInProgress) {
    badgeText = 'IN PROGRESS';
    badgeColor = colors.accent;
    badgeIcon = 'barbell';
    badgeBg = isDark ? 'rgba(16, 185, 129, 0.18)' : 'rgba(5, 150, 105, 0.12)';
  } else if (isCompleted) {
    badgeText = 'COMPLETED';
    badgeColor = colors.accent;
    badgeIcon = 'checkmark-circle';
    badgeBg = isDark ? 'rgba(16, 185, 129, 0.18)' : 'rgba(5, 150, 105, 0.12)';
  } else if (isRest) {
    badgeText = 'REST DAY';
    badgeColor = colors.textMuted;
    badgeIcon = 'bed';
    badgeBg = isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9';
  }

  const durationMins = session?.duration_seconds
    ? Math.floor(session.duration_seconds / 60)
    : 0;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Text style={[styles.subheading, { color: colors.textMuted }]}>
            TODAY'S TRAINING
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>{planTitle}</Text>
        </View>

        <View style={[styles.completedBadge, { backgroundColor: badgeBg }]}>
          <Ionicons name={badgeIcon} size={15} color={badgeColor} />
          <Text style={[styles.completedText, { color: badgeColor }]}>{badgeText}</Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        {isInProgress ? (
          <View style={styles.detailItem}>
            <Ionicons name="timer-outline" size={15} color={colors.accent} />
            <Text style={[styles.detailText, { color: colors.accent, fontWeight: '700' }]}>
              Session is actively running
            </Text>
          </View>
        ) : isCompleted ? (
          <>
            <View style={styles.detailItem}>
              <Ionicons name="checkmark-done-outline" size={15} color={colors.accent} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                {durationMins > 0 ? `${durationMins} mins` : 'Completed today'}
              </Text>
            </View>
            {session?.difficulty_perceived ? (
              <>
                <View style={styles.bulletDot} />
                <View style={styles.detailItem}>
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                    Felt: {session.difficulty_perceived}
                  </Text>
                </View>
              </>
            ) : null}
          </>
        ) : isRest ? (
          <View style={styles.detailItem}>
            <Ionicons name="leaf-outline" size={15} color={colors.textMuted} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              Recovery, mobility & relaxation
            </Text>
          </View>
        ) : (
          <View style={styles.detailItem}>
            <Ionicons name="barbell-outline" size={15} color={colors.textMuted} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              Scheduled for today • Ready when you are
            </Text>
          </View>
        )}
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
          {isInProgress
            ? 'Resume Live Workout'
            : isCompleted
            ? 'View Workout Performance'
            : isRest
            ? 'Log Light Recovery Activity'
            : 'Start Workout Session'}
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
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  completedText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
  },
  bulletDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#94A3B8',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
