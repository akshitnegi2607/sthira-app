import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/Card';

interface CoachSummaryCardProps {
  summary: string;
  onViewAnalysis?: () => void;
}

export const CoachSummaryCard: React.FC<CoachSummaryCardProps> = ({
  summary,
  onViewAnalysis,
}) => {
  const { colors, isDark } = useAppTheme();

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: isDark
                  ? 'rgba(16, 185, 129, 0.2)'
                  : 'rgba(5, 150, 105, 0.12)',
              },
            ]}>
            <Ionicons name="sparkles" size={16} color={colors.accent} />
          </View>
          <Text style={[styles.coachTitle, { color: colors.text }]}>Today's AI Coach</Text>
        </View>

        <View style={[styles.estimateBadge, { backgroundColor: colors.cardBorder }]}>
          <Text style={[styles.estimateText, { color: colors.textMuted }]}>RECOMMENDATION</Text>
        </View>
      </View>

      <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
        {summary}
      </Text>

      {onViewAnalysis && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onViewAnalysis}
          style={[styles.analysisButton, { borderTopColor: colors.cardBorder }]}>
          <Text style={[styles.analysisButtonText, { color: colors.accent }]}>
            View full analysis & insights
          </Text>
          <Ionicons name="arrow-forward" size={14} color={colors.accent} />
        </TouchableOpacity>
      )}
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
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  coachTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  estimateBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  estimateText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  summaryText: {
    fontSize: 13.5,
    lineHeight: 21,
    marginTop: Spacing.xs,
  },
  analysisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    marginTop: Spacing.md,
    borderTopWidth: 1,
  },
  analysisButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
