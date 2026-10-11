import React, { useState, useEffect } from 'react';
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
import { Spacing, BorderRadius } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { NutritionEstimate } from '@/types/database';

interface ClarificationModalProps {
  visible: boolean;
  estimate: NutritionEstimate | null;
  onClose: () => void;
  onSave: (estimateId: string, updates: Partial<NutritionEstimate>) => void;
}

export const ClarificationModal: React.FC<ClarificationModalProps> = ({
  visible,
  estimate,
  onClose,
  onSave,
}) => {
  const { colors, isDark } = useAppTheme();

  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  useEffect(() => {
    if (estimate) {
      setQuantity(estimate.quantity.toString());
      setUnit(estimate.unit);
      setCalories(Math.round(estimate.calories_estimated).toString());
      setProtein(estimate.protein_estimated.toString());
      setCarbs(estimate.carbs_estimated.toString());
      setFat(estimate.fat_estimated.toString());
    }
  }, [estimate]);

  if (!visible || !estimate) return null;

  const handleQuantityChange = (newQtyStr: string) => {
    setQuantity(newQtyStr);
    const newQty = parseFloat(newQtyStr);
    if (!isNaN(newQty) && newQty > 0 && estimate.quantity > 0) {
      const ratio = newQty / estimate.quantity;
      setCalories(Math.round(estimate.calories_estimated * ratio).toString());
      setProtein((Math.round(estimate.protein_estimated * ratio * 10) / 10).toString());
      setCarbs((Math.round(estimate.carbs_estimated * ratio * 10) / 10).toString());
      setFat((Math.round(estimate.fat_estimated * ratio * 10) / 10).toString());
    }
  };

  const handleSave = () => {
    const q = parseFloat(quantity) || estimate.quantity;
    const c = parseFloat(calories) || estimate.calories_estimated;
    const p = parseFloat(protein) || estimate.protein_estimated;
    const cb = parseFloat(carbs) || estimate.carbs_estimated;
    const f = parseFloat(fat) || estimate.fat_estimated;

    onSave(estimate.id, {
      quantity: q,
      unit: unit.trim() || estimate.unit,
      calories_estimated: c,
      protein_estimated: p,
      carbs_estimated: cb,
      fat_estimated: f,
      confidence_score: 'high', // User has manually verified/adjusted
      clarification_needed: 0,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>
                Adjust Food Measurement
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                {estimate.food_name}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Principle Reminder */}
          <View
            style={[
              styles.noticeCard,
              {
                backgroundColor: isDark
                  ? 'rgba(56, 189, 248, 0.10)'
                  : 'rgba(2, 132, 199, 0.08)',
                borderColor: colors.protein,
              },
            ]}>
            <Ionicons name="scale-outline" size={16} color={colors.protein} />
            <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
              Enter exact kitchen scale grams or adjusted portion. Macros will scale automatically.
            </Text>
          </View>

          <View style={styles.formGrid}>
            {/* Quantity & Unit Row */}
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>PORTION / QTY</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.cardElevated,
                      borderColor: colors.cardBorder,
                      color: colors.text,
                    },
                  ]}
                  value={quantity}
                  onChangeText={handleQuantityChange}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.col}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>UNIT</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.cardElevated,
                      borderColor: colors.cardBorder,
                      color: colors.text,
                    },
                  ]}
                  value={unit}
                  onChangeText={setUnit}
                />
              </View>
            </View>

            {/* Calories & Protein Row */}
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>CALORIES (KCAL)</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.cardElevated,
                      borderColor: colors.cardBorder,
                      color: colors.calories,
                      fontWeight: '700',
                    },
                  ]}
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.col}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>PROTEIN (G)</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.cardElevated,
                      borderColor: colors.cardBorder,
                      color: colors.protein,
                      fontWeight: '700',
                    },
                  ]}
                  value={protein}
                  onChangeText={setProtein}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Carbs & Fat Row */}
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>CARBS (G)</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.cardElevated,
                      borderColor: colors.cardBorder,
                      color: colors.text,
                    },
                  ]}
                  value={carbs}
                  onChangeText={setCarbs}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.col}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>FAT (G)</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.cardElevated,
                      borderColor: colors.cardBorder,
                      color: colors.text,
                    },
                  ]}
                  value={fat}
                  onChangeText={setFat}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>

          <Button
            title="Save Verified Measurement"
            onPress={handleSave}
            style={{ marginTop: Spacing.lg }}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  noticeText: {
    fontSize: 11.5,
    flex: 1,
    lineHeight: 16,
  },
  formGrid: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  col: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 14,
  },
});
