import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { ReadinessBreakdown } from '@/services/journalAnalytics';

interface ReadinessScoreCardProps {
  readiness: ReadinessBreakdown;
  onOpenCheckIn: () => void;
}

export const ReadinessScoreCard: React.FC<ReadinessScoreCardProps> = ({
  readiness,
  onOpenCheckIn,
}) => {
  const { colors, isDark } = useAppTheme();

  const {
    sleepScore,
    energyScore,
    sorenessScore,
    moodScore,
    totalScore,
    level,
    recommendation,
  } = readiness;

  // SVG Gauge Calculations
  const size = 105;
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (totalScore / 100) * circumference;

  const levelColor =
    level === 'OPTIMAL'
      ? colors.accent
      : level === 'MODERATE'
      ? colors.calories
      : colors.statusAlert;

  return (
    <Card elevated style={styles.card}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            MORNING READINESS
          </Text>
          <View
            style={[
              styles.estBadge,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(0, 0, 0, 0.03)',
                borderColor: colors.cardBorder,
              },
            ]}>
            <Text style={[styles.estText, { color: colors.textMuted }]}>
              ESTIMATED SCORE
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.levelBadge,
            {
              backgroundColor: isDark
                ? `${levelColor}22`
                : `${levelColor}15`,
              borderColor: `${levelColor}55`,
            },
          ]}>
          <Text style={[styles.levelText, { color: levelColor }]}>{level}</Text>
        </View>
      </View>

      {/* Main Gauge and Breakdown */}
      <View style={styles.mainRow}>
        {/* SVG Circular Gauge */}
        <View style={styles.gaugeContainer}>
          <Svg width={size} height={size}>
            <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
              {/* Background Track */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'}
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Progress Stroke */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={levelColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={progressOffset}
                strokeLinecap="round"
              />
            </G>
          </Svg>
          <View style={styles.gaugeCenter}>
            <Text style={[styles.gaugeScore, { color: colors.text }]}>
              {totalScore}
            </Text>
            <Text style={[styles.gaugeUnit, { color: colors.textMuted }]}>
              /100
            </Text>
          </View>
        </View>

        {/* Breakdown Sub-scores */}
        <View style={styles.breakdownGrid}>
          <View
            style={[
              styles.breakdownTile,
              {
                backgroundColor: colors.cardElevated,
                borderColor: colors.cardBorder,
              },
            ]}>
            <Text style={[styles.tileLabel, { color: colors.textMuted }]}>
              Sleep
            </Text>
            <Text style={[styles.tileVal, { color: colors.text }]}>
              {sleepScore}
              <Text style={styles.tileMax}>/35</Text>
            </Text>
          </View>

          <View
            style={[
              styles.breakdownTile,
              {
                backgroundColor: colors.cardElevated,
                borderColor: colors.cardBorder,
              },
            ]}>
            <Text style={[styles.tileLabel, { color: colors.textMuted }]}>
              Energy
            </Text>
            <Text style={[styles.tileVal, { color: colors.text }]}>
              {energyScore}
              <Text style={styles.tileMax}>/25</Text>
            </Text>
          </View>

          <View
            style={[
              styles.breakdownTile,
              {
                backgroundColor: colors.cardElevated,
                borderColor: colors.cardBorder,
              },
            ]}>
            <Text style={[styles.tileLabel, { color: colors.textMuted }]}>
              Freshness
            </Text>
            <Text style={[styles.tileVal, { color: colors.text }]}>
              {sorenessScore}
              <Text style={styles.tileMax}>/20</Text>
            </Text>
          </View>

          <View
            style={[
              styles.breakdownTile,
              {
                backgroundColor: colors.cardElevated,
                borderColor: colors.cardBorder,
              },
            ]}>
            <Text style={[styles.tileLabel, { color: colors.textMuted }]}>
              Mood
            </Text>
            <Text style={[styles.tileVal, { color: colors.text }]}>
              {moodScore}
              <Text style={styles.tileMax}>/20</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Recommendation Box */}
      <View
        style={[
          styles.recomBox,
          {
            backgroundColor: isDark
              ? 'rgba(255, 255, 255, 0.03)'
              : 'rgba(0, 0, 0, 0.02)',
          },
        ]}>
        <Ionicons name="fitness-outline" size={15} color={levelColor} />
        <Text style={[styles.recomText, { color: colors.textSecondary }]}>
          {recommendation}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  estBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  estText: {
    fontSize: 9,
    fontWeight: '700',
  },
  levelBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '800',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  gaugeContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeScore: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 30,
  },
  gaugeUnit: {
    fontSize: 10,
    fontWeight: '600',
  },
  breakdownGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs + 2,
  },
  breakdownTile: {
    width: '47%',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  tileLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  tileVal: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 1,
  },
  tileMax: {
    fontSize: 10,
    fontWeight: '500',
    opacity: 0.7,
  },
  recomBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  recomText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
});
