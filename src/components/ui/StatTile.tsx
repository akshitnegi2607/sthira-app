import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';
import { ProgressBar } from './ProgressBar';

interface StatTileProps {
  label: string;
  value: string;
  target?: string;
  unit?: string;
  progress?: number; // 0 to 1
  accentColor?: string;
  isEstimated?: boolean;
  subtitle?: string;
}

export const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  target,
  unit,
  progress,
  accentColor,
  isEstimated = false,
  subtitle,
}) => {
  const { colors } = useAppTheme();
  const color = accentColor || colors.accent;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
        {isEstimated && (
          <View style={[styles.estBadge, { backgroundColor: colors.cardBorder }]}>
            <Text style={[styles.estText, { color: colors.textMuted }]}>ESTIMATED</Text>
          </View>
        )}
      </View>

      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: colors.text }]}>
          {value}
          {unit ? <Text style={[styles.unit, { color: colors.textSecondary }]}> {unit}</Text> : null}
        </Text>
        {target ? (
          <Text style={[styles.target, { color: colors.textMuted }]}>/ {target}</Text>
        ) : null}
      </View>

      {progress !== undefined && (
        <View style={styles.progressContainer}>
          <ProgressBar progress={progress} color={color} height={6} />
        </View>
      )}

      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  estBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: BorderRadius.sm,
  },
  estText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
    marginBottom: Spacing.xs,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
  },
  unit: {
    fontSize: 13,
    fontWeight: '500',
  },
  target: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },
  progressContainer: {
    marginTop: 4,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 4,
  },
});
