/**
 * Sthira — Exercise Visual Guide Component
 * Interactive visual demonstration player for gym exercises featuring
 * high-definition animated execution GIFs, start/finish position photos,
 * execution cues, and beginner-focused biomechanical tips.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { getExerciseMedia, ExerciseMediaInfo } from '@/constants/exerciseMedia';

interface ExerciseVisualGuideProps {
  exerciseId: string;
  exerciseName?: string;
}

export const ExerciseVisualGuide: React.FC<ExerciseVisualGuideProps> = ({
  exerciseId,
  exerciseName,
}) => {
  const { colors, isDark } = useAppTheme();
  const [viewMode, setViewMode] = useState<'gif' | 'step0' | 'step1'>('gif');
  const [isLoading, setIsLoading] = useState(true);

  const media: ExerciseMediaInfo = getExerciseMedia(exerciseId, exerciseName);

  const currentImageUri =
    viewMode === 'gif'
      ? media.gifUrl
      : viewMode === 'step0'
      ? media.step0Url
      : media.step1Url;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      {/* View Mode Toggle Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            viewMode === 'gif' && [
              styles.tabBtnActive,
              { backgroundColor: colors.accent, borderColor: colors.accent },
            ],
          ]}
          onPress={() => {
            setIsLoading(true);
            setViewMode('gif');
          }}>
          <Ionicons
            name="videocam-outline"
            size={14}
            color={viewMode === 'gif' ? '#FFFFFF' : colors.textMuted}
          />
          <Text
            style={[
              styles.tabBtnText,
              { color: viewMode === 'gif' ? '#FFFFFF' : colors.textMuted },
            ]}>
            Animated GIF
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabBtn,
            viewMode === 'step0' && [
              styles.tabBtnActive,
              { backgroundColor: colors.accent, borderColor: colors.accent },
            ],
          ]}
          onPress={() => {
            setIsLoading(true);
            setViewMode('step0');
          }}>
          <Ionicons
            name="play-outline"
            size={14}
            color={viewMode === 'step0' ? '#FFFFFF' : colors.textMuted}
          />
          <Text
            style={[
              styles.tabBtnText,
              { color: viewMode === 'step0' ? '#FFFFFF' : colors.textMuted },
            ]}>
            1. Setup
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabBtn,
            viewMode === 'step1' && [
              styles.tabBtnActive,
              { backgroundColor: colors.accent, borderColor: colors.accent },
            ],
          ]}
          onPress={() => {
            setIsLoading(true);
            setViewMode('step1');
          }}>
          <Ionicons
            name="checkmark-circle-outline"
            size={14}
            color={viewMode === 'step1' ? '#FFFFFF' : colors.textMuted}
          />
          <Text
            style={[
              styles.tabBtnText,
              { color: viewMode === 'step1' ? '#FFFFFF' : colors.textMuted },
            ]}>
            2. Peak
          </Text>
        </TouchableOpacity>
      </View>

      {/* Visual Canvas */}
      <View style={[styles.canvas, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={colors.accent} />
          </View>
        )}
        <Image
          source={{ uri: currentImageUri }}
          style={styles.image}
          contentFit="contain"
          transition={300}
          onLoadStart={() => setIsLoading(true)}
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
        <View style={styles.badgeOverlay}>
          <Text style={styles.badgeText}>
            {viewMode === 'gif'
              ? 'LIVE FORM'
              : viewMode === 'step0'
              ? 'STARTING POSITION'
              : 'PEAK CONTRACTION'}
          </Text>
        </View>
      </View>

      {/* Tempo & Target Focus Banner */}
      <View style={styles.tempoRow}>
        <View
          style={[
            styles.tempoPill,
            {
              backgroundColor: isDark
                ? 'rgba(56, 189, 248, 0.12)'
                : 'rgba(2, 132, 199, 0.08)',
              borderColor: colors.protein,
            },
          ]}>
          <Ionicons name="speedometer-outline" size={13} color={colors.protein} />
          <Text style={[styles.tempoText, { color: colors.protein }]}>
            {media.tempo}
          </Text>
        </View>

        <View
          style={[
            styles.focusPill,
            {
              backgroundColor: isDark
                ? 'rgba(16, 185, 129, 0.12)'
                : 'rgba(16, 185, 129, 0.08)',
              borderColor: colors.accent,
            },
          ]}>
          <Ionicons name="fitness-outline" size={13} color={colors.accent} />
          <Text style={[styles.focusText, { color: colors.accent }]} numberOfLines={1}>
            {media.targetFocus}
          </Text>
        </View>
      </View>

      {/* Form Cues */}
      <View style={styles.cuesContainer}>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          COACH FORM CUES
        </Text>
        {media.formCues.map((cue, idx) => (
          <View key={idx} style={styles.cueItem}>
            <View style={[styles.cueNumber, { backgroundColor: colors.accent }]}>
              <Text style={styles.cueNumberText}>{idx + 1}</Text>
            </View>
            <Text style={[styles.cueText, { color: colors.text }]}>{cue}</Text>
          </View>
        ))}
      </View>

      {/* Beginner Tip Alert */}
      <View
        style={[
          styles.tipBox,
          {
            backgroundColor: isDark
              ? 'rgba(245, 158, 11, 0.1)'
              : 'rgba(245, 158, 11, 0.08)',
            borderColor: colors.statusAttention,
          },
        ]}>
        <Ionicons name="bulb-outline" size={16} color={colors.statusAttention} />
        <Text style={[styles.tipText, { color: colors.text }]}>
          <Text style={{ fontWeight: '700', color: colors.statusAttention }}>
            Beginner Tip:{' '}
          </Text>
          {media.beginnerTips}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  tabBar: {
    flexDirection: 'row',
    padding: Spacing.xs,
    gap: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabBtnActive: {
    elevation: 1,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  canvas: {
    width: '100%',
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  badgeOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  tempoRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  tempoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 4,
  },
  tempoText: {
    fontSize: 11,
    fontWeight: '600',
  },
  focusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 4,
    flex: 1,
  },
  focusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cuesContainer: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  cueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  cueNumber: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  cueNumberText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cueText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
});
