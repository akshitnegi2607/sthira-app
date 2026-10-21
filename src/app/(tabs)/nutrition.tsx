import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useProfileStore } from '@/stores/useProfileStore';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { useNutritionStore } from '@/stores/useNutritionStore';
import { MacroRingsCard } from '@/features/nutrition/components/MacroRingsCard';
import { MealSectionCard } from '@/features/nutrition/components/MealSectionCard';
import { NaturalLanguageLoggerModal } from '@/features/nutrition/components/NaturalLanguageLoggerModal';
import { ClarificationModal } from '@/features/nutrition/components/ClarificationModal';
import { CuisineExplorationSection } from '@/features/nutrition/components/CuisineExplorationSection';
import { SavedCustomMealsSection } from '@/features/nutrition/components/SavedCustomMealsSection';
import { CustomMealModal } from '@/features/nutrition/components/CustomMealModal';
import { EkadashiBanner } from '@/features/nutrition/components/EkadashiBanner';
import { NutritionEstimate } from '@/types/database';
import { getTodayDateString, shiftDateString, formatDateLabel } from '@/utils/date';

export default function NutritionScreen() {
  const { colors, isDark } = useAppTheme();
  const goals = useProfileStore((s) => s.goals);
  const currentLog = useNutritionStore((s) => s.currentLog);

  const {
    selectedDate,
    meals,
    recipes,
    customRecipes,
    selectedCuisine,
    isLoading,
    setSelectedDate,
    loadNutritionData,
    logMeal,
    deleteMeal,
    updateEstimate,
    logRecipeAsMeal,
    createCustomRecipe,
    deleteCustomRecipe,
    setSelectedCuisine,
  } = useNutritionStore();

  const [loggerModalVisible, setLoggerModalVisible] = useState(false);
  const [customMealModalVisible, setCustomMealModalVisible] = useState(false);
  const [activeMealType, setActiveMealType] = useState<
    'breakfast' | 'lunch' | 'dinner' | 'snack'
  >('lunch');
  const [selectedEstimateForEdit, setSelectedEstimateForEdit] =
    useState<NutritionEstimate | null>(null);

  useEffect(() => {
    loadNutritionData();
  }, [loadNutritionData]);

  useFocusEffect(
    useCallback(() => {
      loadNutritionData(selectedDate);
    }, [loadNutritionData, selectedDate])
  );

  // Group meals safely by meal type with case-insensitivity & fallback
  const normalizeMealType = (type?: string): 'breakfast' | 'lunch' | 'dinner' | 'snack' => {
    const t = (type || '').toLowerCase().trim();
    if (t.includes('break')) return 'breakfast';
    if (t.includes('lunch')) return 'lunch';
    if (t.includes('din')) return 'dinner';
    return 'snack';
  };

  const breakfastMeals = meals.filter((m) => normalizeMealType(m.meal_type) === 'breakfast');
  const lunchMeals = meals.filter((m) => normalizeMealType(m.meal_type) === 'lunch');
  const dinnerMeals = meals.filter((m) => normalizeMealType(m.meal_type) === 'dinner');
  const snackMeals = meals.filter((m) => normalizeMealType(m.meal_type) === 'snack');

  const handleOpenLogger = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    setActiveMealType(mealType);
    setLoggerModalVisible(true);
  };

  const handleDateShift = (direction: 'prev' | 'next') => {
    const newDateStr = shiftDateString(selectedDate, direction === 'next' ? 1 : -1);
    setSelectedDate(newDateStr);
  };

  const isToday = selectedDate === getTodayDateString();
  const dateFormatted = formatDateLabel(selectedDate);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Date Header Strip */}
      <View
        style={[
          styles.dateBar,
          { backgroundColor: colors.card, borderBottomColor: colors.cardBorder },
        ]}>
        <TouchableOpacity
          style={styles.dateNavBtn}
          onPress={() => handleDateShift('prev')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={18} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateCenter}
          onPress={() => setSelectedDate(getTodayDateString())}>
          <Text style={[styles.dateText, { color: colors.text }]}>
            {isToday ? `Today (${dateFormatted})` : dateFormatted}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateNavBtn}
          onPress={() => handleDateShift('next')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-forward" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => loadNutritionData(selectedDate)}
            tintColor={colors.protein}
          />
        }>
        {/* Ekadashi Fasting & Observance Banner */}
        <EkadashiBanner currentDateStr={selectedDate} />

        {/* Visual Macro Rings Card */}
        <MacroRingsCard
          caloriesConsumed={currentLog?.calories_consumed || 0}
          caloriesTarget={goals.calories_target}
          proteinConsumed={currentLog?.protein_consumed || 0}
          proteinTargetMin={goals.protein_target_min}
          proteinTargetMax={goals.protein_target_max}
          carbsConsumed={currentLog?.carbs_consumed || 0}
          carbsTarget={goals.carbs_target}
          fatConsumed={currentLog?.fat_consumed || 0}
          fatTargetMax={goals.fat_target_max}
        />

        {/* Daily Hydration Bar */}
        <View
          style={[
            styles.hydrationCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}>
          <View style={styles.hydrationHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
              <Ionicons name="water" size={17} color={colors.water} />
              <Text style={[styles.hydrationTitle, { color: colors.text }]}>Hydration</Text>
            </View>
            <Text style={[styles.hydrationValue, { color: colors.water }]}>
              {(Number(currentLog?.water_liters) || 0).toFixed(1)} / {goals.water_target_liters || 2.5} L
            </Text>
          </View>
          <View style={styles.quickWaterChips}>
            {[
              { liters: 0.25, label: '+250 ml' },
              { liters: 0.5, label: '+500 ml' },
              { liters: 0.75, label: '+750 ml' },
              { liters: 1.0, label: '+1.0 L' },
            ].map((chip) => (
              <TouchableOpacity
                key={chip.liters}
                style={[
                  styles.waterChip,
                  {
                    backgroundColor: colors.cardElevated,
                    borderColor: colors.cardBorder,
                  },
                ]}
                onPress={() => {
                  useDashboardStore.getState().quickAddWater(chip.liters);
                  loadNutritionData(selectedDate);
                }}>
                <Text style={[styles.waterChipText, { color: colors.water }]}>{chip.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Action Banners: NLP Logger & Custom Recipe Builder */}
        <View style={styles.bannersRow}>
          <TouchableOpacity
            style={[
              styles.actionBanner,
              {
                backgroundColor: isDark
                  ? 'rgba(56, 189, 248, 0.12)'
                  : 'rgba(2, 132, 199, 0.08)',
                borderColor: colors.protein,
              },
            ]}
            onPress={() => handleOpenLogger('lunch')}
            activeOpacity={0.8}>
            <View style={styles.bannerLeft}>
              <View
                style={[
                  styles.bannerIconWrap,
                  { backgroundColor: colors.protein },
                ]}>
                <Ionicons name="mic-outline" size={16} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.bannerTitle, { color: colors.text }]}>
                  Natural Language Meal Logger
                </Text>
                <Text style={[styles.bannerSub, { color: colors.textMuted }]} numberOfLines={1}>
                  Type or speak meals: "2 besan chillas with 100g paneer"
                </Text>
              </View>
            </View>
            <Ionicons name="arrow-forward" size={16} color={colors.protein} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBanner,
              {
                backgroundColor: isDark
                  ? 'rgba(16, 185, 129, 0.12)'
                  : 'rgba(16, 185, 129, 0.08)',
                borderColor: colors.accent,
              },
            ]}
            onPress={() => setCustomMealModalVisible(true)}
            activeOpacity={0.8}>
            <View style={styles.bannerLeft}>
              <View
                style={[
                  styles.bannerIconWrap,
                  { backgroundColor: colors.accent },
                ]}>
                <Ionicons name="restaurant-outline" size={16} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.bannerTitle, { color: colors.text }]}>
                  Custom Meal & Recipe Builder
                </Text>
                <Text style={[styles.bannerSub, { color: colors.textMuted }]} numberOfLines={1}>
                  Build meals with ingredients for 1-tap future logging
                </Text>
              </View>
            </View>
            <Ionicons name="add" size={18} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Daily Meal Sections */}
        <View style={styles.mealsSection}>
          <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>
            {isToday ? "TODAY'S FOOD DIARY" : `${dateFormatted.toUpperCase()} FOOD DIARY`}
            {meals.length > 0 ? ` (${meals.length} LOGGED)` : ''}
          </Text>

          <MealSectionCard
            mealType="breakfast"
            title="Breakfast"
            iconName="sunny-outline"
            meals={breakfastMeals}
            onAddPress={handleOpenLogger}
            onDeleteMeal={deleteMeal}
            onEditEstimate={setSelectedEstimateForEdit}
          />

          <MealSectionCard
            mealType="lunch"
            title="Lunch"
            iconName="restaurant-outline"
            meals={lunchMeals}
            onAddPress={handleOpenLogger}
            onDeleteMeal={deleteMeal}
            onEditEstimate={setSelectedEstimateForEdit}
          />

          <MealSectionCard
            mealType="dinner"
            title="Dinner"
            iconName="moon-outline"
            meals={dinnerMeals}
            onAddPress={handleOpenLogger}
            onDeleteMeal={deleteMeal}
            onEditEstimate={setSelectedEstimateForEdit}
          />

          <MealSectionCard
            mealType="snack"
            title="Snacks & Supplements"
            iconName="cafe-outline"
            meals={snackMeals}
            onAddPress={handleOpenLogger}
            onDeleteMeal={deleteMeal}
            onEditEstimate={setSelectedEstimateForEdit}
          />
        </View>

        {/* Saved Custom Meals Section */}
        <SavedCustomMealsSection
          customRecipes={customRecipes}
          onOpenCreateModal={() => setCustomMealModalVisible(true)}
          onLogRecipe={logRecipeAsMeal}
          onDeleteRecipe={deleteCustomRecipe}
        />

        {/* Cuisine Exploration Feature */}
        <CuisineExplorationSection
          recipes={recipes}
          selectedCuisine={selectedCuisine}
          onSelectCuisine={setSelectedCuisine}
          onLogRecipe={logRecipeAsMeal}
        />
      </ScrollView>

      {/* Natural Language Logger Modal */}
      <NaturalLanguageLoggerModal
        visible={loggerModalVisible}
        initialMealType={activeMealType}
        dateStr={selectedDate}
        onClose={() => setLoggerModalVisible(false)}
        onSaveMeal={logMeal}
      />

      {/* Custom Meal / Recipe Builder Modal */}
      <CustomMealModal
        visible={customMealModalVisible}
        initialMealType={activeMealType}
        onClose={() => setCustomMealModalVisible(false)}
        onSaveRecipe={createCustomRecipe}
        onLogMealNow={logRecipeAsMeal}
      />

      {/* Clarification & Kitchen Scale Adjustment Modal */}
      <ClarificationModal
        visible={selectedEstimateForEdit !== null}
        estimate={selectedEstimateForEdit}
        onClose={() => setSelectedEstimateForEdit(null)}
        onSave={updateEstimate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  dateNavBtn: {
    padding: 6,
  },
  dateCenter: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.md,
  },
  dateText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  bannersRow: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  actionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  bannerIconWrap: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  bannerTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  bannerSub: {
    fontSize: 11,
    marginTop: 1,
  },
  mealsSection: {
    marginBottom: Spacing.lg,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  hydrationCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  hydrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  hydrationTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  hydrationValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  quickWaterChips: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  waterChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
