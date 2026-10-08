import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { QuickActionButton } from '@/components/ui/QuickActionButton';

interface QuickActionsGridProps {
  onLogFood: () => void;
  onLogWeight: () => void;
  onLogWorkout: () => void;
  onLogActivity: () => void;
  onLogWater: () => void;
  onJournal: () => void;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  onLogFood,
  onLogWeight,
  onLogWorkout,
  onLogActivity,
  onLogWater,
  onJournal,
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        QUICK ACTIONS
      </Text>

      <View style={styles.grid}>
        <QuickActionButton
          label="Log Food"
          iconName="restaurant-outline"
          onPress={onLogFood}
          accentColor={colors.calories}
        />
        <QuickActionButton
          label="Log Weight"
          iconName="scale-outline"
          onPress={onLogWeight}
          accentColor={colors.accent}
        />
        <QuickActionButton
          label="Log Workout"
          iconName="barbell-outline"
          onPress={onLogWorkout}
          accentColor={colors.workout}
        />
      </View>

      <View style={styles.grid}>
        <QuickActionButton
          label="Log Activity"
          iconName="fitness-outline"
          onPress={onLogActivity}
          accentColor="#EC4899"
        />
        <QuickActionButton
          label="Log Water"
          iconName="water-outline"
          onPress={onLogWater}
          accentColor={colors.water}
        />
        <QuickActionButton
          label="Journal"
          iconName="book-outline"
          onPress={onJournal}
          accentColor={colors.sleep}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
