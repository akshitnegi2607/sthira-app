/**
 * Sthira — Rest Timer Banner
 * Calm, minimalist rest countdown indicator with animated progress bar
 * and quick adjustments (+30s, skip).
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useWorkoutStore } from '@/stores/useWorkoutStore';

export const RestTimerBanner: React.FC = () => {
  const { colors } = useAppTheme();
  const isRestTimerActive = useWorkoutStore((s) => s.isRestTimerActive);
  const restTimeRemaining = useWorkoutStore((s) => s.restTimeRemaining);
  const restTimeTotal = useWorkoutStore((s) => s.restTimeTotal);
  const stopRestTimer = useWorkoutStore((s) => s.stopRestTimer);
  const addRestSeconds = useWorkoutStore((s) => s.addRestSeconds);
  const tickRestTimer = useWorkoutStore((s) => s.tickRestTimer);

  useEffect(() => {
    if (!isRestTimerActive) return;
    const interval = setInterval(() => {
      tickRestTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [isRestTimerActive, tickRestTimer]);

  if (!isRestTimerActive || restTimeRemaining <= 0) {
    return null;
  }

  const minutes = Math.floor(restTimeRemaining / 60);
  const seconds = restTimeRemaining % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  const progressRatio = Math.max(0, Math.min(1, restTimeRemaining / (restTimeTotal || 90)));

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.accent }]}>
      {/* Progress Bar Track */}
      <View style={[styles.progressTrack, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
        <View
          style={[
            styles.progressBar,
            {
              backgroundColor: colors.accent,
              width: `${Math.round(progressRatio * 100)}%`,
            },
          ]}
        />
      </View>

      <View style={styles.contentRow}>
        <View style={styles.timerLeft}>
          <Ionicons name="timer-outline" size={18} color={colors.accent} />
          <Text style={[styles.label, { color: colors.textSecondary }]}>Resting</Text>
          <Text style={[styles.timeText, { color: colors.text }]}>{timeFormatted}</Text>
        </View>

        <View style={styles.actionsRight}>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.cardBorder }]}
            onPress={() => addRestSeconds(30)}>
            <Text style={[styles.addBtnText, { color: colors.text }]}>+30s</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} onPress={stopRestTimer}>
            <Text style={[styles.skipBtnText, { color: colors.textMuted }]}>Skip</Text>
            <Ionicons name="play-forward" size={14} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
    marginVertical: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressTrack: {
    height: 3,
    width: '100%',
  },
  progressBar: {
    height: 3,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  timerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    marginLeft: 2,
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  addBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  skipBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
