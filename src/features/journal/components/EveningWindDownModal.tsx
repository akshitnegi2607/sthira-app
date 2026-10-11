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
import { extractSentimentAndThemes } from '@/services/journalAnalytics';

interface EveningWindDownModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: {
    hungerRating: number;
    stressRating: number;
    notes: string;
  }) => Promise<void>;
  initialHunger?: number | null;
  initialStress?: number | null;
  initialNotes?: string | null;
}

export const EveningWindDownModal: React.FC<EveningWindDownModalProps> = ({
  visible,
  onClose,
  onSave,
  initialHunger,
  initialStress,
  initialNotes,
}) => {
  const { colors, isDark } = useAppTheme();

  const [hunger, setHunger] = useState<number>(initialHunger || 5);
  const [stress, setStress] = useState<number>(initialStress || 3);
  const [notes, setNotes] = useState<string>(
    initialNotes || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live sentiment & theme extraction preview
  const liveAnalysis = extractSentimentAndThemes(notes);

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      await onSave({
        hungerRating: hunger,
        stressRating: stress,
        notes: notes.trim() || 'Evening reflection completed.',
      });
      onClose();
    } catch (e) {
      console.error('Failed to save evening reflection:', e);
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
                  Evening Wind-Down Reflection
                </Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  Synthesize today's nutrition, stress, and recovery
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
              {/* 1. Hunger Rating */}
              <View style={styles.fieldGroup}>
                <View style={styles.labelValueRow}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>
                    1. Daily Appetite & Satiety
                  </Text>
                  <Text style={[styles.valBadge, { color: colors.calories }]}>
                    {hunger} / 10
                  </Text>
                </View>
                {renderRatingBar(
                  hunger,
                  setHunger,
                  colors.calories,
                  '1 (Full / Stuffed)',
                  '10 (Ravenous / Hungry)'
                )}
              </View>

              {/* 2. Stress Rating */}
              <View style={styles.fieldGroup}>
                <View style={styles.labelValueRow}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>
                    2. Lifestyle & Work Stress
                  </Text>
                  <Text
                    style={[
                      styles.valBadge,
                      {
                        color:
                          stress >= 7
                            ? colors.statusAlert
                            : stress >= 5
                            ? colors.statusAttention
                            : colors.accent,
                      },
                    ]}>
                    {stress} / 10
                  </Text>
                </View>
                {renderRatingBar(
                  stress,
                  setStress,
                  stress >= 7
                    ? colors.statusAlert
                    : stress >= 5
                    ? colors.statusAttention
                    : colors.accent,
                  '1 (Peaceful / Zen)',
                  '10 (High Tension)'
                )}
              </View>

              {/* 3. Reflection Notes */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  3. Day's Reflection & Mindset
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
                  placeholder="e.g. Hit all meals cleanly, pushed hard on Upper Body A. Mild shoulder fatigue but feeling satisfied with progressive overload."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={4}
                />

                {/* Live Sentiment & Theme Tags */}
                {notes.trim().length > 3 ? (
                  <View style={styles.tagsContainer}>
                    <View
                      style={[
                        styles.sentimentPill,
                        {
                          backgroundColor: isDark
                            ? 'rgba(16, 185, 129, 0.15)'
                            : 'rgba(5, 150, 105, 0.1)',
                          borderColor: isDark
                            ? 'rgba(16, 185, 129, 0.3)'
                            : 'rgba(5, 150, 105, 0.2)',
                        },
                      ]}>
                      <Ionicons
                        name="sparkles-outline"
                        size={12}
                        color={colors.accent}
                      />
                      <Text
                        style={[
                          styles.sentimentText,
                          { color: colors.accent },
                        ]}>
                        Sentiment: {liveAnalysis.sentiment}
                      </Text>
                    </View>

                    {liveAnalysis.themes.map((th) => (
                      <View
                        key={th}
                        style={[
                          styles.themePill,
                          {
                            backgroundColor: colors.cardElevated,
                            borderColor: colors.cardBorder,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.themeText,
                            { color: colors.textMuted },
                          ]}>
                          #{th}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}
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
                  {isSubmitting ? 'Saving...' : 'Save Reflection'}
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: Spacing.xs + 2,
  },
  sentimentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  sentimentText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  themePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  themeText: {
    fontSize: 10,
    fontWeight: '600',
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
