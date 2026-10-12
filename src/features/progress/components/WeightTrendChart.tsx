import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutChangeEvent,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Line,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmaWeightPoint, WeightDataPoint } from '@/services/progressAnalytics';
import { ProgressTimeframe } from '@/stores/useProgressStore';

interface WeightTrendChartProps {
  timeframe: ProgressTimeframe;
  onSelectTimeframe: (tf: ProgressTimeframe) => void;
  rawPoints: WeightDataPoint[];
  emaPoints: EmaWeightPoint[];
  targetWeight: number;
  currentWeight: number;
  currentEma: number;
  weeklyRate: number;
  onOpenLogModal: () => void;
}

export const WeightTrendChart: React.FC<WeightTrendChartProps> = ({
  timeframe,
  onSelectTimeframe,
  rawPoints,
  emaPoints,
  targetWeight,
  currentWeight,
  currentEma,
  weeklyRate,
  onOpenLogModal,
}) => {
  const { colors, isDark } = useAppTheme();
  const [chartWidth, setChartWidth] = useState<number>(330);
  const chartHeight = 170;
  const paddingHorizontal = 30;
  const paddingVertical = 25;

  const onLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 50) {
      setChartWidth(width);
    }
  };

  // Filter data according to timeframe
  const getCutoffDays = () => {
    switch (timeframe) {
      case '7d':
        return 7;
      case '30d':
        return 30;
      case '90d':
        return 90;
      case 'all':
      default:
        return 365;
    }
  };

  const cutoff = new Date(Date.now() - getCutoffDays() * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const filteredRaw = rawPoints.filter((p) => p.date >= cutoff);
  const filteredEma = emaPoints.filter((p) => p.date >= cutoff);

  // If filtered is empty, fall back to last few available
  const displayRaw = filteredRaw.length > 0 ? filteredRaw : rawPoints.slice(-7);
  const displayEma = filteredEma.length > 0 ? filteredEma : emaPoints.slice(-7);

  // Determine min and max Y range
  const allWeights = [
    ...displayRaw.map((p) => p.weightKg),
    ...displayEma.map((p) => p.emaKg),
  ];

  const minWeightRaw = allWeights.length > 0 ? Math.min(...allWeights) : 63.5;
  const maxWeightRaw = allWeights.length > 0 ? Math.max(...allWeights) : 64.5;

  // Add breathing room
  const yMin = Math.floor((minWeightRaw - 0.3) * 2) / 2;
  const yMax = Math.ceil((maxWeightRaw + 0.3) * 2) / 2;
  const yRange = Math.max(0.5, yMax - yMin);

  // Scale coordinate helpers
  const getX = (index: number, total: number) => {
    if (total <= 1) return chartWidth / 2;
    const drawableWidth = chartWidth - paddingHorizontal * 2;
    return paddingHorizontal + (index / (total - 1)) * drawableWidth;
  };

  const getY = (val: number) => {
    const drawableHeight = chartHeight - paddingVertical * 2;
    const norm = (val - yMin) / yRange;
    return chartHeight - paddingVertical - norm * drawableHeight;
  };

  // Build SVG Path for EMA line
  let emaPathD = '';
  let emaAreaD = '';
  if (displayEma.length > 0) {
    displayEma.forEach((pt, idx) => {
      const x = getX(idx, displayEma.length);
      const y = getY(pt.emaKg);
      if (idx === 0) {
        emaPathD = `M ${x.toFixed(1)},${y.toFixed(1)}`;
        emaAreaD = `M ${x.toFixed(1)},${(chartHeight - paddingVertical).toFixed(1)} L ${x.toFixed(1)},${y.toFixed(1)}`;
      } else {
        emaPathD += ` L ${x.toFixed(1)},${y.toFixed(1)}`;
        emaAreaD += ` L ${x.toFixed(1)},${y.toFixed(1)}`;
      }
    });

    if (displayEma.length > 1) {
      const lastX = getX(displayEma.length - 1, displayEma.length);
      const firstX = getX(0, displayEma.length);
      const bottomY = chartHeight - paddingVertical;
      emaAreaD += ` L ${lastX.toFixed(1)},${bottomY.toFixed(1)} L ${firstX.toFixed(1)},${bottomY.toFixed(1)} Z`;
    }
  }

  // Rate status badge
  const rateStatus =
    weeklyRate >= 0.1 && weeklyRate <= 0.2
      ? 'ON TRACK'
      : weeklyRate > 0.2
      ? 'ATTENTION'
      : 'ATTENTION';

  return (
    <Card elevated style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View>
          <View style={styles.titleWithBadge}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
              BODY WEIGHT & TREND
            </Text>
            <View
              style={[
                styles.estTag,
                {
                  backgroundColor: isDark
                    ? 'rgba(16, 185, 129, 0.16)'
                    : 'rgba(5, 150, 105, 0.12)',
                  borderColor: isDark
                    ? 'rgba(16, 185, 129, 0.3)'
                    : 'rgba(5, 150, 105, 0.25)',
                },
              ]}>
              <Text style={[styles.estTagText, { color: colors.accent }]}>
                EMA TREND
              </Text>
            </View>
          </View>
          <View style={styles.weightNumberRow}>
            <Text style={[styles.bigWeight, { color: colors.text }]}>
              {(currentWeight ?? 65.8).toFixed(1)}
              <Text style={[styles.unit, { color: colors.textMuted }]}> kg</Text>
            </Text>
            <View style={styles.trendPill}>
              <Text style={[styles.trendLabel, { color: colors.textMuted }]}>
                Smoothed:
              </Text>
              <Text style={[styles.trendValue, { color: colors.accent }]}>
                {' '}
                {(currentEma ?? 65.8).toFixed(2)} kg
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logButton, { backgroundColor: colors.accent }]}
          onPress={onOpenLogModal}
          activeOpacity={0.8}>
          <Text style={styles.logButtonText}>+ Log</Text>
        </TouchableOpacity>
      </View>

      {/* Velocity and Rate Row */}
      <View style={styles.rateRow}>
        <View style={styles.rateInfo}>
          <Text style={[styles.rateSub, { color: colors.textMuted }]}>
            7-Day Velocity:
          </Text>
          <Text
            style={[
              styles.rateVal,
              {
                color:
                  (weeklyRate ?? 0) >= 0.1 && (weeklyRate ?? 0) <= 0.2
                    ? colors.accent
                    : (weeklyRate ?? 0) > 0.2
                    ? colors.statusAttention
                    : colors.textSecondary,
              },
            ]}>
            {(weeklyRate ?? 0) >= 0
              ? `+${(weeklyRate ?? 0).toFixed(2)}`
              : (weeklyRate ?? 0).toFixed(2)}{' '}
            kg/wk
          </Text>
        </View>
        <StatusBadge status={rateStatus} />
      </View>

      {/* Timeframe Selector */}
      <View
        style={[
          styles.timeframeBar,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F3F4F6' },
        ]}>
        {(['7d', '30d', '90d', 'all'] as ProgressTimeframe[]).map((tf) => {
          const isActive = timeframe === tf;
          return (
            <TouchableOpacity
              key={tf}
              onPress={() => onSelectTimeframe(tf)}
              style={[
                styles.tfButton,
                isActive && [
                  styles.tfButtonActive,
                  { backgroundColor: colors.cardElevated },
                ],
              ]}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.tfButtonText,
                  {
                    color: isActive ? colors.text : colors.textMuted,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}>
                {tf.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Interactive SVG Chart */}
      <View style={styles.chartContainer} onLayout={onLayout}>
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id="emaGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop
                offset="0%"
                stopColor={colors.accent}
                stopOpacity={isDark ? '0.25' : '0.18'}
              />
              <Stop
                offset="100%"
                stopColor={colors.accent}
                stopOpacity="0.0"
              />
            </LinearGradient>
          </Defs>

          {/* Grid lines and Y labels */}
          {[yMin, (yMin + yMax) / 2, yMax].map((tick, idx) => {
            const y = getY(tick);
            return (
              <React.Fragment key={idx}>
                <Line
                  x1={paddingHorizontal - 5}
                  y1={y}
                  x2={chartWidth - paddingHorizontal + 5}
                  y2={y}
                  stroke={isDark ? 'rgba(255,255,255,0.07)' : '#E5E7EB'}
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <SvgText
                  x={paddingHorizontal - 8}
                  y={y + 3}
                  fontSize="9"
                  fill={colors.textMuted}
                  textAnchor="end"
                  fontWeight="600">
                  {typeof tick === 'number' ? tick.toFixed(1) : ''}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* EMA shaded area */}
          {emaAreaD ? <Path d={emaAreaD} fill="url(#emaGradient)" /> : null}

          {/* EMA Trend Line (Smooth) */}
          {emaPathD ? (
            <Path
              d={emaPathD}
              fill="none"
              stroke={colors.accent}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {/* Raw Measured Scale Points (Discrete Circles) */}
          {displayRaw.map((pt, idx) => {
            const x = getX(idx, displayRaw.length);
            const y = getY(pt.weightKg);
            return (
              <React.Fragment key={`raw_${pt.date}_${idx}`}>
                <Circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill={colors.cardElevated}
                  stroke={colors.text}
                  strokeWidth="2"
                />
              </React.Fragment>
            );
          })}

          {/* X Axis Date labels (First and Last) */}
          {displayRaw.length > 0 ? (
            <>
              <SvgText
                x={paddingHorizontal}
                y={chartHeight - 4}
                fontSize="10"
                fill={colors.textMuted}
                textAnchor="start">
                {displayRaw[0].date.slice(5)}
              </SvgText>
              <SvgText
                x={chartWidth - paddingHorizontal}
                y={chartHeight - 4}
                fontSize="10"
                fill={colors.textMuted}
                textAnchor="end">
                {displayRaw[displayRaw.length - 1].date.slice(5)}
              </SvgText>
            </>
          ) : null}
        </Svg>
      </View>

      {/* Chart Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: colors.cardElevated, borderColor: colors.text },
            ]}
          />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Measured Scale (Raw)
          </Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: colors.accent }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            EMA Trend (Estimated)
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  estTag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  estTagText: {
    fontSize: 9,
    fontWeight: '700',
  },
  weightNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
    marginTop: 2,
  },
  bigWeight: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 17,
    fontWeight: '500',
  },
  trendPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendLabel: {
    fontSize: 12,
  },
  trendValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  logButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
  },
  logButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  rateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rateSub: {
    fontSize: 12,
  },
  rateVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  timeframeBar: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    padding: 3,
    marginBottom: Spacing.sm,
  },
  tfButton: {
    flex: 1,
    paddingVertical: 5,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  tfButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  tfButtonText: {
    fontSize: 11,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 2,
  },
  legendLine: {
    width: 14,
    height: 3,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
