/**
 * Sthira — Exercise Stretching & Mobility Modal / Component
 * Interactive guide for Pre-Workout Dynamic Warm-Up and Post-Workout Static Cool-Down
 * tailored specifically for each exercise.
 */

import React, { useState } from 'react';
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
import { getExerciseStretching, ExerciseStretchingInfo } from '@/constants/exerciseStretching';

interface ExerciseStretchingModalProps {
  visible: boolean;
  exercise: Exercise | null;
  initialTab?: 'pre' | 'post';
  onClose: () => void;
}

export const ExerciseStretchingModal: React.FC<ExerciseStretchingModalProps> = ({
  visible,
  exercise,
  initialTab = 'pre',
  onClose,
}) => {
  const { colors, isDark } = useAppTheme();
  const [activeTab, setActiveTab] = useState<'pre' | 'post'>(initialTab);

  if (!visible || !exercise) return null;

  const stretchInfo: ExerciseStretchingInfo = getExerciseStretching(
    exercise.id,
    exercise.name,
    exercise.category,
    exercise.primary_muscle
  );

  const currentProtocol = activeTab === 'pre' ? stretchInfo.preWorkout : stretchInfo.postWorkout;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
            <View style={{ flex: 1 }}>
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.tagBadge,
                    {
                      backgroundColor:
                        activeTab === 'pre'
                          ? isDark
                            ? 'rgba(245, 158, 11, 0.15)'
                            : 'rgba(245, 158, 11, 0.12)'
                          : isDark
                          ? 'rgba(139, 92, 246, 0.15)'
                          : 'rgba(139, 92, 246, 0.12)',
                    },
                  ]}>
                  <Ionicons
                    name={activeTab === 'pre' ? 'flame-outline' : 'leaf-outline'}
                    size={12}
                    color={activeTab === 'pre' ? '#F59E0B' : '#8B5CF6'}
                  />
                  <Text
                    style={[
                      styles.tagBadgeText,
                      { color: activeTab === 'pre' ? '#F59E0B' : '#8B5CF6' },
                    ]}>
                    {activeTab === 'pre' ? 'PRE-WORKOUT WARM-UP' : 'POST-WORKOUT COOL-DOWN'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.title, { color: colors.text }]}>{exercise.name}</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Mobility & recovery protocol for {exercise.primary_muscle}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.cardBorder }]}>
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Tab Selector */}
          <View style={[styles.tabBar, { borderBottomColor: colors.cardBorder }]}>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === 'pre' && [
                  styles.tabBtnActive,
                  { borderBottomColor: '#F59E0B', backgroundColor: isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.05)' },
                ],
              ]}
              onPress={() => setActiveTab('pre')}>
              <Ionicons
                name="flame"
                size={15}
                color={activeTab === 'pre' ? '#F59E0B' : colors.textMuted}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'pre' ? '#F59E0B' : colors.textMuted, fontWeight: activeTab === 'pre' ? '700' : '600' },
                ]}>
                Pre-Workout Dynamic Warm-Up
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === 'post' && [
                  styles.tabBtnActive,
                  { borderBottomColor: '#8B5CF6', backgroundColor: isDark ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.05)' },
                ],
              ]}
              onPress={() => setActiveTab('post')}>
              <Ionicons
                name="leaf"
                size={15}
                color={activeTab === 'post' ? '#8B5CF6' : colors.textMuted}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'post' ? '#8B5CF6' : colors.textMuted, fontWeight: activeTab === 'post' ? '700' : '600' },
                ]}>
                Post-Workout Cool-Down
              </Text>
            </TouchableOpacity>
          </View>

          {/* Body Content */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Overview Card */}
            <View
              style={[
                styles.overviewCard,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC',
                  borderColor: colors.cardBorder,
                },
              ]}>
              <View style={styles.overviewHeader}>
                <Ionicons
                  name={activeTab === 'pre' ? 'flash-outline' : 'shield-checkmark-outline'}
                  size={16}
                  color={activeTab === 'pre' ? '#F59E0B' : '#8B5CF6'}
                />
                <Text style={[styles.overviewTitle, { color: colors.text }]}>
                  {currentProtocol.title}
                </Text>
              </View>

              <Text style={[styles.overviewFocus, { color: colors.textSecondary }]}>
                <Text style={{ fontWeight: '700', color: colors.text }}>Focus: </Text>
                {currentProtocol.focus}
              </Text>

              <View
                style={[
                  styles.whyItHelpsBox,
                  {
                    backgroundColor:
                      activeTab === 'pre'
                        ? isDark
                          ? 'rgba(245, 158, 11, 0.08)'
                          : 'rgba(245, 158, 11, 0.06)'
                        : isDark
                        ? 'rgba(139, 92, 246, 0.08)'
                        : 'rgba(139, 92, 246, 0.06)',
                    borderColor:
                      activeTab === 'pre'
                        ? 'rgba(245, 158, 11, 0.25)'
                        : 'rgba(139, 92, 246, 0.25)',
                  },
                ]}>
                <Ionicons
                  name="information-circle-outline"
                  size={15}
                  color={activeTab === 'pre' ? '#F59E0B' : '#8B5CF6'}
                />
                <Text style={[styles.whyItHelpsText, { color: colors.text }]}>
                  {currentProtocol.whyItHelps}
                </Text>
              </View>
            </View>

            {/* Drills List */}
            <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
              {activeTab === 'pre' ? 'DYNAMIC MOBILITY DRILLS (2–3 MINS)' : 'STATIC STRETCH ROUTINE (20–30S HOLDS)'}
            </Text>

            {currentProtocol.drills.map((drill, index) => (
              <View
                key={index}
                style={[
                  styles.drillCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                ]}>
                <View style={styles.drillHeader}>
                  <View style={styles.drillNumberBadge}>
                    <Text style={styles.drillNumberText}>{index + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.drillName, { color: colors.text }]}>{drill.name}</Text>
                    <View style={styles.drillMetaRow}>
                      <View style={[styles.durationPill, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }]}>
                        <Ionicons name="time-outline" size={11} color={colors.accent} />
                        <Text style={[styles.durationPillText, { color: colors.accent }]}>
                          {drill.durationOrReps}
                        </Text>
                      </View>
                      <Text style={[styles.targetAreaText, { color: colors.textMuted }]}>
                        • {drill.targetArea}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={[styles.drillInstructions, { color: colors.textSecondary }]}>
                  {drill.instructions}
                </Text>
              </View>
            ))}

            <View style={{ height: Spacing.xl }} />
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.cardBorder }]}>
            <TouchableOpacity
              style={[
                styles.doneBtn,
                { backgroundColor: activeTab === 'pre' ? '#F59E0B' : '#8B5CF6' },
              ]}
              onPress={onClose}>
              <Text style={styles.doneBtnText}>
                {activeTab === 'pre' ? 'Ready to Lift' : 'Done Stretching'}
              </Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '88%',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
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
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 12,
  },
  body: {
    padding: Spacing.md,
  },
  overviewCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  overviewTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  overviewFocus: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  whyItHelpsBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginTop: 4,
  },
  whyItHelpsText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  drillCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  drillHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  drillNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  drillNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
  },
  drillName: {
    fontSize: 14,
    fontWeight: '700',
  },
  drillMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 3,
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  durationPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  targetAreaText: {
    fontSize: 11,
  },
  drillInstructions: {
    fontSize: 12,
    lineHeight: 18,
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  doneBtn: {
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
