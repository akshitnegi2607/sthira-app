import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { CuisineRecipe } from '@/types/database';
import { showAlert } from '@/utils/alert';

interface SavedCustomMealsSectionProps {
  customRecipes: CuisineRecipe[];
  onOpenCreateModal: () => void;
  onLogRecipe: (
    recipe: CuisineRecipe,
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  ) => void;
  onDeleteRecipe: (recipeId: string) => void;
}

export const SavedCustomMealsSection: React.FC<SavedCustomMealsSectionProps> = ({
  customRecipes,
  onOpenCreateModal,
  onLogRecipe,
  onDeleteRecipe,
}) => {
  const { colors, isDark } = useAppTheme();
  const [selectedSlot, setSelectedSlot] = useState<
    'breakfast' | 'lunch' | 'dinner' | 'snack'
  >('lunch');

  const handleDeletePrompt = (recipe: CuisineRecipe) => {
    showAlert(
      'Delete Custom Meal',
      `Are you sure you want to remove "${recipe.title}" from your saved meals?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteRecipe(recipe.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
            MY SAVED CUSTOM MEALS
          </Text>
          <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
            1-tap log custom recipes with ingredients
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.createBtn, { backgroundColor: colors.accent }]}
          onPress={onOpenCreateModal}
          activeOpacity={0.85}>
          <Ionicons name="add" size={15} color="#FFFFFF" />
          <Text style={styles.createBtnText}>New Meal</Text>
        </TouchableOpacity>
      </View>

      {/* Meal Slot Selector for 1-Tap Log */}
      {customRecipes.length > 0 && (
        <View style={styles.slotRow}>
          <Text style={[styles.slotPrompt, { color: colors.textMuted }]}>Log to:</Text>
          {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((slot) => {
            const isSelected = selectedSlot === slot;
            return (
              <TouchableOpacity
                key={slot}
                style={[
                  styles.slotChip,
                  {
                    backgroundColor: isSelected
                      ? isDark
                        ? 'rgba(16, 185, 129, 0.2)'
                        : 'rgba(16, 185, 129, 0.12)'
                      : colors.cardElevated,
                    borderColor: isSelected ? colors.accent : colors.cardBorder,
                  },
                ]}
                onPress={() => setSelectedSlot(slot)}>
                <Text
                  style={[
                    styles.slotChipText,
                    {
                      color: isSelected ? colors.accent : colors.textMuted,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}>
                  {slot.charAt(0).toUpperCase() + slot.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Horizontal Recipe Cards */}
      {customRecipes.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {customRecipes.map((recipe) => {
            let ingredientItems: { item: string; amount: string }[] = [];
            try {
              ingredientItems = JSON.parse(recipe.ingredients_json);
            } catch {
              ingredientItems = [];
            }

            return (
              <Card
                key={recipe.id}
                style={[
                  styles.recipeCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                ]}>
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.recipeTitle, { color: colors.text }]} numberOfLines={1}>
                      {recipe.title}
                    </Text>
                    <View style={styles.macroPillRow}>
                      <Text style={[styles.macroHighlight, { color: colors.calories }]}>
                        {Math.round(recipe.estimated_calories)} kcal
                      </Text>
                      <Text style={[styles.macroDot, { color: colors.textMuted }]}>•</Text>
                      <Text style={[styles.macroHighlight, { color: colors.protein }]}>
                        {recipe.estimated_protein}g P
                      </Text>
                      <Text style={[styles.macroDot, { color: colors.textMuted }]}>•</Text>
                      <Text style={[styles.macroSub, { color: colors.textMuted }]}>
                        {recipe.estimated_carbs}g C • {recipe.estimated_fat}g F
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteIconBtn}
                    onPress={() => handleDeletePrompt(recipe)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="trash-outline" size={15} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                {/* Ingredients Pill Tag List */}
                <View style={styles.ingredientsWrap}>
                  {ingredientItems.slice(0, 4).map((ing, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.ingTag,
                        {
                          backgroundColor: isDark
                            ? 'rgba(255, 255, 255, 0.04)'
                            : '#F1F5F9',
                        },
                      ]}>
                      <Text style={[styles.ingTagText, { color: colors.textSecondary }]} numberOfLines={1}>
                        {ing.item} <Text style={{ color: colors.textMuted }}>({ing.amount})</Text>
                      </Text>
                    </View>
                  ))}
                  {ingredientItems.length > 4 && (
                    <Text style={[styles.moreText, { color: colors.textMuted }]}>
                      +{ingredientItems.length - 4} more
                    </Text>
                  )}
                </View>

                {/* 1-Tap Log Button */}
                <TouchableOpacity
                  style={[styles.logBtn, { backgroundColor: colors.accent }]}
                  onPress={() => onLogRecipe(recipe, selectedSlot)}
                  activeOpacity={0.85}>
                  <Ionicons name="add" size={14} color="#FFFFFF" />
                  <Text style={styles.logBtnText}>
                    Log to {selectedSlot.charAt(0).toUpperCase() + selectedSlot.slice(1)}
                  </Text>
                </TouchableOpacity>
              </Card>
            );
          })}
        </ScrollView>
      ) : (
        <Card
          style={[
            styles.emptyCard,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}>
          <Ionicons name="nutrition-outline" size={28} color={colors.protein} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Custom Meals Saved Yet</Text>
          <Text style={[styles.emptySub, { color: colors.textMuted }]}>
            Prepare your staple protein shakes, oatmeal bowls, or paneer dishes once with ingredients and auto-log anytime.
          </Text>
          <TouchableOpacity
            style={[styles.emptyActionBtn, { backgroundColor: colors.accent }]}
            onPress={onOpenCreateModal}>
            <Ionicons name="add" size={15} color="#FFFFFF" />
            <Text style={styles.emptyActionText}>Create Custom Meal</Text>
          </TouchableOpacity>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  sectionSub: {
    fontSize: 11,
    marginTop: 2,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  slotPrompt: {
    fontSize: 11,
    fontWeight: '600',
    marginRight: 2,
  },
  slotChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  slotChipText: {
    fontSize: 11,
  },
  scrollContent: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  recipeCard: {
    width: 250,
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  macroPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  macroHighlight: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  macroDot: {
    fontSize: 10,
  },
  macroSub: {
    fontSize: 10.5,
  },
  deleteIconBtn: {
    padding: 4,
    marginLeft: Spacing.xs,
  },
  ingredientsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    minHeight: 46,
  },
  ingTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  ingTagText: {
    fontSize: 10.5,
  },
  moreText: {
    fontSize: 10,
    alignSelf: 'center',
    marginLeft: 2,
  },
  logBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 7,
    borderRadius: BorderRadius.sm,
  },
  logBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: Spacing.sm,
  },
  emptySub: {
    fontSize: 11.5,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.md,
    lineHeight: 16,
    maxWidth: 280,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
