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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { analyzeMeal, MealAnalysisResult, ParsedItemResult } from '@/services/mealParser';
import { CreateMealInput, CreateEstimateInput } from '@/database/repositories/mealRepository';

interface NaturalLanguageLoggerModalProps {
  visible: boolean;
  initialMealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  dateStr: string;
  onClose: () => void;
  onSaveMeal: (mealData: CreateMealInput, items: CreateEstimateInput[]) => void;
}

export const NaturalLanguageLoggerModal: React.FC<NaturalLanguageLoggerModalProps> = ({
  visible,
  initialMealType = 'lunch',
  dateStr,
  onClose,
  onSaveMeal,
}) => {
  const { colors, isDark } = useAppTheme();
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>(
    initialMealType
  );
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<MealAnalysisResult | null>(null);

  // Sync initial meal type when modal opens
  React.useEffect(() => {
    if (visible) {
      setMealType(initialMealType);
      setInputText('');
      setAnalysisResult(null);
    }
  }, [visible, initialMealType]);

  const quickPrompts = [
    '2 besan chillas with 100g paneer, 1 cup curd and 1 banana',
    '1 cup rajma masala with 1 cup basmati rice and 1 roti',
    'Greek yogurt 150g with 1 cup steamed edamame',
    '150g pan-seared firm tofu with 1 cup whole wheat pasta',
    '3 baked falafels with 2 tbsp hummus and 1 whole wheat pita',
    '100g soy chunks with 1 cup curd and 2 rotis',
  ];

  const handleAnalyze = () => {
    if (!inputText.trim()) return;
    const result = analyzeMeal(inputText.trim(), mealType);
    setAnalysisResult(result);
  };

  const handleAdjustItemQty = (index: number, delta: number) => {
    if (!analysisResult) return;
    const items = [...analysisResult.items];
    const target = items[index];
    const newQty = Math.max(0.1, Math.round((target.quantity + delta) * 10) / 10);
    const ratio = newQty / target.quantity;

    items[index] = {
      ...target,
      quantity: newQty,
      calories: Math.round(target.calories * ratio),
      protein: Math.round(target.protein * ratio * 10) / 10,
      carbs: Math.round(target.carbs * ratio * 10) / 10,
      fat: Math.round(target.fat * ratio * 10) / 10,
      confidence_score: 'high', // Marked as user verified/adjusted
      clarification_needed: 0,
    };

    const totalCalories = Math.round(items.reduce((sum, it) => sum + it.calories, 0));
    const totalProtein = Math.round(items.reduce((sum, it) => sum + it.protein, 0) * 10) / 10;
    const totalCarbs = Math.round(items.reduce((sum, it) => sum + it.carbs, 0) * 10) / 10;
    const totalFat = Math.round(items.reduce((sum, it) => sum + it.fat, 0) * 10) / 10;

    setAnalysisResult({
      ...analysisResult,
      items,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
    });
  };

  const handleConfirmAndSave = () => {
    if (!analysisResult || analysisResult.items.length === 0) return;

    const mealData: CreateMealInput = {
      date: dateStr,
      meal_type: mealType,
      raw_text: analysisResult.rawText,
      total_calories: analysisResult.totalCalories,
      total_protein: analysisResult.totalProtein,
      total_carbs: analysisResult.totalCarbs,
      total_fat: analysisResult.totalFat,
      confidence: analysisResult.confidence,
      is_verified_by_user: 1,
    };

    const items: CreateEstimateInput[] = analysisResult.items.map((it) => ({
      food_name: it.food_name,
      quantity: it.quantity,
      unit: it.unit,
      calories_estimated: it.calories,
      protein_estimated: it.protein,
      carbs_estimated: it.carbs,
      fat_estimated: it.fat,
      confidence_score: it.confidence_score,
      clarification_needed: it.clarification_needed,
    }));

    onSaveMeal(mealData, items);
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
            <View>
              <Text style={[styles.title, { color: colors.text }]}>
                Natural Language Food Logger
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Describe your meal naturally. AI parses portions & macros.
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}>
            {/* Meal Type Segmented Tabs */}
            <View
              style={[
                styles.mealTypeTabs,
                { backgroundColor: colors.cardElevated, borderColor: colors.cardBorder },
              ]}>
              {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => {
                const isSelected = mealType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.mealTab,
                      isSelected && {
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder,
                      },
                    ]}
                    onPress={() => {
                      setMealType(type);
                      if (analysisResult) {
                        setAnalysisResult({ ...analysisResult, mealType: type });
                      }
                    }}>
                    <Text
                      style={[
                        styles.mealTabText,
                        {
                          color: isSelected ? colors.text : colors.textMuted,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Input Area */}
            <View style={styles.inputSection}>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: colors.cardElevated,
                    borderColor: colors.cardBorder,
                    color: colors.text,
                  },
                ]}
                placeholder="e.g. 2 besan chillas with 100g paneer, 1 cup curd and 1 banana"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                value={inputText}
                onChangeText={(txt) => {
                  setInputText(txt);
                  if (analysisResult) setAnalysisResult(null);
                }}
              />

              <View style={styles.inputActionRow}>
                <Text style={[styles.inputHint, { color: colors.textMuted }]}>
                  Jay's profile: Vegetarian • No Eggs • No Mushrooms
                </Text>
                <Button
                  title="Analyze"
                  onPress={handleAnalyze}
                  style={styles.analyzeBtn}
                  disabled={!inputText.trim()}
                />
              </View>
            </View>

            {/* Quick Inspiration Prompts */}
            {!analysisResult && (
              <View style={styles.promptsSection}>
                <Text style={[styles.promptsHeader, { color: colors.textMuted }]}>
                  QUICK STAPLE COMBOS
                </Text>
                <View style={styles.chipsWrap}>
                  {quickPrompts.map((prompt, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: colors.cardElevated,
                          borderColor: colors.cardBorder,
                        },
                      ]}
                      onPress={() => {
                        setInputText(prompt);
                        const result = analyzeMeal(prompt, mealType);
                        setAnalysisResult(result);
                      }}>
                      <Ionicons
                        name="restaurant-outline"
                        size={12}
                        color={colors.protein}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[styles.chipText, { color: colors.textSecondary }]}>
                        {prompt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Analysis Results Display */}
            {analysisResult && (
              <View style={styles.resultSection}>
                {/* Warnings Alert */}
                {analysisResult.warnings.length > 0 && (
                  <View
                    style={[
                      styles.alertBox,
                      {
                        backgroundColor: isDark
                          ? 'rgba(239, 68, 68, 0.16)'
                          : 'rgba(220, 38, 38, 0.12)',
                        borderColor: colors.statusAlert,
                      },
                    ]}>
                    {analysisResult.warnings.map((w, idx) => (
                      <Text key={idx} style={[styles.alertText, { color: colors.statusAlert }]}>
                        {w}
                      </Text>
                    ))}
                  </View>
                )}

                {/* Macro Summary Strip */}
                <View
                  style={[
                    styles.macroStrip,
                    {
                      backgroundColor: isDark
                        ? 'rgba(56, 189, 248, 0.10)'
                        : 'rgba(2, 132, 199, 0.08)',
                      borderColor: colors.protein,
                    },
                  ]}>
                  <View style={styles.macroStripCol}>
                    <Text style={[styles.stripSub, { color: colors.textMuted }]}>CALORIES</Text>
                    <Text style={[styles.stripVal, { color: colors.calories }]}>
                      {analysisResult.totalCalories} kcal
                    </Text>
                  </View>
                  <View style={styles.macroStripCol}>
                    <Text style={[styles.stripSub, { color: colors.textMuted }]}>PROTEIN</Text>
                    <Text style={[styles.stripVal, { color: colors.protein }]}>
                      {analysisResult.totalProtein}g
                    </Text>
                  </View>
                  <View style={styles.macroStripCol}>
                    <Text style={[styles.stripSub, { color: colors.textMuted }]}>CARBS</Text>
                    <Text style={[styles.stripVal, { color: colors.text }]}>
                      {analysisResult.totalCarbs}g
                    </Text>
                  </View>
                  <View style={styles.macroStripCol}>
                    <Text style={[styles.stripSub, { color: colors.textMuted }]}>FAT</Text>
                    <Text style={[styles.stripVal, { color: colors.text }]}>
                      {analysisResult.totalFat}g
                    </Text>
                  </View>
                </View>

                {/* Parsed Items List */}
                <Text style={[styles.itemsHeader, { color: colors.textMuted }]}>
                  DETECTED FOOD ITEMS ({analysisResult.items.length})
                </Text>

                <View style={styles.itemsContainer}>
                  {analysisResult.items.map((item, idx) => {
                    const isHigh = item.confidence_score === 'high';
                    return (
                      <View
                        key={item.id}
                        style={[
                          styles.parsedItemCard,
                          {
                            backgroundColor: colors.cardElevated,
                            borderColor: colors.cardBorder,
                          },
                        ]}>
                        <View style={styles.itemCardHeader}>
                          <Text style={[styles.parsedName, { color: colors.text }]}>
                            {item.food_name}
                          </Text>
                          <View
                            style={[
                              styles.confPill,
                              {
                                backgroundColor: isHigh
                                  ? 'rgba(34, 197, 94, 0.16)'
                                  : 'rgba(245, 158, 11, 0.16)',
                              },
                            ]}>
                            <Text
                              style={[
                                styles.confText,
                                { color: isHigh ? colors.statusOnTrack : colors.statusAttention },
                              ]}>
                              {item.confidence_score.toUpperCase()}
                            </Text>
                          </View>
                        </View>

                        {/* Quantity Adjuster */}
                        <View style={styles.qtyRow}>
                          <Text style={[styles.qtyLabel, { color: colors.textSecondary }]}>
                            Portion:
                          </Text>
                          <View style={styles.stepperWrap}>
                            <TouchableOpacity
                              style={[
                                styles.stepBtn,
                                {
                                  backgroundColor: colors.card,
                                  borderColor: colors.cardBorder,
                                },
                              ]}
                              onPress={() => handleAdjustItemQty(idx, item.unit === 'g' ? -25 : -0.5)}>
                              <Ionicons name="remove" size={14} color={colors.text} />
                            </TouchableOpacity>
                            <Text style={[styles.qtyDisplay, { color: colors.text }]}>
                              {item.quantity} {item.unit}
                            </Text>
                            <TouchableOpacity
                              style={[
                                styles.stepBtn,
                                {
                                  backgroundColor: colors.card,
                                  borderColor: colors.cardBorder,
                                },
                              ]}
                              onPress={() => handleAdjustItemQty(idx, item.unit === 'g' ? +25 : +0.5)}>
                              <Ionicons name="add" size={14} color={colors.text} />
                            </TouchableOpacity>
                          </View>
                        </View>

                        <Text style={[styles.parsedMacros, { color: colors.textMuted }]}>
                          {item.calories} kcal • {item.protein}g Protein • {item.carbs}g Carbs •{' '}
                          {item.fat}g Fat
                        </Text>

                        {item.clarification_reason && (
                          <Text style={[styles.clarifyReason, { color: colors.statusAttention }]}>
                            {item.clarification_reason}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>

                {/* Confirm Action Button */}
                <Button
                  title={`Confirm & Log ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`}
                  onPress={handleConfirmAndSave}
                  style={{ marginTop: Spacing.md }}
                />
              </View>
            )}
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
  },
  sheetContainer: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    height: '88%',
    maxHeight: '88%',
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12.5,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 60,
  },
  mealTypeTabs: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: 3,
    marginBottom: Spacing.md,
  },
  mealTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  mealTabText: {
    fontSize: 12.5,
  },
  inputSection: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  textArea: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    fontSize: 14.5,
    minHeight: 75,
    textAlignVertical: 'top',
  },
  inputActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputHint: {
    fontSize: 11,
    flex: 1,
    marginRight: Spacing.md,
  },
  analyzeBtn: {
    minWidth: 95,
  },
  promptsSection: {
    marginTop: Spacing.xs,
  },
  promptsHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: Spacing.sm,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 4,
  },
  chipText: {
    fontSize: 12,
  },
  resultSection: {
    marginTop: Spacing.sm,
  },
  alertBox: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  alertText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  macroStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  macroStripCol: {
    alignItems: 'center',
  },
  stripSub: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  stripVal: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  itemsHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: Spacing.sm,
  },
  itemsContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  parsedItemCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
  },
  itemCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  parsedName: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  confPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  confText: {
    fontSize: 9,
    fontWeight: '700',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: Spacing.xs,
  },
  qtyLabel: {
    fontSize: 12,
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBtn: {
    width: 26,
    height: 26,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyDisplay: {
    fontSize: 13,
    fontWeight: '700',
    minWidth: 60,
    textAlign: 'center',
  },
  parsedMacros: {
    fontSize: 12,
    marginTop: 2,
  },
  clarifyReason: {
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
