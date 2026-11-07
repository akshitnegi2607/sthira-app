/**
 * Sthira — Plank & Timed Exercise Stopwatch Widget
 * Hands-free friendly timer designed for floor planks and isometric holds.
 * Features live countdown/stopwatch, large tactile touch targets, set targeting,
 * and direct logging into workout sets upon stopping.
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { WorkoutSet } from '@/types/database';

interface PlankTimerWidgetProps {
  exerciseName: string;
  targetRepRange: string; // e.g. "45–60s"
  sets: WorkoutSet[];
  onUpdateSet: (setId: string, data: any) => void;
  onToggleSet: (setId: string) => void;
}

export const PlankTimerWidget: React.FC<PlankTimerWidgetProps> = ({
  exerciseName,
  targetRepRange,
  sets,
  onUpdateSet,
  onToggleSet,
}) => {
  const { colors, isDark } = useAppTheme();

  // Find first incomplete set or default to first set
  const firstIncomplete = sets.find((s) => s.is_completed === 0) || sets[0];
  const [selectedSetId, setSelectedSetId] = useState<string>(firstIncomplete?.id || '');

  // Synchronize if sets change or first incomplete changes
  useEffect(() => {
    if (!sets.some((s) => s.id === selectedSetId)) {
      const next = sets.find((s) => s.is_completed === 0) || sets[0];
      if (next) setSelectedSetId(next.id);
    }
  }, [sets, selectedSetId]);

  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer interval tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning]);

  const handleStart = () => {
    setIsRunning(true);
    if (Platform.OS !== 'web') {
      try {
        Vibration.vibrate(50);
      } catch {}
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
  };

  const handleStopAndLog = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const duration = Math.max(1, elapsedSeconds);
    const targetSet = sets.find((s) => s.id === selectedSetId) || firstIncomplete;

    if (targetSet) {
      // 1. Directly update set with the measured seconds
      onUpdateSet(targetSet.id, {
        reps: duration,
        weight_kg: targetSet.weight_kg ?? 0,
      });

      // 2. Mark set as complete if not already completed
      if (targetSet.is_completed === 0) {
        onToggleSet(targetSet.id);
      }

      // Haptic confirmation
      if (Platform.OS !== 'web') {
        try {
          Vibration.vibrate([0, 80, 50, 80]);
        } catch {}
      }

      // 3. Advance to the next incomplete set
      const nextIncomplete = sets.find(
        (s) => s.id !== targetSet.id && s.is_completed === 0
      );
      if (nextIncomplete) {
        setSelectedSetId(nextIncomplete.id);
      }

      // Reset timer for the next set
      setElapsedSeconds(0);
    }
  };

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const activeSet = sets.find((s) => s.id === selectedSetId) || sets[0];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.05)',
          borderColor: isRunning
            ? colors.accent
            : isDark
            ? 'rgba(16, 185, 129, 0.25)'
            : 'rgba(16, 185, 129, 0.2)',
        },
      ]}>
      {/* Widget Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={[styles.pulseCircle, { backgroundColor: isRunning ? colors.accent : colors.cardBorder }]}>
            <Ionicons name="timer" size={14} color={isRunning ? '#FFFFFF' : colors.textMuted} />
          </View>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>
              PLANK HOLD STOPWATCH
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Target: {targetRepRange} • Auto-logs on stop
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isRunning
                ? 'rgba(16, 185, 129, 0.2)'
                : elapsedSeconds > 0
                ? 'rgba(245, 158, 11, 0.2)'
                : colors.cardElevated,
            },
          ]}>
          <Text
            style={[
              styles.statusText,
              {
                color: isRunning
                  ? colors.accent
                  : elapsedSeconds > 0
                  ? '#F59E0B'
                  : colors.textMuted,
              },
            ]}>
            {isRunning ? 'HOLDING PLANK' : elapsedSeconds > 0 ? 'PAUSED' : 'READY'}
          </Text>
        </View>
      </View>

      {/* Set Selector Pills */}
      <View style={styles.setSelectorRow}>
        <Text style={[styles.selectorLabel, { color: colors.textMuted }]}>LOG TO:</Text>
        <View style={styles.setPillsScroll}>
          {sets.map((s) => {
            const isSelected = s.id === selectedSetId;
            const isDone = s.is_completed === 1;

            return (
              <TouchableOpacity
                key={s.id}
                style={[
                  styles.setPill,
                  {
                    backgroundColor: isSelected
                      ? colors.accent
                      : isDark
                      ? 'rgba(255, 255, 255, 0.05)'
                      : '#FFFFFF',
                    borderColor: isSelected ? colors.accent : colors.cardBorder,
                  },
                ]}
                onPress={() => setSelectedSetId(s.id)}>
                <Text
                  style={[
                    styles.setPillText,
                    {
                      color: isSelected ? '#FFFFFF' : isDone ? colors.accent : colors.text,
                      fontWeight: isSelected ? '700' : '600',
                    },
                  ]}>
                  Set {s.set_number} {s.reps > 0 ? `(${s.reps}s)` : ''} {isDone ? '✓' : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Main Digital Timer Readout */}
      <View style={styles.timerDisplayBox}>
        <Text
          style={[
            styles.timerDigits,
            {
              color: isRunning ? colors.accent : elapsedSeconds > 0 ? colors.text : colors.textMuted,
            },
          ]}>
          {formatTime(elapsedSeconds)}
        </Text>
        <Text style={[styles.timerUnit, { color: colors.textMuted }]}>
          {elapsedSeconds > 0 ? `${elapsedSeconds} SECONDS` : 'SECONDS'}
        </Text>
      </View>

      {/* Quick Target Presets (when timer is 0) */}
      {!isRunning && elapsedSeconds === 0 && (
        <View style={styles.presetsRow}>
          <Text style={[styles.presetLabel, { color: colors.textMuted }]}>Quick Presets:</Text>
          {[30, 45, 60, 90].map((preset) => (
            <TouchableOpacity
              key={preset}
              style={[
                styles.presetBtn,
                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF', borderColor: colors.cardBorder },
              ]}
              onPress={() => {
                setElapsedSeconds(preset);
              }}>
              <Text style={[styles.presetBtnText, { color: colors.textSecondary }]}>
                {preset}s
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Large Touch Controls */}
      <View style={styles.actionsRow}>
        {!isRunning && elapsedSeconds === 0 ? (
          <TouchableOpacity
            style={[styles.bigPrimaryBtn, { backgroundColor: colors.accent }]}
            onPress={handleStart}
            activeOpacity={0.8}>
            <Ionicons name="play" size={20} color="#FFFFFF" />
            <Text style={styles.bigPrimaryBtnText}>Start Plank Timer</Text>
          </TouchableOpacity>
        ) : isRunning ? (
          <View style={styles.splitActionsRow}>
            <TouchableOpacity
              style={[
                styles.pauseBtn,
                { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.12)', borderColor: '#F59E0B' },
              ]}
              onPress={handlePause}
              activeOpacity={0.8}>
              <Ionicons name="pause" size={18} color="#F59E0B" />
              <Text style={[styles.pauseBtnText, { color: '#F59E0B' }]}>Pause</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.stopLogBtn, { backgroundColor: colors.accent }]}
              onPress={handleStopAndLog}
              activeOpacity={0.8}>
              <Ionicons name="stop" size={18} color="#FFFFFF" />
              <Text style={styles.stopLogBtnText}>
                Stop & Log Set ({elapsedSeconds}s) ✓
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.splitActionsRow}>
            <TouchableOpacity
              style={[styles.resumeBtn, { backgroundColor: colors.accent }]}
              onPress={handleStart}
              activeOpacity={0.8}>
              <Ionicons name="play" size={16} color="#FFFFFF" />
              <Text style={styles.resumeBtnText}>Resume</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.stopLogBtn, { backgroundColor: colors.accent, flex: 2 }]}
              onPress={handleStopAndLog}
              activeOpacity={0.8}>
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.stopLogBtnText}>
                Log Set {activeSet ? activeSet.set_number : ''} ({elapsedSeconds}s)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.resetBtn,
                { backgroundColor: colors.cardElevated, borderColor: colors.cardBorder },
              ]}
              onPress={handleReset}
              activeOpacity={0.8}>
              <Ionicons name="refresh" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseCircle: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  setSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  selectorLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  setPillsScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  setPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  setPillText: {
    fontSize: 11,
  },
  timerDisplayBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  timerDigits: {
    fontSize: 44,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  timerUnit: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: -2,
  },
  presetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  presetLabel: {
    fontSize: 11,
  },
  presetBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  presetBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionsRow: {
    marginTop: 4,
  },
  bigPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  bigPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  splitActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pauseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  pauseBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  stopLogBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
  },
  stopLogBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
  },
  resumeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  resetBtn: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
