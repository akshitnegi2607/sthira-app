import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DailyCoachReviewResult } from '@/services/journalAnalytics';

interface DailyCoachSummaryCardProps {
  review: DailyCoachReviewResult | null;
  onRegenerate: () => Promise<void>;
  isLoading?: boolean;
}

export const DailyCoachSummaryCard: React.FC<DailyCoachSummaryCardProps> = ({
  review,
  onRegenerate,
  isLoading = false,
}) => {
  const { colors, isDark } = useAppTheme();

  if (!review) return null;

  return (
    <Card elevated style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: isDark
                  ? 'rgba(16, 185, 129, 0.16)'
                  : 'rgba(5, 150, 105, 0.12)',
              },
            ]}>
            <Ionicons name="sparkles" size={17} color={colors.accent} />
          </View>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Daily AI Coach Review
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {review.headline}
            </Text>
          </View>
        </View>

        <StatusBadge status={review.status} />
      </View>

      {/* Distinction Badge */}
      <View
        style={[
          styles.badgeEstimated,
          {
            backgroundColor: isDark
              ? 'rgba(255, 255, 255, 0.04)'
              : 'rgba(0, 0, 0, 0.03)',
            borderColor: colors.cardBorder,
          },
        ]}>
        <Ionicons
          name="information-circle-outline"
          size={12}
          color={colors.textMuted}
        />
        <Text style={[styles.badgeEstimatedText, { color: colors.textMuted }]}>
          ESTIMATED AI SYNTHESIS • MEASURED NUTRITION & SETS
        </Text>
      </View>

      {/* Synthesis Narrative */}
      <Text style={[styles.narrative, { color: colors.textSecondary }]}>
        {review.summary}
      </Text>

      {/* Action Items for Tomorrow */}
      {review.actionItems && review.actionItems.length > 0 ? (
        <View style={styles.actionsSection}>
          <Text style={[styles.actionsHeading, { color: colors.text }]}>
            Action Items for Tomorrow:
          </Text>
          <View style={styles.actionsList}>
            {review.actionItems.map((item, idx) => (
              <View key={idx} style={styles.actionItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={15}
                  color={colors.accent}
                  style={styles.actionCheck}
                />
                <Text
                  style={[styles.actionText, { color: colors.textSecondary }]}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Regenerate Button */}
      <TouchableOpacity
        style={[
          styles.recalcBtn,
          {
            backgroundColor: colors.cardElevated,
            borderColor: colors.cardBorder,
          },
          isLoading && { opacity: 0.6 },
        ]}
        onPress={onRegenerate}
        disabled={isLoading}
        activeOpacity={0.7}>
        <Ionicons name="refresh-outline" size={14} color={colors.textMuted} />
        <Text style={[styles.recalcText, { color: colors.textMuted }]}>
          {isLoading ? 'Synthesizing...' : 'Refresh AI Coach Review'}
        </Text>
      </TouchableOpacity>
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
    marginBottom: Spacing.sm,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  badgeEstimated: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  badgeEstimatedText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  narrative: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  actionsSection: {
    marginBottom: Spacing.md,
    paddingTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
  },
  actionsHeading: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  actionsList: {
    gap: 6,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  actionCheck: {
    marginTop: 2,
  },
  actionText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  recalcBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  recalcText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
