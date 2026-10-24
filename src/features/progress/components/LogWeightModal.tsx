import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { getTodayDateString } from '@/utils/date';

interface LogWeightModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (weightKg: number, dateStr?: string, notes?: string) => Promise<void>;
  currentWeight: number;
}

export const LogWeightModal: React.FC<LogWeightModalProps> = ({
  visible,
  onClose,
  onSave,
  currentWeight,
}) => {
  const { colors, isDark } = useAppTheme();
  const [weightStr, setWeightStr] = useState<string>((currentWeight ?? 65.8).toFixed(1));
  const [notes, setNotes] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>(getTodayDateString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedWeight = parseFloat(weightStr) || (currentWeight ?? 65.8);

  const handleAdjust = (delta: number) => {
    const current = parseFloat(weightStr) || (currentWeight ?? 65.8);
    const next = Math.max(30, Math.min(200, current + delta));
    setWeightStr(next.toFixed(1));
  };

  const handleSave = async () => {
    const weightNum = parseFloat(weightStr.replace(',', '.'));
    if (isNaN(weightNum) || weightNum <= 0) return;

    try {
      setIsSubmitting(true);
      await onSave(weightNum, dateStr, notes.trim() || undefined);
      onClose();
    } catch (e) {
      console.error('Failed to save weight entry:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.backdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoid}>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}>
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={[styles.title, { color: colors.text }]}>
                    Log Scale Weight
                  </Text>
                  <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                    Morning fasted weigh-in gives purest signal
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close" size={22} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Weight Display Card */}
              <View
                style={[
                  styles.weightDisplayCard,
                  {
                    backgroundColor: colors.cardElevated,
                    borderColor: colors.cardBorder,
                  },
                ]}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[
                      styles.weightInput,
                      { color: colors.text },
                    ]}
                    value={weightStr}
                    onChangeText={setWeightStr}
                    keyboardType="decimal-pad"
                    selectTextOnFocus
                    maxLength={5}
                  />
                  <Text style={[styles.inputUnit, { color: colors.textMuted }]}>
                    kg
                  </Text>
                </View>
              </View>

              {/* Stepper Buttons Row (Equal 4-button bar, zero cut-off) */}
              <View style={styles.stepperBar}>
                <TouchableOpacity
                  style={[
                    styles.stepBtn,
                    {
                      backgroundColor: colors.cardElevated,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                  onPress={() => handleAdjust(-0.5)}
                  activeOpacity={0.7}>
                  <Text style={[styles.stepBtnText, { color: colors.text }]}>
                    -0.5
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.stepBtn,
                    {
                      backgroundColor: colors.cardElevated,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                  onPress={() => handleAdjust(-0.1)}
                  activeOpacity={0.7}>
                  <Text style={[styles.stepBtnText, { color: colors.text }]}>
                    -0.1
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.stepBtn,
                    {
                      backgroundColor: colors.cardElevated,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                  onPress={() => handleAdjust(0.1)}
                  activeOpacity={0.7}>
                  <Text style={[styles.stepBtnText, { color: colors.text }]}>
                    +0.1
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.stepBtn,
                    {
                      backgroundColor: colors.cardElevated,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                  onPress={() => handleAdjust(0.5)}
                  activeOpacity={0.7}>
                  <Text style={[styles.stepBtnText, { color: colors.text }]}>
                    +0.5
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Date & Note Inputs */}
              <View style={styles.fields}>
                <View style={styles.fieldRow}>
                  <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
                    Date:
                  </Text>
                  <TextInput
                    style={[
                      styles.dateInput,
                      {
                        color: colors.text,
                        backgroundColor: colors.cardElevated,
                        borderColor: colors.cardBorder,
                      },
                    ]}
                    value={dateStr}
                    onChangeText={setDateStr}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>

                <View style={styles.notesGroup}>
                  <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
                    Notes (Optional):
                  </Text>
                  <TextInput
                    style={[
                      styles.notesInput,
                      {
                        color: colors.text,
                        backgroundColor: colors.cardElevated,
                        borderColor: colors.cardBorder,
                      },
                    ]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="e.g. Fasted morning weigh-in, post-sushi sodium retention"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[
                    styles.cancelBtn,
                    {
                      backgroundColor: colors.cardElevated,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                  onPress={onClose}>
                  <Text style={[styles.cancelBtnText, { color: colors.text }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.saveBtn,
                    { backgroundColor: colors.accent },
                    isSubmitting && { opacity: 0.6 },
                  ]}
                  onPress={handleSave}
                  disabled={isSubmitting}
                  activeOpacity={0.8}>
                  <Text style={styles.saveBtnText}>
                    {isSubmitting ? 'Saving...' : 'Save Weigh-In'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  keyboardAvoid: {
    width: '100%',
    maxWidth: 420,
  },
  modalCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 2,
  },
  weightDisplayCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  stepperBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  stepBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  weightInput: {
    fontSize: 38,
    fontWeight: '800',
    textAlign: 'center',
    minWidth: 100,
    padding: 0,
  },
  inputUnit: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  fields: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateInput: {
    flex: 1,
    marginLeft: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    fontSize: 13,
  },
  notesGroup: {
    marginTop: 4,
  },
  notesInput: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
