import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { MealEntryWithEstimates } from '@/database/repositories/mealRepository';
import { NutritionEstimate } from '@/types/database';

interface MealSectionCardProps {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  title: string;
  iconName: keyof typeof Ionicons.glyphMap;
  meals: MealEntryWithEstimates[];
  onAddPress: (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => void;
  onDeleteMeal: (mealId: string) => void;
  onEditEstimate: (estimate: NutritionEstimate) => void;
}

export const MealSectionCard: React.FC<MealSectionCardProps> = ({
  mealType,
  title,
  iconName,
  meals,
  onAddPress,
  onDeleteMeal,
  onEditEstimate,
}) => {
  const { colors, isDark } = useAppTheme();

  const totalCalories = Math.round(meals.reduce((sum, m) => sum + m.total_calories, 0));
  const totalProtein = Math.round(meals.reduce((sum, m) => sum + m.total_protein, 0) * 10) / 10;

  const getConfidenceBadgeColor = (confidence: string) => {
    switch (confidence.toLowerCase()) {
      case 'high':
        return {
          bg: isDark ? 'rgba(34, 197, 94, 0.16)' : 'rgba(22, 163, 74, 0.12)',
          text: colors.statusOnTrack,
        };
      case 'medium':
        return {
          bg: isDark ? 'rgba(245, 158, 11, 0.16)' : 'rgba(217, 119, 6, 0.12)',
          text: colors.statusAttention,
        };
      case 'low':
      default:
        return {
          bg: isDark ? 'rgba(239, 68, 68, 0.16)' : 'rgba(220, 38, 38, 0.12)',
          text: colors.statusAlert,
        };
    }
  };

  return (
    <Card elevated style={styles.card}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: isDark
                  ? 'rgba(56, 189, 248, 0.14)'
                  : 'rgba(2, 132, 199, 0.10)',
              },
            ]}>
            <Ionicons name={iconName} size={18} color={colors.protein} />
          </View>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
              {meals.length > 0
                ? `${totalCalories} kcal • ${totalProtein}g protein`
                : 'No meals logged yet'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.addBtn, { borderColor: colors.cardBorder }]}
          onPress={() => onAddPress(mealType)}>
          <Ionicons name="add" size={16} color={colors.text} />
          <Text style={[styles.addBtnText, { color: colors.text }]}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Meals List */}
      {meals.length > 0 ? (
        <View style={styles.mealsContainer}>
          {meals.map((meal) => (
            <View
              key={meal.id}
              style={[
                styles.mealEntryBlock,
                { borderTopColor: colors.cardBorder },
              ]}>
              <View style={styles.mealMetaRow}>
                <Text style={[styles.rawText, { color: colors.textSecondary }]} numberOfLines={2}>
                  "{meal.raw_text}"
                </Text>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => onDeleteMeal(meal.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="trash-outline" size={15} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Items Breakdown */}
              <View style={styles.itemsList}>
                {meal.items.map((item) => {
                  const badgeStyle = getConfidenceBadgeColor(item.confidence_score);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.itemRow,
                        {
                          backgroundColor: isDark
                            ? 'rgba(255, 255, 255, 0.03)'
                            : 'rgba(0, 0, 0, 0.02)',
                        },
                      ]}
                      onPress={() => onEditEstimate(item)}
                      activeOpacity={0.7}>
                      <View style={styles.itemInfoCol}>
                        <View style={styles.itemTopRow}>
                          <Text style={[styles.itemName, { color: colors.text }]}>
                            {item.quantity} {item.unit} {item.food_name}
                          </Text>
                          <View
                            style={[
                              styles.confidencePill,
                              { backgroundColor: badgeStyle.bg },
                            ]}>
                            <Text
                              style={[
                                styles.confidencePillText,
                                { color: badgeStyle.text },
                              ]}>
                              {item.confidence_score.toUpperCase()}
                            </Text>
                          </View>
                        </View>

                        <Text style={[styles.itemMacros, { color: colors.textMuted }]}>
                          {Math.round(item.calories_estimated)} kcal •{' '}
                          {item.protein_estimated}g P • {item.carbs_estimated}g C •{' '}
                          {item.fat_estimated}g F
                        </Text>

                        {item.clarification_needed === 1 && (
                          <View style={styles.clarifyHintRow}>
                            <Ionicons
                              name="information-circle-outline"
                              size={12}
                              color={colors.statusAttention}
                            />
                            <Text
                              style={[
                                styles.clarifyHintText,
                                { color: colors.statusAttention },
                              ]}>
                              Standard serving assumed. Tap to adjust grams.
                            </Text>
                          </View>
                        )}
                      </View>

                      <Ionicons
                        name="pencil-outline"
                        size={14}
                        color={colors.textMuted}
                        style={{ marginLeft: Spacing.sm }}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 2,
  },
  addBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  mealsContainer: {
    marginTop: Spacing.md,
  },
  mealEntryBlock: {
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  mealMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  rawText: {
    fontSize: 12.5,
    fontStyle: 'italic',
    flex: 1,
    marginRight: Spacing.sm,
  },
  deleteBtn: {
    padding: 4,
  },
  itemsList: {
    gap: 6,
    marginTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  itemInfoCol: {
    flex: 1,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  confidencePill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.sm,
  },
  confidencePillText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  itemMacros: {
    fontSize: 11.5,
  },
  clarifyHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  clarifyHintText: {
    fontSize: 10.5,
    fontWeight: '500',
  },
});
