/**
 * Sthira — Exercise Detail Modal
 * Calm, clean reference sheet for exercise execution, form cues, and common mistakes.
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Exercise } from '@/types/database';

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  onClose: () => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  onClose,
}) => {
  const { colors, isDark } = useAppTheme();

  if (!exercise) return null;

  return (
    <Modal
      visible={!!exercise}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]}>{exercise.name}</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                {exercise.category} • {exercise.equipment}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.cardBorder }]}>
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Quick Metrics */}
            <View style={[styles.metricsRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC' }]}>
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>TARGET SETS</Text>
                <Text style={[styles.metricValue, { color: colors.text }]}>{exercise.target_sets}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>REP RANGE</Text>
                <Text style={[styles.metricValue, { color: colors.text }]}>{exercise.target_rep_range}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>REST</Text>
                <Text style={[styles.metricValue, { color: colors.text }]}>{exercise.rest_seconds}s</Text>
              </View>
            </View>

            {/* Target Muscles */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>MUSCLE GROUPS</Text>
              <Text style={[styles.bodyText, { color: colors.text }]}>
                <Text style={{ fontWeight: '700' }}>Primary: </Text>
                {exercise.primary_muscle}
              </Text>
              {exercise.secondary_muscles ? (
                <Text style={[styles.bodyText, { color: colors.textMuted, marginTop: 4 }]}>
                  <Text style={{ fontWeight: '600' }}>Secondary: </Text>
                  {exercise.secondary_muscles}
                </Text>
              ) : null}
            </View>

            {/* Instructions */}
            {exercise.instructions ? (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>EXECUTION & FORM</Text>
                <Text style={[styles.bodyText, { color: colors.text, lineHeight: 22 }]}>
                  {exercise.instructions}
                </Text>
              </View>
            ) : null}

            {/* Common Mistakes */}
            {exercise.common_mistakes ? (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.statusAttention }]}>COMMON MISTAKES TO AVOID</Text>
                <Text style={[styles.bodyText, { color: colors.text, lineHeight: 22 }]}>
                  {exercise.common_mistakes}
                </Text>
              </View>
            ) : null}

            {/* Substitutions */}
            {exercise.substitutions ? (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>COMMON ALTERNATIVES</Text>
                <Text style={[styles.bodyText, { color: colors.textMuted }]}>
                  {exercise.substitutions}
                </Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: colors.accent }]}
              onPress={onClose}>
              <Text style={styles.doneBtnText}>Got it</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
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
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  bodyText: {
    fontSize: 13,
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  doneBtn: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
