import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { analyzeMeal } from '@/services/mealParser';
import { MealRepository } from '@/database/repositories/mealRepository';
import { useDashboardStore } from '@/stores/useDashboardStore';

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

  if (!visible || !type) return null;

  const handleSave = () => {
    if (type === 'water') {
      const val = parseFloat(inputValue);
      if (!isNaN(val) && val > 0) {
        onSubmitWater(val);
      }
    } else if (type === 'weight') {
      const val = parseFloat(inputValue);
      if (!isNaN(val) && val > 0) {
        onSubmitWeight(val);
      }
    } else if (type === 'food') {
      if (inputValue.trim()) {
        const todayStr = new Date().toISOString().split('T')[0];
        const parsed = analyzeMeal(inputValue.trim(), 'snack');
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
        }
      }
    }
    setInputValue('');
    onClose();
  };

  const renderContent = () => {
    switch (type) {
      case 'water':
        return (
          <View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Log Water</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
              Quick add hydration in liters (e.g. 0.25 L = 1 glass, 0.5 L = 1 bottle)
            </Text>

            <View style={styles.quickChipsRow}>
              {[0.25, 0.5, 0.75, 1.0].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.chip, { backgroundColor: colors.cardElevated, borderColor: colors.cardBorder }]}
                  onPress={() => {
                    onSubmitWater(amt);
                    onClose();
                  }}>
                  <Text style={[styles.chipText, { color: colors.water }]}>+{amt} L</Text>
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
              placeholder="Or enter exact liters (e.g. 0.4)"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={inputValue}
              onChangeText={setInputValue}
            />

            <Button title="Save Hydration" onPress={handleSave} style={{ marginTop: Spacing.md }} />
          </View>
        );

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
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={20} color={colors.textMuted} />
          </TouchableOpacity>
          {renderContent()}
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
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
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
