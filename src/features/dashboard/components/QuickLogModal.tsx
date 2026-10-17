import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { analyzeMeal, analyzeMealAsync } from '@/services/mealParser';
import { MealRepository } from '@/database/repositories/mealRepository';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { useNutritionStore } from '@/stores/useNutritionStore';
import { getTodayDateString } from '@/utils/date';

export type QuickLogType = 'food' | 'weight' | 'workout' | 'activity' | 'water' | 'journal' | null;

interface QuickLogModalProps {
  type: QuickLogType;
  visible: boolean;
  onClose: () => void;
  onSubmitWater: (liters: number) => void;
  onSubmitWeight: (kg: number) => void;
  onNavigateTab: (tabName: string) => void;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  type,
  visible,
  onClose,
  onSubmitWater,
  onSubmitWeight,
  onNavigateTab,
}) => {
  const { colors } = useAppTheme();
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastWaterTap = React.useRef<number>(0);

  if (!visible || !type) return null;

  const handleWaterTap = (liters: number) => {
    const now = Date.now();
    // 350ms debounce guard against accidental physical tap bounce
    if (now - lastWaterTap.current < 350) return;
    lastWaterTap.current = now;
    setInputValue('');
    onSubmitWater(liters);
    onClose();
  };

  const handleSave = async () => {
    if (type === 'water') {
      let val = parseFloat(inputValue);
      if (!isNaN(val) && val > 0) {
        // If user entered milliliters (e.g. 250, 300, 500, 750, 1000), convert to liters
        if (val > 15) {
          val = Math.round((val / 1000) * 100) / 100;
        }
        handleWaterTap(val);
        return;
      }
    } else if (type === 'weight') {
      const val = parseFloat(inputValue);
      if (!isNaN(val) && val > 0) {
        onSubmitWeight(val);
      }
    } else if (type === 'food') {
      if (inputValue.trim()) {
        setIsSubmitting(true);
        try {
          const todayStr = getTodayDateString();
          const parsed = await analyzeMealAsync(inputValue.trim(), 'snack');
          if (parsed.items.length > 0) {
          MealRepository.createMeal(
            {
              date: todayStr,
              meal_type: 'snack',
              raw_text: parsed.rawText,
              total_calories: parsed.totalCalories,
              total_protein: parsed.totalProtein,
              total_carbs: parsed.totalCarbs,
              total_fat: parsed.totalFat,
              confidence: parsed.confidence,
              is_verified_by_user: 1,
            },
            parsed.items.map((it) => ({
              food_name: it.food_name,
              quantity: it.quantity,
              unit: it.unit,
              calories_estimated: it.calories,
              protein_estimated: it.protein,
              carbs_estimated: it.carbs,
              fat_estimated: it.fat,
              confidence_score: it.confidence_score,
              clarification_needed: it.clarification_needed,
            }))
          );
          useDashboardStore.getState().loadDashboard();
            useNutritionStore.getState().loadNutritionData(todayStr);
          }
        } finally {
          setIsSubmitting(false);
        }
      }
    }
    setInputValue('');
    onClose();
  };

  const renderContent = () => {
    switch (type) {
      case 'water': {
        const currentWater = Number(useDashboardStore.getState().todayLog?.water_liters) || 0;
        return (
          <View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Log Water</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
              Current today: {currentWater.toFixed(1)} L ({Math.round(currentWater * 1000)} ml) • Target: 2.5 L
            </Text>

            <View style={styles.quickChipsRow}>
              {[
                { liters: 0.25, label: '+250 ml' },
                { liters: 0.5, label: '+500 ml' },
                { liters: 0.75, label: '+750 ml' },
                { liters: 1.0, label: '+1.0 L' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.liters}
                  style={[styles.chip, { backgroundColor: colors.cardElevated, borderColor: colors.cardBorder }]}
                  onPress={() => handleWaterTap(item.liters)}>
                  <Text style={[styles.chipText, { color: colors.water }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.cardElevated,
                  borderColor: colors.cardBorder,
                  color: colors.text,
                },
              ]}
              placeholder="e.g. 500 ml or 0.5 L"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={inputValue}
              onChangeText={setInputValue}
            />

            <Button title="Add Hydration" onPress={handleSave} style={{ marginTop: Spacing.md }} />
          </View>
        );
      }

      case 'weight':
        return (
          <View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Log Morning Weight</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
              Record your measured weight for trend analysis
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.cardElevated,
                  borderColor: colors.cardBorder,
                  color: colors.text,
                },
              ]}
              placeholder="e.g. 64.2 (kg)"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={inputValue}
              onChangeText={setInputValue}
              autoFocus
            />

            <Button title="Save Weight Entry" onPress={handleSave} style={{ marginTop: Spacing.md }} />
          </View>
        );

      case 'food':
        return (
          <View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Quick Food Log</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
              Type your meal naturally (e.g. "100g paneer with a banana") or open the nutrition tracker.
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.cardElevated,
                  borderColor: colors.cardBorder,
                  color: colors.text,
                },
              ]}
              placeholder="e.g. 2 besan chillas with curd"
              placeholderTextColor={colors.textMuted}
              value={inputValue}
              onChangeText={setInputValue}
              autoFocus
            />

            <Button
              title="Quick Log Meal"
              onPress={handleSave}
              disabled={!inputValue.trim()}
              style={{ marginTop: Spacing.md }}
            />

            <TouchableOpacity
              style={{ marginTop: Spacing.md, alignItems: 'center' }}
              onPress={() => {
                onClose();
                onNavigateTab('nutrition');
              }}>
              <Text style={{ color: colors.protein, fontSize: 13, fontWeight: '600' }}>
                Open Full Nutrition Screen &gt;
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 'workout':
        return (
          <View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Workout Logging</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
              Open today's workout plan to record weights, reps, and track progressive overload.
            </Text>
            <Button
              title="Open Workout Screen"
              onPress={() => {
                onClose();
                onNavigateTab('workout');
              }}
              style={{ marginTop: Spacing.md }}
            />
          </View>
        );

      case 'journal':
        return (
          <View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Daily Journal</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
              Reflect on your energy, mood, hunger, and daily notes.
            </Text>
            <Button
              title="Open Journal Screen"
              onPress={() => {
                onClose();
                onNavigateTab('journal');
              }}
              style={{ marginTop: Spacing.md }}
            />
          </View>
        );

      case 'activity':
      default:
        return (
          <View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Log Activity</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
              Record yoga, swimming, walking, running, or cycling.
            </Text>
            <Button
              title="View Activities"
              onPress={() => {
                onClose();
                onNavigateTab('workout');
              }}
              style={{ marginTop: Spacing.md }}
            />
          </View>
        );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: Spacing.sm }}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </TouchableOpacity>
            {renderContent()}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '88%',
    overflow: 'hidden',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    padding: 6,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  quickChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  chip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    width: '100%',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: 15,
  },
});
