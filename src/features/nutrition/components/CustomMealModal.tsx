import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { CuisineRecipe } from '@/types/database';

export interface IngredientItem {
  id: string;
  name: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface CustomMealModalProps {
  visible: boolean;
  initialMealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  onClose: () => void;
  onSaveRecipe: (recipeData: {
    title: string;
    description?: string;
    estimated_calories: number;
    estimated_protein: number;
    estimated_carbs: number;
    estimated_fat: number;
    ingredients: { item: string; amount: string; calories?: number; protein?: number }[];
    instructions?: string;
  }) => CuisineRecipe;
  onLogMealNow: (
    recipe: CuisineRecipe,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  ) => void;
}

const INGREDIENT_PRESETS = [
  { name: 'Rolled Oats', amount: '50g', calories: 190, protein: 7.0, carbs: 34.0, fat: 3.0 },
  { name: 'Whey Protein', amount: '1 scoop (30g)', calories: 120, protein: 24.0, carbs: 2.0, fat: 1.5 },
  { name: 'Milk (Cow/Toned)', amount: '200ml', calories: 125, protein: 6.5, carbs: 9.5, fat: 6.0 },
  { name: 'Peanut Butter', amount: '1 tbsp (16g)', calories: 95, protein: 4.0, carbs: 3.0, fat: 8.0 },
  { name: 'Paneer (Raw/Low Fat)', amount: '100g', calories: 265, protein: 18.3, carbs: 3.5, fat: 20.0 },
  { name: 'Roti / Chapati', amount: '1 piece (40g)', calories: 105, protein: 3.2, carbs: 20.0, fat: 1.0 },
  { name: 'Yellow Dal Tadka', amount: '1 katori (180g)', calories: 180, protein: 9.5, carbs: 26.0, fat: 4.0 },
  { name: 'Curd / Plain Dahi', amount: '1 cup (150g)', calories: 100, protein: 5.5, carbs: 7.0, fat: 5.0 },
  { name: 'Basmati Rice (Cooked)', amount: '1 cup (160g)', calories: 210, protein: 4.3, carbs: 45.0, fat: 0.5 },
  { name: 'Banana', amount: '1 medium', calories: 105, protein: 1.3, carbs: 27.0, fat: 0.3 },
  { name: 'Almonds & Nuts', amount: '10 pieces', calories: 70, protein: 2.5, carbs: 2.5, fat: 6.0 },
  { name: 'Pure Desi Ghee', amount: '1 tsp (5g)', calories: 45, protein: 0.0, carbs: 0.0, fat: 5.0 },
  { name: 'Chia Seeds', amount: '1 tbsp (12g)', calories: 60, protein: 2.0, carbs: 5.0, fat: 4.0 },
  { name: 'Whole Wheat Toast', amount: '2 slices', calories: 150, protein: 7.0, carbs: 28.0, fat: 2.0 },
];

export const CustomMealModal: React.FC<CustomMealModalProps> = ({
  visible,
  initialMealType = 'lunch',
  onClose,
  onSaveRecipe,
  onLogMealNow,
}) => {
  const { colors, isDark } = useAppTheme();

  const [mealTitle, setMealTitle] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>(
    initialMealType
  );
  const [ingredients, setIngredients] = useState<IngredientItem[]>([
    {
      id: 'ing_1',
      name: 'Rolled Oats',
      amount: '50g',
      calories: 190,
      protein: 7.0,
      carbs: 34.0,
      fat: 3.0,
    },
    {
      id: 'ing_2',
      name: 'Whey Protein',
      amount: '1 scoop (30g)',
      calories: 120,
      protein: 24.0,
      carbs: 2.0,
      fat: 1.5,
    },
  ]);

  // Form for adding custom ingredient
  const [customName, setCustomName] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [customCal, setCustomCal] = useState('');
  const [customPro, setCustomPro] = useState('');
  const [showAddCustomRow, setShowAddCustomRow] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setMealType(initialMealType);
    }
  }, [visible, initialMealType]);

  const totalCalories = Math.round(ingredients.reduce((sum, it) => sum + it.calories, 0));
  const totalProtein = Math.round(ingredients.reduce((sum, it) => sum + it.protein, 0) * 10) / 10;
  const totalCarbs = Math.round(ingredients.reduce((sum, it) => sum + it.carbs, 0) * 10) / 10;
  const totalFat = Math.round(ingredients.reduce((sum, it) => sum + it.fat, 0) * 10) / 10;

  const handleAddPreset = (preset: (typeof INGREDIENT_PRESETS)[0]) => {
    const newItem: IngredientItem = {
      id: `ing_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: preset.name,
      amount: preset.amount,
      calories: preset.calories,
      protein: preset.protein,
      carbs: preset.carbs,
      fat: preset.fat,
    };
    setIngredients([...ingredients, newItem]);
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(ingredients.filter((it) => it.id !== id));
  };

  const handleAddCustomManual = () => {
    if (!customName.trim()) return;
    const cal = parseFloat(customCal) || 0;
    const pro = parseFloat(customPro) || 0;
    // Estimate carbs and fat if not provided
    const carbs = Math.max(0, Math.round(((cal - pro * 4) / 4) * 0.6 * 10) / 10);
    const fat = Math.max(0, Math.round(((cal - pro * 4 - carbs * 4) / 9) * 10) / 10);

    const newItem: IngredientItem = {
      id: `ing_${Date.now()}_custom`,
      name: customName.trim(),
      amount: customAmount.trim() || '1 serving',
      calories: cal,
      protein: pro,
      carbs,
      fat,
    };

    setIngredients([...ingredients, newItem]);
    setCustomName('');
    setCustomAmount('');
    setCustomCal('');
    setCustomPro('');
    setShowAddCustomRow(false);
  };

  const validateAndBuildRecipe = () => {
    if (!mealTitle.trim()) {
      Alert.alert('Meal Name Required', 'Please enter a name for your custom meal (e.g. "Power Oatmeal Shake")');
      return null;
    }
    if (ingredients.length === 0) {
      Alert.alert('No Ingredients', 'Please add at least one ingredient to your custom meal.');
      return null;
    }

    return {
      title: mealTitle.trim(),
      description: ingredients.map((i) => `${i.amount} ${i.name}`).join(' • '),
      estimated_calories: totalCalories,
      estimated_protein: totalProtein,
      estimated_carbs: totalCarbs,
      estimated_fat: totalFat,
      ingredients: ingredients.map((i) => ({
        item: i.name,
        amount: i.amount,
        calories: i.calories,
        protein: i.protein,
      })),
      instructions: 'Custom prepared meal recipe.',
    };
  };

  const handleSaveOnly = () => {
    const data = validateAndBuildRecipe();
    if (!data) return;
    onSaveRecipe(data);
    onClose();
  };

  const handleSaveAndLog = () => {
    const data = validateAndBuildRecipe();
    if (!data) return;
    const createdRecipe = onSaveRecipe(data);
    onLogMealNow(createdRecipe, mealType);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View
          style={[
            styles.sheetContainer,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]}>Custom Meal & Recipe Builder</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Add ingredients with exact amounts. Auto-tracks macros for 1-tap future logging.
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}>
            {/* Meal Title & Meal Slot Row */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>MEAL NAME</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.cardElevated,
                    borderColor: colors.cardBorder,
                    color: colors.text,
                  },
                ]}
                placeholder="e.g. Jay's Power Oatmeal Shake"
                placeholderTextColor={colors.textMuted}
                value={mealTitle}
                onChangeText={setMealTitle}
              />
            </View>

            {/* Meal Slot Selector */}
            <View style={styles.mealTypeTabs}>
              {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => {
                const isSelected = mealType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.mealTab,
                      isSelected && {
                        backgroundColor: colors.accent,
                      },
                    ]}
                    onPress={() => setMealType(type)}>
                    <Text
                      style={[
                        styles.mealTabText,
                        {
                          color: isSelected ? '#FFFFFF' : colors.textMuted,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Total Macros Live Banner */}
            <View
              style={[
                styles.totalMacroCard,
                {
                  backgroundColor: isDark
                    ? 'rgba(16, 185, 129, 0.10)'
                    : 'rgba(16, 185, 129, 0.06)',
                  borderColor: colors.accent,
                },
              ]}>
              <View style={styles.macroCol}>
                <Text style={[styles.macroLabel, { color: colors.textMuted }]}>CALORIES</Text>
                <Text style={[styles.macroValue, { color: colors.calories }]}>
                  {totalCalories} <Text style={styles.macroUnit}>kcal</Text>
                </Text>
              </View>
              <View style={styles.macroDivider} />
              <View style={styles.macroCol}>
                <Text style={[styles.macroLabel, { color: colors.textMuted }]}>PROTEIN</Text>
                <Text style={[styles.macroValue, { color: colors.protein }]}>
                  {totalProtein} <Text style={styles.macroUnit}>g</Text>
                </Text>
              </View>
              <View style={styles.macroDivider} />
              <View style={styles.macroCol}>
                <Text style={[styles.macroLabel, { color: colors.textMuted }]}>CARBS</Text>
                <Text style={[styles.macroValue, { color: colors.text }]}>
                  {totalCarbs} <Text style={styles.macroUnit}>g</Text>
                </Text>
              </View>
              <View style={styles.macroDivider} />
              <View style={styles.macroCol}>
                <Text style={[styles.macroLabel, { color: colors.textMuted }]}>FAT</Text>
                <Text style={[styles.macroValue, { color: colors.text }]}>
                  {totalFat} <Text style={styles.macroUnit}>g</Text>
                </Text>
              </View>
            </View>

            {/* Ingredients List */}
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
                INGREDIENTS ({ingredients.length})
              </Text>
              <TouchableOpacity
                style={styles.addCustomLink}
                onPress={() => setShowAddCustomRow(!showAddCustomRow)}>
                <Ionicons
                  name={showAddCustomRow ? 'remove-circle-outline' : 'add-circle-outline'}
                  size={15}
                  color={colors.accent}
                />
                <Text style={[styles.addCustomLinkText, { color: colors.accent }]}>
                  {showAddCustomRow ? 'Hide Custom Input' : 'Type Custom Ingredient'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Manual Custom Ingredient Input Card */}
            {showAddCustomRow && (
              <View
                style={[
                  styles.customRowCard,
                  { backgroundColor: colors.cardElevated, borderColor: colors.cardBorder },
                ]}>
                <Text style={[styles.customRowTitle, { color: colors.text }]}>
                  Add Custom Ingredient
                </Text>
                <View style={{ gap: 8, marginBottom: Spacing.sm }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TextInput
                      style={[styles.smallInput, { flex: 2, color: colors.text, borderColor: colors.cardBorder }]}
                      placeholder="Item (e.g. Soya Chaap)"
                      placeholderTextColor={colors.textMuted}
                      value={customName}
                      onChangeText={setCustomName}
                    />
                    <TextInput
                      style={[styles.smallInput, { flex: 1.2, color: colors.text, borderColor: colors.cardBorder }]}
                      placeholder="Amount (e.g. 100g)"
                      placeholderTextColor={colors.textMuted}
                      value={customAmount}
                      onChangeText={setCustomAmount}
                    />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TextInput
                      style={[styles.smallInput, { flex: 1, color: colors.text, borderColor: colors.cardBorder }]}
                      placeholder="Calories (kcal)"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      value={customCal}
                      onChangeText={setCustomCal}
                    />
                    <TextInput
                      style={[styles.smallInput, { flex: 1, color: colors.text, borderColor: colors.cardBorder }]}
                      placeholder="Protein (g)"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      value={customPro}
                      onChangeText={setCustomPro}
                    />
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.addManualBtn, { backgroundColor: colors.accent }]}
                  onPress={handleAddCustomManual}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  <Text style={styles.addManualBtnText}>Add Ingredient</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Listed Ingredients */}
            {ingredients.map((ing, idx) => (
              <View
                key={ing.id}
                style={[
                  styles.ingItemRow,
                  {
                    backgroundColor: colors.cardElevated,
                    borderColor: colors.cardBorder,
                  },
                ]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.ingName, { color: colors.text }]}>
                    {ing.name} <Text style={{ color: colors.accent }}>({ing.amount})</Text>
                  </Text>
                  <Text style={[styles.ingMacros, { color: colors.textMuted }]}>
                    {ing.calories} kcal • {ing.protein}g Protein • {ing.carbs}g Carbs • {ing.fat}g Fat
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.ingDeleteBtn}
                  onPress={() => handleRemoveIngredient(ing.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            ))}

            {/* Quick Preset Ingredients Tap List */}
            <Text style={[styles.presetHeading, { color: colors.textMuted }]}>
              + TAP TO ADD JAY'S STAPLE INGREDIENTS
            </Text>
            <View style={styles.presetChipsWrap}>
              {INGREDIENT_PRESETS.map((p, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.presetChip,
                    { backgroundColor: colors.cardElevated, borderColor: colors.cardBorder },
                  ]}
                  onPress={() => handleAddPreset(p)}>
                  <Ionicons name="add" size={12} color={colors.accent} />
                  <Text style={[styles.presetChipText, { color: colors.text }]}>
                    {p.name} <Text style={{ color: colors.textMuted }}>({p.amount})</Text>
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Save & Log Buttons */}
            <View style={styles.actionButtonsWrap}>
              <TouchableOpacity
                style={[styles.primaryActionBtn, { backgroundColor: colors.accent }]}
                onPress={handleSaveAndLog}
                activeOpacity={0.85}>
                <Ionicons name="checkmark-circle-outline" size={17} color="#FFFFFF" />
                <Text style={styles.primaryActionBtnText}>Save & Log to Today's Diary</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.secondarySaveBtn,
                  { borderColor: colors.cardBorder, backgroundColor: colors.cardElevated },
                ]}
                onPress={handleSaveOnly}>
                <Ionicons name="bookmark-outline" size={16} color={colors.text} />
                <Text style={[styles.secondarySaveText, { color: colors.text }]}>
                  Save to My Meals (No Logging)
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    position: 'absolute',
  },
  sheetContainer: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    height: '90%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 11.5,
    marginTop: 2,
    lineHeight: 16,
  },
  closeBtn: {
    padding: 6,
    marginLeft: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 80,
  },
  inputGroup: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  textInput: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: 14,
  },
  mealTypeTabs: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.md,
  },
  mealTab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  mealTabText: {
    fontSize: 12,
  },
  totalMacroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.lg,
  },
  macroCol: {
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  macroUnit: {
    fontSize: 10,
    fontWeight: '500',
  },
  macroDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
  },
  sectionHeaderRow: {
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
  addCustomLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addCustomLinkText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  customRowCard: {
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  customRowTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  customRowInputs: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  smallInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 12,
  },
  addManualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  addManualBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  ingItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: 6,
  },
  ingName: {
    fontSize: 13,
    fontWeight: '700',
  },
  ingMacros: {
    fontSize: 11,
    marginTop: 2,
  },
  ingDeleteBtn: {
    padding: 6,
    marginLeft: Spacing.sm,
  },
  presetHeading: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  presetChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.lg,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  presetChipText: {
    fontSize: 11.5,
  },
  actionButtonsWrap: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm + 4,
    borderRadius: BorderRadius.md,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  secondarySaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm + 4,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  secondarySaveText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
