import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { CuisineRecipe } from '@/types/database';

interface CuisineExplorationSectionProps {
  recipes: CuisineRecipe[];
  selectedCuisine: string;
  onSelectCuisine: (cuisine: string) => void;
  onLogRecipe: (
    recipe: CuisineRecipe,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  ) => void;
}

const CUISINES = [
  'All',
  'Indian',
  'Mexican',
  'Mediterranean',
  'Italian',
  'Asian',
  'Middle Eastern',
];

export const CuisineExplorationSection: React.FC<CuisineExplorationSectionProps> = ({
  recipes,
  selectedCuisine,
  onSelectCuisine,
  onLogRecipe,
}) => {
  const { colors, isDark } = useAppTheme();
  const [filterHighProtein, setFilterHighProtein] = useState(false);
  const [filterCalorieCap, setFilterCalorieCap] = useState(false);
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const [mealSlotSelection, setMealSlotSelection] = useState<{
    recipeId: string;
    slot: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  } | null>(null);

  // Filter recipes based on active quick filters
  let filtered = recipes;
  if (selectedCuisine !== 'All') {
    filtered = filtered.filter(
      (r) => r.cuisine.toLowerCase() === selectedCuisine.toLowerCase()
    );
  }
  if (filterHighProtein) {
    filtered = filtered.filter((r) => r.estimated_protein >= 23);
  }
  if (filterCalorieCap) {
    filtered = filtered.filter((r) => r.estimated_calories <= 460);
  }

  const toggleExpand = (id: string) => {
    setExpandedRecipeId((current) => (current === id ? null : id));
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <View
            style={[
              styles.globeIconWrap,
              {
                backgroundColor: isDark
                  ? 'rgba(56, 189, 248, 0.16)'
                  : 'rgba(2, 132, 199, 0.12)',
              },
            ]}>
            <Ionicons name="globe-outline" size={18} color={colors.protein} />
          </View>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Cuisine Exploration</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              High-protein vegetarian meals tailored for Jay (No eggs, no mushrooms)
            </Text>
          </View>
        </View>
      </View>

      {/* Horizontal Cuisine Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cuisineTabsContainer}>
        {CUISINES.map((cuisine) => {
          const isActive = selectedCuisine === cuisine;
          return (
            <TouchableOpacity
              key={cuisine}
              style={[
                styles.cuisineTab,
                {
                  backgroundColor: isActive
                    ? colors.protein
                    : colors.cardElevated,
                  borderColor: isActive ? colors.protein : colors.cardBorder,
                },
              ]}
              onPress={() => onSelectCuisine(cuisine)}>
              <Text
                style={[
                  styles.cuisineTabText,
                  { color: isActive ? '#FFFFFF' : colors.textSecondary },
                  isActive && { fontWeight: '700' },
                ]}>
                {cuisine}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Quick Macro Filter Chips */}
      <View style={styles.macroFiltersRow}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            filterHighProtein && {
              backgroundColor: isDark
                ? 'rgba(56, 189, 248, 0.2)'
                : 'rgba(2, 132, 199, 0.14)',
              borderColor: colors.protein,
            },
            !filterHighProtein && {
              backgroundColor: colors.cardElevated,
              borderColor: colors.cardBorder,
            },
          ]}
          onPress={() => setFilterHighProtein(!filterHighProtein)}>
          <Ionicons
            name="barbell-outline"
            size={13}
            color={filterHighProtein ? colors.protein : colors.textMuted}
          />
          <Text
            style={[
              styles.filterChipText,
              { color: filterHighProtein ? colors.protein : colors.textSecondary },
            ]}>
            High Protein (&gt;23g)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            filterCalorieCap && {
              backgroundColor: isDark
                ? 'rgba(245, 158, 11, 0.2)'
                : 'rgba(217, 119, 6, 0.14)',
              borderColor: colors.calories,
            },
            !filterCalorieCap && {
              backgroundColor: colors.cardElevated,
              borderColor: colors.cardBorder,
            },
          ]}
          onPress={() => setFilterCalorieCap(!filterCalorieCap)}>
          <Ionicons
            name="flame-outline"
            size={13}
            color={filterCalorieCap ? colors.calories : colors.textMuted}
          />
          <Text
            style={[
              styles.filterChipText,
              { color: filterCalorieCap ? colors.calories : colors.textSecondary },
            ]}>
            Under 460 kcal
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recipes Cards List */}
      <View style={styles.cardsList}>
        {filtered.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No recipes found for the selected cuisine and filter combinations.
            </Text>
          </Card>
        ) : (
          filtered.map((recipe) => {
            const isExpanded = expandedRecipeId === recipe.id;
            let ingredients: { item: string; amount: string }[] = [];
            try {
              ingredients = JSON.parse(recipe.ingredients_json);
            } catch {
              ingredients = [];
            }

            const isSlotActive = mealSlotSelection?.recipeId === recipe.id;

            return (
              <Card key={recipe.id} elevated style={styles.recipeCard}>
                {/* Header with Cuisine Tag & Title */}
                <View style={styles.recipeHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.tagRow}>
                      <View
                        style={[
                          styles.cuisineTag,
                          {
                            backgroundColor: isDark
                              ? 'rgba(56, 189, 248, 0.15)'
                              : 'rgba(2, 132, 199, 0.10)',
                          },
                        ]}>
                        <Text style={[styles.cuisineTagText, { color: colors.protein }]}>
                          {recipe.cuisine.toUpperCase()}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.dietaryTag,
                          {
                            backgroundColor: isDark
                              ? 'rgba(34, 197, 94, 0.15)'
                              : 'rgba(22, 163, 74, 0.10)',
                          },
                        ]}>
                        <Text style={[styles.dietaryTagText, { color: colors.statusOnTrack }]}>
                          100% VEGETARIAN
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.recipeTitle, { color: colors.text }]}>
                      {recipe.title}
                    </Text>
                    {recipe.description && (
                      <Text style={[styles.recipeDesc, { color: colors.textSecondary }]}>
                        {recipe.description}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Macro Strip */}
                <View
                  style={[
                    styles.recipeMacroStrip,
                    {
                      backgroundColor: colors.cardElevated,
                      borderColor: colors.cardBorder,
                    },
                  ]}>
                  <View style={styles.macroCol}>
                    <Text style={[styles.macroLabel, { color: colors.textMuted }]}>
                      CALORIES
                    </Text>
                    <Text style={[styles.macroVal, { color: colors.calories }]}>
                      {Math.round(recipe.estimated_calories)}
                      <Text style={styles.unitText}> kcal</Text>
                    </Text>
                  </View>
                  <View style={styles.macroCol}>
                    <Text style={[styles.macroLabel, { color: colors.textMuted }]}>
                      PROTEIN
                    </Text>
                    <Text style={[styles.macroVal, { color: colors.protein }]}>
                      {recipe.estimated_protein}
                      <Text style={styles.unitText}>g</Text>
                    </Text>
                  </View>
                  <View style={styles.macroCol}>
                    <Text style={[styles.macroLabel, { color: colors.textMuted }]}>CARBS</Text>
                    <Text style={[styles.macroVal, { color: colors.text }]}>
                      {recipe.estimated_carbs}
                      <Text style={styles.unitText}>g</Text>
                    </Text>
                  </View>
                  <View style={styles.macroCol}>
                    <Text style={[styles.macroLabel, { color: colors.textMuted }]}>FAT</Text>
                    <Text style={[styles.macroVal, { color: colors.text }]}>
                      {recipe.estimated_fat}
                      <Text style={styles.unitText}>g</Text>
                    </Text>
                  </View>
                </View>

                {/* Jay-Friendly Compliance Indicators */}
                <View style={styles.complianceRow}>
                  <Text style={[styles.complianceText, { color: colors.textMuted }]}>
                    ✓ No Eggs &nbsp;•&nbsp; ✓ No Mushrooms &nbsp;•&nbsp; ✓ High Protein
                  </Text>
                </View>

                {/* Expand / Collapse Recipe Details */}
                <TouchableOpacity
                  style={styles.expandToggle}
                  onPress={() => toggleExpand(recipe.id)}>
                  <Text style={[styles.expandToggleText, { color: colors.protein }]}>
                    {isExpanded ? 'Hide Ingredients & Steps' : 'View Ingredients & Steps'}
                  </Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={15}
                    color={colors.protein}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View
                    style={[
                      styles.expandedDetails,
                      { borderTopColor: colors.cardBorder },
                    ]}>
                    <Text style={[styles.detailsSectionTitle, { color: colors.text }]}>
                      Ingredients:
                    </Text>
                    {ingredients.map((ing, idx) => (
                      <View key={idx} style={styles.ingredientRow}>
                        <Text style={[styles.bullet, { color: colors.protein }]}>•</Text>
                        <Text style={[styles.ingItem, { color: colors.textSecondary }]}>
                          {ing.item}
                        </Text>
                        <Text style={[styles.ingAmount, { color: colors.textMuted }]}>
                          {ing.amount}
                        </Text>
                      </View>
                    ))}

                    {recipe.instructions && (
                      <View style={{ marginTop: Spacing.sm }}>
                        <Text
                          style={[styles.detailsSectionTitle, { color: colors.text }]}>
                          Instructions:
                        </Text>
                        <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>
                          {recipe.instructions}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Quick Log as Meal Action */}
                <View
                  style={[
                    styles.logMealSection,
                    { borderTopColor: colors.cardBorder },
                  ]}>
                  {isSlotActive ? (
                    <View style={styles.slotPickerRow}>
                      <Text style={[styles.slotPrompt, { color: colors.textMuted }]}>
                        Log to which meal?
                      </Text>
                      <View style={styles.slotButtons}>
                        {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(
                          (slot) => (
                            <TouchableOpacity
                              key={slot}
                              style={[
                                styles.slotBtn,
                                {
                                  backgroundColor: colors.cardElevated,
                                  borderColor: colors.cardBorder,
                                },
                              ]}
                              onPress={() => {
                                onLogRecipe(recipe, slot);
                                setMealSlotSelection(null);
                              }}>
                              <Text
                                style={[styles.slotBtnText, { color: colors.protein }]}>
                                {slot.charAt(0).toUpperCase() + slot.slice(1)}
                              </Text>
                            </TouchableOpacity>
                          )
                        )}
                        <TouchableOpacity
                          style={styles.slotCancelBtn}
                          onPress={() => setMealSlotSelection(null)}>
                          <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.logRecipeBtn,
                        {
                          backgroundColor: isDark
                            ? 'rgba(56, 189, 248, 0.12)'
                            : 'rgba(2, 132, 199, 0.08)',
                          borderColor: colors.protein,
                        },
                      ]}
                      onPress={() =>
                        setMealSlotSelection({ recipeId: recipe.id, slot: 'lunch' })
                      }>
                      <Ionicons name="add-circle-outline" size={16} color={colors.protein} />
                      <Text style={[styles.logRecipeBtnText, { color: colors.protein }]}>
                        Log this Recipe to Food Diary
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            );
          })
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  globeIconWrap: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 11.5,
    marginTop: 1,
  },
  cuisineTabsContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  cuisineTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  cuisineTabText: {
    fontSize: 12.5,
  },
  macroFiltersRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 4,
  },
  filterChipText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  cardsList: {
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  emptyCard: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
  recipeCard: {
    padding: Spacing.md,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  cuisineTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  cuisineTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dietaryTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  dietaryTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  recipeTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  recipeDesc: {
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 3,
  },
  recipeMacroStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    marginTop: Spacing.sm,
  },
  macroCol: {
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  macroVal: {
    fontSize: 13.5,
    fontWeight: '800',
    marginTop: 2,
  },
  unitText: {
    fontSize: 10,
    fontWeight: '500',
  },
  complianceRow: {
    marginVertical: Spacing.xs,
  },
  complianceText: {
    fontSize: 10.5,
    fontWeight: '500',
  },
  expandToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  expandToggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  expandedDetails: {
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  detailsSectionTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 4,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  bullet: {
    marginRight: 6,
    fontSize: 12,
  },
  ingItem: {
    fontSize: 12,
    flex: 1,
  },
  ingAmount: {
    fontSize: 12,
    fontWeight: '600',
  },
  instructionsText: {
    fontSize: 12,
    lineHeight: 17,
  },
  logMealSection: {
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  logRecipeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  logRecipeBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  slotPickerRow: {
    flexDirection: 'column',
    gap: 6,
  },
  slotPrompt: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  slotButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  slotBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  slotBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  slotCancelBtn: {
    padding: 4,
  },
});
