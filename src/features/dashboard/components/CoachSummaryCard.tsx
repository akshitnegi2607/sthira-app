import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { DynamicDailyCoachGuidance, MealSuggestion } from '@/services/dailyCoachingEngine';

interface CoachSummaryCardProps {
  guidance?: DynamicDailyCoachGuidance | null;
  summary?: string;
  onViewAnalysis?: () => void;
  onLogMeal?: (meal: MealSuggestion) => void;
}

export const CoachSummaryCard: React.FC<CoachSummaryCardProps> = ({
  guidance,
  summary,
  onViewAnalysis,
  onLogMeal,
}) => {
  const { colors, isDark } = useAppTheme();
  const [loggingMealId, setLoggingMealId] = useState<string | null>(null);
  const [loggedMealIds, setLoggedMealIds] = useState<Record<string, boolean>>({});

  const handleLogMeal = async (meal: MealSuggestion) => {
    if (!onLogMeal || loggingMealId) return;
    setLoggingMealId(meal.id);
    try {
      await onLogMeal(meal);
      setLoggedMealIds((prev) => ({ ...prev, [meal.id]: true }));
    } finally {
      setLoggingMealId(null);
    }
  };

  const timeOfDayLabels = {
    morning: 'MORNING STRATEGY',
    afternoon: 'MID-DAY FUEL',
    evening: 'EVENING PUSH',
    night: 'NIGHT RECOVERY',
  };

  const timeOfDay = guidance?.timeOfDay || 'morning';
  const timeLabel = timeOfDayLabels[timeOfDay];

  // Status badge coloring
  const statusBadge = guidance?.statusBadge || 'ON TRACK';
  let statusBadgeBg: string = isDark ? 'rgba(16, 185, 129, 0.18)' : 'rgba(5, 150, 105, 0.12)';
  let statusBadgeColor: string = colors.accent;

  if (statusBadge === 'ATTENTION') {
    statusBadgeBg = isDark ? 'rgba(245, 158, 11, 0.18)' : 'rgba(217, 119, 6, 0.12)';
    statusBadgeColor = colors.statusAttention;
  } else if (statusBadge === 'NEEDS ACTION') {
    statusBadgeBg = isDark ? 'rgba(239, 68, 68, 0.18)' : 'rgba(220, 38, 38, 0.12)';
    statusBadgeColor = colors.statusAlert;
  } else if (statusBadge === 'PENDING') {
    statusBadgeBg = isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9';
    statusBadgeColor = colors.textMuted;
  }

  const yesterday = guidance?.yesterdayReview;
  const progress = guidance?.todayProgress;
  const suggestedMeals = guidance?.suggestedMeals || [];

  return (
    <Card style={styles.card}>
      {/* 1. Card Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: isDark
                  ? 'rgba(16, 185, 129, 0.2)'
                  : 'rgba(5, 150, 105, 0.12)',
              },
            ]}>
            <Ionicons name="sparkles" size={16} color={colors.accent} />
          </View>
          <View>
            <Text style={[styles.coachTitle, { color: colors.text }]}>Today's AI Coach</Text>
            <Text style={[styles.timeOfDaySub, { color: colors.textMuted }]}>{timeLabel}</Text>
          </View>
        </View>

        <View style={[styles.statusBadgePill, { backgroundColor: statusBadgeBg }]}>
          <Text style={[styles.statusBadgeText, { color: statusBadgeColor }]}>
            {guidance?.statusBadgeLabel || statusBadge}
          </Text>
        </View>
      </View>

      {/* 2. Yesterday's Performance & Improvement Area Banner */}
      {yesterday ? (
        <View
          style={[
            styles.yesterdayCard,
            {
              backgroundColor: isDark
                ? yesterday.isPositive
                  ? 'rgba(16, 185, 129, 0.06)'
                  : 'rgba(245, 158, 11, 0.08)'
                : yesterday.isPositive
                ? 'rgba(16, 185, 129, 0.04)'
                : 'rgba(245, 158, 11, 0.06)',
              borderColor: yesterday.isPositive ? colors.accent : colors.statusAttention,
            },
          ]}>
          <View style={styles.yesterdayHeader}>
            <Ionicons
              name={yesterday.isPositive ? 'checkmark-circle-outline' : 'trending-up-outline'}
              size={14}
              color={yesterday.isPositive ? colors.accent : colors.statusAttention}
            />
            <Text
              style={[
                styles.yesterdayHeading,
                { color: yesterday.isPositive ? colors.accent : colors.statusAttention },
              ]}>
              YESTERDAY'S TAKEAWAY & IMPROVEMENT
            </Text>
          </View>

          <Text style={[styles.yesterdaySummary, { color: colors.textSecondary }]}>
            {yesterday.summary}
          </Text>

          <View style={styles.improvementTargetBox}>
            <Text style={[styles.improvementPrefix, { color: colors.text }]}>
              🎯 Target Improvement Today:{' '}
              <Text style={{ color: colors.textSecondary, fontWeight: 'normal' }}>
                {yesterday.improvementArea}
              </Text>
            </Text>
          </View>
        </View>
      ) : null}

      {/* 3. Real-Time Dynamic Intra-Day Narrative */}
      <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
        {guidance?.motivationalNarrative || summary || "You're on track today. Fuel up and stay consistent!"}
      </Text>

      {/* 4. Real-Time Remaining Budget Metrics */}
      {progress ? (
        <View style={[styles.budgetStrip, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC', borderColor: colors.cardBorder }]}>
          <View style={styles.budgetItem}>
            <Text style={[styles.budgetVal, { color: progress.caloriesRemaining > 0 ? colors.text : colors.accent }]}>
              {progress.caloriesRemaining > 0 ? `${progress.caloriesRemaining.toLocaleString()} kcal` : 'Met ✓'}
            </Text>
            <Text style={[styles.budgetLbl, { color: colors.textMuted }]}>Calories Left</Text>
          </View>
          <View style={[styles.budgetDivider, { backgroundColor: colors.cardBorder }]} />
          <View style={styles.budgetItem}>
            <Text style={[styles.budgetVal, { color: progress.proteinRemaining > 0 ? colors.protein : colors.accent }]}>
              {progress.proteinRemaining > 0 ? `${progress.proteinRemaining}g` : 'Met ✓'}
            </Text>
            <Text style={[styles.budgetLbl, { color: colors.textMuted }]}>Protein Left</Text>
          </View>
          <View style={[styles.budgetDivider, { backgroundColor: colors.cardBorder }]} />
          <View style={styles.budgetItem}>
            <Text style={[styles.budgetVal, { color: progress.waterRemaining > 0 ? colors.water : colors.accent }]}>
              {progress.waterRemaining > 0 ? `${progress.waterRemaining.toFixed(1)}L` : 'Hydrated ✓'}
            </Text>
            <Text style={[styles.budgetLbl, { color: colors.textMuted }]}>Water Left</Text>
          </View>
        </View>
      ) : null}

      {/* 5. Action Checklist */}
      {guidance?.actionChecklist && guidance.actionChecklist.length > 0 ? (
        <View style={styles.checklistContainer}>
          {guidance.actionChecklist.map((act, idx) => (
            <View key={idx} style={styles.checkItemRow}>
              <Ionicons name="radio-button-on" size={11} color={colors.accent} style={{ marginTop: 3 }} />
              <Text style={[styles.checkItemText, { color: colors.textSecondary }]}>{act}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* 6. Tailored Vegetarian Meal Suggestions to Reach Goals */}
      {suggestedMeals.length > 0 && onLogMeal ? (
        <View style={styles.mealSection}>
          <View style={styles.mealSectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="restaurant-outline" size={14} color={colors.accent} />
              <Text style={[styles.mealSectionTitle, { color: colors.text }]}>
                RECOMMENDED MEALS TO HIT TARGETS
              </Text>
            </View>
            <Text style={[styles.vegBadge, { color: colors.accent }]}>100% VEGETARIAN</Text>
          </View>
          <Text style={[styles.mealSectionSub, { color: colors.textMuted }]}>
            High-protein options matching your preferences (No eggs, no mushrooms):
          </Text>

          {suggestedMeals.map((meal) => {
            const isLogged = loggedMealIds[meal.id];
            const isLoading = loggingMealId === meal.id;

            return (
              <View
                key={meal.id}
                style={[
                  styles.mealCard,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF',
                    borderColor: isLogged ? colors.accent : colors.cardBorder,
                  },
                ]}>
                <View style={styles.mealCardTop}>
                  <View style={{ flex: 1, marginRight: Spacing.sm }}>
                    <View style={styles.mealCuisineRow}>
                      <Text style={[styles.mealCuisine, { color: colors.accent }]}>{meal.cuisine}</Text>
                      <Text style={[styles.mealPortion, { color: colors.textMuted }]}>• {meal.portion}</Text>
                    </View>
                    <Text style={[styles.mealName, { color: colors.text }]}>{meal.name}</Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.logMealBtn,
                      {
                        backgroundColor: isLogged
                          ? 'rgba(16, 185, 129, 0.15)'
                          : colors.accent,
                        borderColor: isLogged ? colors.accent : 'transparent',
                      },
                    ]}
                    disabled={isLogged || isLoading}
                    onPress={() => handleLogMeal(meal)}>
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : isLogged ? (
                      <>
                        <Ionicons name="checkmark" size={13} color={colors.accent} />
                        <Text style={[styles.logMealBtnText, { color: colors.accent }]}>Logged</Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="add" size={14} color="#FFFFFF" />
                        <Text style={styles.logMealBtnText}>Log Meal</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Macros Strip */}
                <View style={styles.mealMacroRow}>
                  <Text style={[styles.mealMacroPill, { color: colors.text }]}>
                    🔥 {meal.calories} kcal
                  </Text>
                  <Text style={[styles.mealMacroPill, { color: colors.protein, fontWeight: '700' }]}>
                    💪 {meal.protein}g protein
                  </Text>
                  <Text style={[styles.mealMacroPill, { color: colors.calories }]}>
                    🌾 {meal.carbs}g carbs
                  </Text>
                  <Text style={[styles.mealMacroPill, { color: colors.statusAttention }]}>
                    🥑 {meal.fat}g fat
                  </Text>
                </View>

                <Text style={[styles.mealReason, { color: colors.textMuted }]}>
                  {meal.matchReason}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      {/* 7. Footer Analysis Link */}
      {onViewAnalysis && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onViewAnalysis}
          style={[styles.analysisButton, { borderTopColor: colors.cardBorder }]}>
          <Text style={[styles.analysisButtonText, { color: colors.accent }]}>
            View progress analytics & calorie adaptation
          </Text>
          <Ionicons name="arrow-forward" size={14} color={colors.accent} />
        </TouchableOpacity>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  coachTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  timeOfDaySub: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  statusBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  yesterdayCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  yesterdayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  yesterdayHeading: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  yesterdaySummary: {
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 6,
  },
  improvementTargetBox: {
    paddingTop: 4,
  },
  improvementPrefix: {
    fontSize: 12.5,
    fontWeight: '700',
    lineHeight: 18,
  },
  summaryText: {
    fontSize: 13.5,
    lineHeight: 21,
    marginBottom: Spacing.sm,
  },
  budgetStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginVertical: Spacing.xs,
  },
  budgetItem: {
    alignItems: 'center',
    flex: 1,
  },
  budgetVal: {
    fontSize: 13.5,
    fontWeight: '800',
    marginBottom: 2,
  },
  budgetLbl: {
    fontSize: 10,
    fontWeight: '600',
  },
  budgetDivider: {
    width: 1,
    height: 24,
  },
  checklistContainer: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
    gap: 4,
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checkItemText: {
    fontSize: 12.5,
    lineHeight: 18,
    flex: 1,
  },
  mealSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  mealSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  mealSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  vegBadge: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  mealSectionSub: {
    fontSize: 11.5,
    marginBottom: Spacing.sm,
  },
  mealCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.sm + 2,
    marginBottom: Spacing.sm,
  },
  mealCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  mealCuisineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  mealCuisine: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  mealPortion: {
    fontSize: 10.5,
  },
  mealName: {
    fontSize: 13,
    fontWeight: '700',
  },
  logMealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  logMealBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  mealMacroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  mealMacroPill: {
    fontSize: 11,
    fontWeight: '600',
  },
  mealReason: {
    fontSize: 11,
    fontStyle: 'italic',
    lineHeight: 15,
  },
  analysisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  analysisButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
