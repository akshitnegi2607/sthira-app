import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface MacroRingsCardProps {
  caloriesConsumed: number;
  caloriesTarget: number;
  proteinConsumed: number;
  proteinTargetMin: number;
  proteinTargetMax: number;
  carbsConsumed: number;
  carbsTarget: number;
  fatConsumed: number;
  fatTargetMax: number;
}

export const MacroRingsCard: React.FC<MacroRingsCardProps> = ({
  caloriesConsumed,
  caloriesTarget,
  proteinConsumed,
  proteinTargetMin,
  proteinTargetMax,
  carbsConsumed,
  carbsTarget,
  fatConsumed,
  fatTargetMax,
}) => {
  const { colors, isDark } = useAppTheme();

  const calRemaining = Math.max(0, caloriesTarget - caloriesConsumed);
  const proRemaining = Math.max(0, proteinTargetMax - proteinConsumed);

  // SVG Ring calculations
  const size = 130;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const calProgress = Math.min(1, Math.max(0, caloriesConsumed / caloriesTarget));
  const strokeDashoffset = circumference - calProgress * circumference;

  return (
    <Card elevated style={styles.card}>
      {/* Header with Measured vs Estimated indicator */}
      <View style={styles.badgeRow}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          DAILY NUTRITION TARGETS
        </Text>
        <View
          style={[
            styles.pill,
            {
              backgroundColor: isDark
                ? 'rgba(245, 158, 11, 0.16)'
                : 'rgba(217, 119, 6, 0.12)',
            },
          ]}>
          <Text style={[styles.pillText, { color: colors.calories }]}>ESTIMATED DATA</Text>
        </View>
      </View>

      <View style={styles.ringRow}>
        {/* Circular Ring Gauge */}
        <View style={styles.ringContainer}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
              {/* Background track */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Progress arc */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={colors.calories}
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </G>
          </Svg>
          <View style={styles.ringCenterText}>
            <Text style={[styles.ringCalVal, { color: colors.text }]}>
              {Math.round(caloriesConsumed)}
            </Text>
            <Text style={[styles.ringCalSub, { color: colors.textMuted }]}>kcal</Text>
          </View>
        </View>

        {/* Right Info Box */}
        <View style={styles.infoCol}>
          <Text style={[styles.targetLabel, { color: colors.textMuted }]}>
            TARGET: {caloriesTarget.toLocaleString()} KCAL
          </Text>
          <Text
            style={[
              styles.remainingHighlight,
              { color: calRemaining === 0 ? colors.statusOnTrack : colors.calories },
            ]}>
            {calRemaining > 0 ? `${calRemaining} kcal remaining` : 'Target Met'}
          </Text>
          <Text style={[styles.coachHint, { color: colors.textSecondary }]}>
            Jay’s lean bulk pace: +~250 kcal surplus aiming for ~0.15 kg/week gain.
          </Text>
        </View>
      </View>

      {/* Macro Breakdown Rows */}
      <View style={styles.macroDetailsContainer}>
        {/* Protein */}
        <View style={styles.macroBlock}>
          <View style={styles.macroTextRow}>
            <Text style={[styles.macroName, { color: colors.text }]}>Protein</Text>
            <Text style={[styles.macroValue, { color: colors.protein }]}>
              {Math.round(proteinConsumed)}g{' '}
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                / {proteinTargetMin}–{proteinTargetMax}g
              </Text>
            </Text>
          </View>
          <ProgressBar
            progress={proteinConsumed / proteinTargetMax}
            color={colors.protein}
            height={6}
          />
          <Text style={[styles.macroRemaining, { color: colors.textMuted }]}>
            {proRemaining > 0 ? `${Math.round(proRemaining)}g needed to reach 120g` : 'Goal achieved'}
          </Text>
        </View>

        {/* Carbs */}
        <View style={styles.macroBlock}>
          <View style={styles.macroTextRow}>
            <Text style={[styles.macroName, { color: colors.text }]}>Carbohydrates</Text>
            <Text style={[styles.macroValue, { color: colors.text }]}>
              {Math.round(carbsConsumed)}g{' '}
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>/ {carbsTarget}g</Text>
            </Text>
          </View>
          <ProgressBar
            progress={carbsConsumed / carbsTarget}
            color={colors.accent}
            height={6}
          />
          <Text style={[styles.macroRemaining, { color: colors.textMuted }]}>
            Primary energy for workout progression
          </Text>
        </View>

        {/* Fats */}
        <View style={styles.macroBlock}>
          <View style={styles.macroTextRow}>
            <Text style={[styles.macroName, { color: colors.text }]}>Healthy Fats</Text>
            <Text style={[styles.macroValue, { color: colors.text }]}>
              {Math.round(fatConsumed)}g{' '}
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>/ {fatTargetMax}g</Text>
            </Text>
          </View>
          <ProgressBar
            progress={fatConsumed / fatTargetMax}
            color={isDark ? '#FBBF24' : '#D97706'}
            height={6}
          />
          <Text style={[styles.macroRemaining, { color: colors.textMuted }]}>
            Hormonal support & nutrient absorption
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  pillText: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  ringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  ringContainer: {
    width: 130,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ringCenterText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCalVal: {
    fontSize: 24,
    fontWeight: '800',
  },
  ringCalSub: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoCol: {
    flex: 1,
    marginLeft: Spacing.lg,
    justifyContent: 'center',
  },
  targetLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  remainingHighlight: {
    fontSize: 18,
    fontWeight: '800',
    marginVertical: 4,
  },
  coachHint: {
    fontSize: 12,
    lineHeight: 17,
  },
  macroDetailsContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  macroBlock: {
    gap: 4,
  },
  macroTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  macroName: {
    fontSize: 13,
    fontWeight: '600',
  },
  macroValue: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  macroRemaining: {
    fontSize: 11,
    marginTop: 2,
  },
});
