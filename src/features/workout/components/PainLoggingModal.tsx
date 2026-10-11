/**
 * Sthira — Standalone Pain & Joint Fatigue Logging Modal
 * Allows logging aches, tightness, or joint discomfort anytime to inform coach deloads.
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useWorkoutStore } from '@/stores/useWorkoutStore';

export const PainLoggingModal: React.FC = () => {
  const { colors, isDark } = useAppTheme();
  const isOpen = useWorkoutStore((s) => s.isPainModalOpen);
  const close = useWorkoutStore((s) => s.closePainModal);
  const logPain = useWorkoutStore((s) => s.logPain);

  const [bodyArea, setBodyArea] = useState('Shoulder');
  const [painLevel, setPainLevel] = useState(3);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const painAreas = [
    'Shoulder',
    'Elbow',
    'Wrist',
    'Lower Back',
    'Knee',
    'Hip',
    'Neck',
    'Ankle',
  ];

  const handleSave = () => {
    logPain(bodyArea, painLevel, notes.trim() || undefined);
    setNotes('');
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={close}>
      <SafeAreaView style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]}>Log Joint / Muscle Pain</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Informs progressive overload to prevent injuries
              </Text>
            </View>
            <TouchableOpacity onPress={close} style={[styles.closeBtn, { backgroundColor: colors.cardBorder }]}>
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Body Area Selector */}
            <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
              SELECT AFFECTED AREA
            </Text>
            <View style={styles.areasGrid}>
              {painAreas.map((area) => {
                const isSelected = bodyArea === area;
                return (
                  <TouchableOpacity
                    key={area}
                    style={[
                      styles.areaCard,
                      {
                        backgroundColor: isSelected
                          ? colors.statusAttention
                          : isDark
                          ? 'rgba(255,255,255,0.03)'
                          : '#F8FAFC',
                        borderColor: isSelected ? colors.statusAttention : colors.cardBorder,
                      },
                    ]}
                    onPress={() => setBodyArea(area)}>
                    <Text
                      style={[
                        styles.areaCardText,
                        {
                          color: isSelected ? '#FFFFFF' : colors.text,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}>
                      {area}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Pain Scale */}
            <View style={styles.section}>
              <View style={styles.levelHeader}>
                <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
                  DISCOMFORT LEVEL
                </Text>
                <Text style={[styles.levelHighlight, { color: colors.statusAttention }]}>
                  {painLevel} / 10
                </Text>
              </View>

              <View style={styles.numbersRow}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const isSelected = painLevel === num;
                  return (
                    <TouchableOpacity
                      key={num}
                      style={[
                        styles.numBtn,
                        {
                          backgroundColor: isSelected
                            ? colors.statusAttention
                            : isDark
                            ? 'rgba(255,255,255,0.04)'
                            : '#F1F5F9',
                        },
                      ]}
                      onPress={() => setPainLevel(num)}>
                      <Text
                        style={[
                          styles.numText,
                          {
                            color: isSelected ? '#FFFFFF' : colors.text,
                            fontWeight: isSelected ? '800' : '600',
                          },
                        ]}>
                        {num}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={[styles.scaleGuide, { color: colors.textMuted }]}>
                1 = Minimal tightness • 5 = Mild pain on load • 10 = Severe acute pain
              </Text>
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
                CONTEXT & NOTES (OPTIONAL)
              </Text>
              <TextInput
                style={[
                  styles.notesInput,
                  {
                    color: colors.text,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                    borderColor: colors.cardBorder,
                  },
                ]}
                placeholder="Stiffness started after last bench press..."
                placeholderTextColor={colors.textMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
              />
            </View>
          </ScrollView>

          {/* Footer Save */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.statusAttention }]}
              onPress={handleSave}>
              <Text style={styles.saveBtnText}>Record Discomfort</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: Spacing.lg,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  areasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  areaCard: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  areaCardText: {
    fontSize: 13,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  levelHighlight: {
    fontSize: 14,
    fontWeight: '800',
  },
  numbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  numBtn: {
    width: 30,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: {
    fontSize: 12,
  },
  scaleGuide: {
    fontSize: 11,
    marginTop: 6,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 13,
    minHeight: 50,
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  saveBtn: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
