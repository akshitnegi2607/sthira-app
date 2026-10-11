import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';

interface MorningCheckInModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: {
    sleepHours: number;
    energyRating: number;
    moodRating: number;
    sorenessRating: number;
    notes?: string;
  }) => Promise<void>;
  initialSleep?: number | null;
  initialEnergy?: number | null;
  initialMood?: number | null;
  initialSoreness?: number | null;
  initialNotes?: string | null;
}

export const MorningCheckInModal: React.FC<MorningCheckInModalProps> = ({
  visible,
  onClose,
  onSave,
  initialSleep,
  initialEnergy,
  initialMood,
  initialSoreness,
  initialNotes,
}) => {
  const { colors, isDark } = useAppTheme();

  const [sleepHours, setSleepHours] = useState<number>(initialSleep || 7.5);
  const [energy, setEnergy] = useState<number>(initialEnergy || 8);
  const [mood, setMood] = useState<number>(initialMood || 8);
  const [soreness, setSoreness] = useState<number>(initialSoreness || 2);
  const [notes, setNotes] = useState<string>(initialNotes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdjustSleep = (delta: number) => {
    setSleepHours((prev) => Math.max(3, Math.min(14, Math.round((prev + delta) * 10) / 10)));
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      await onSave({
        sleepHours,
        energyRating: energy,
        moodRating: mood,
        sorenessRating: soreness,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (e) {
      console.error('Failed to save morning check-in:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRatingBar = (
    value: number,
    onChange: (val: number) => void,
    activeColor: string,
    minLabel: string,
    maxLabel: string
  ) => {
    return (
      <View style={styles.ratingSection}>
        <View style={styles.ratingBar}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
            const isSelected = value === num;
            return (
              <TouchableOpacity
                key={num}
                onPress={() => onChange(num)}
                style={[
                  styles.ratingBtn,
                  {
                    backgroundColor: isSelected
                      ? activeColor
                      : colors.cardElevated,
                    borderColor: isSelected ? activeColor : colors.cardBorder,
                  },
                ]}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.ratingBtnText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.textMuted,
                      fontWeight: isSelected ? '800' : '500',
                    },
                  ]}>
                  {num}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.ratingSubLabels}>
          <Text style={[styles.subLabel, { color: colors.textMuted }]}>
            {minLabel}
          </Text>
          <Text style={[styles.subLabel, { color: colors.textMuted }]}>
            {maxLabel}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>
                  Morning Readiness Check-In
                </Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  Calibrate your physical state for today's training
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}>
              {/* 1. Sleep Duration */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  1. Sleep Duration (Measured)
                </Text>
                <View style={styles.sleepStepper}>
                  <TouchableOpacity
                    style={[
                      styles.stepperBtn,
                      {
                        backgroundColor: colors.cardElevated,
                        borderColor: colors.cardBorder,
                      },
                    ]}
                    onPress={() => handleAdjustSleep(-0.5)}>
                    <Text style={[styles.stepperBtnText, { color: colors.text }]}>
                      -0.5h
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.sleepDisplay}>
                    <Text style={[styles.sleepNum, { color: colors.text }]}>
                      {sleepHours.toFixed(1)}
                    </Text>
                    <Text style={[styles.sleepUnit, { color: colors.textMuted }]}>
                      hours
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.stepperBtn,
                      {
                        backgroundColor: colors.cardElevated,
                        borderColor: colors.cardBorder,
                      },
                    ]}
                    onPress={() => handleAdjustSleep(0.5)}>
                    <Text style={[styles.stepperBtnText, { color: colors.text }]}>
                      +0.5h
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 2. Energy Rating */}
              <View style={styles.fieldGroup}>
                <View style={styles.labelValueRow}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>
                    2. Energy Level
                  </Text>
                  <Text style={[styles.valBadge, { color: colors.accent }]}>
                    {energy} / 10
                  </Text>
                </View>
                {renderRatingBar(
                  energy,
                  setEnergy,
                  colors.accent,
                  '1 (Drained)',
                  '10 (Peak Vitality)'
                )}
              </View>

              {/* 3. Mood Rating */}
              <View style={styles.fieldGroup}>
                <View style={styles.labelValueRow}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>
                    3. Mood & Focus
                  </Text>
                  <Text style={[styles.valBadge, { color: colors.accent }]}>
                    {mood} / 10
                  </Text>
                </View>
                {renderRatingBar(
                  mood,
                  setMood,
                  colors.accent,
                  '1 (Low / Grumpy)',
                  '10 (Motivated / Calm)'
                )}
              </View>

              {/* 4. Soreness / Joint Stiffness */}
              <View style={styles.fieldGroup}>
                <View style={styles.labelValueRow}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>
                    4. Soreness & Joint Stiffness
                  </Text>
                  <Text
                    style={[
                      styles.valBadge,
                      {
                        color:
                          soreness >= 6
                            ? colors.statusAlert
                            : soreness >= 4
                            ? colors.calories
                            : colors.accent,
                      },
                    ]}>
                    {soreness} / 10
                  </Text>
                </View>
                {renderRatingBar(
                  soreness,
                  setSoreness,
                  soreness >= 6 ? colors.statusAlert : colors.calories,
                  '1 (Fully Fresh)',
                  '10 (Severe DOMS)'
                )}
              </View>

              {/* 5. Reflection Notes */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  5. Morning Thoughts / Daily Intention
                </Text>
                <TextInput
                  style={[
                    styles.textArea,
                    {
                      color: colors.text,
                      backgroundColor: colors.cardElevated,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="e.g. Woke up rested, feeling good for chest press session. Fasted weigh-in done."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            {/* Actions */}
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
                  {isSubmitting ? 'Saving...' : 'Save Readiness'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  keyboardAvoid: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
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
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  scrollContent: {
    paddingBottom: Spacing.md,
  },
  fieldGroup: {
    marginBottom: Spacing.md,
  },
  labelValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  valBadge: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  sleepStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  stepperBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  stepperBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sleepDisplay: {
    alignItems: 'center',
  },
  sleepNum: {
    fontSize: 26,
    fontWeight: '800',
  },
  sleepUnit: {
    fontSize: 11,
    fontWeight: '500',
  },
  ratingSection: {
    marginTop: 2,
  },
  ratingBar: {
    flexDirection: 'row',
    gap: 4,
  },
  ratingBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingBtnText: {
    fontSize: 11,
  },
  ratingSubLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  subLabel: {
    fontSize: 10,
  },
  textArea: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: 13,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
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
