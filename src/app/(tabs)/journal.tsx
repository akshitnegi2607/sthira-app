import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { useDashboardStore } from '@/stores/useDashboardStore';

export default function JournalScreen() {
  const { colors, isDark } = useAppTheme();
  const todayLog = useDashboardStore((s) => s.todayLog);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      {/* Today's Reflection Card */}
      <Card elevated style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            DAILY JOURNAL
          </Text>
          <Text style={[styles.dateText, { color: colors.textMuted }]}>
            {todayLog.date}
          </Text>
        </View>

        <Text style={[styles.journalExcerpt, { color: colors.text }]}>
          "Felt energetic today. Gym session was good (pushed 32.5kg on machine chest press), but felt slightly hungry around 5pm."
        </Text>

        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={[styles.mLabel, { color: colors.textMuted }]}>Energy</Text>
            <Text style={[styles.mVal, { color: colors.accent }]}>8 / 10</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[styles.mLabel, { color: colors.textMuted }]}>Mood</Text>
            <Text style={[styles.mVal, { color: colors.text }]}>8 / 10</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[styles.mLabel, { color: colors.textMuted }]}>Hunger</Text>
            <Text style={[styles.mVal, { color: colors.calories }]}>5 / 10</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[styles.mLabel, { color: colors.textMuted }]}>Soreness</Text>
            <Text style={[styles.mVal, { color: colors.textMuted }]}>3 / 10</Text>
          </View>
        </View>
      </Card>

      {/* Injury & Pain Safety Preview */}
      <Card style={styles.card}>
        <View style={styles.iconHeading}>
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: isDark
                  ? 'rgba(16, 185, 129, 0.16)'
                  : 'rgba(5, 150, 105, 0.12)',
              },
            ]}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.accent} />
          </View>
          <View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Pain & Injury Safety Guardrails
            </Text>
            <Text style={[styles.cardSub, { color: colors.textMuted }]}>
              Section 32 Safety Rules
            </Text>
          </View>
        </View>

        <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
          If pain or excessive soreness is recorded, the AI coach avoids aggressive progressive overload, suggests deloads or exercise substitutions, and never provides unqualified medical diagnoses.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  card: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  headerRow: {
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
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  journalExcerpt: {
    fontSize: 14.5,
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  metricItem: {
    alignItems: 'center',
  },
  mLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  mVal: {
    fontSize: 13.5,
    fontWeight: '700',
    marginTop: 2,
  },
  iconHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardSub: {
    fontSize: 11,
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: Spacing.xs,
  },
});
