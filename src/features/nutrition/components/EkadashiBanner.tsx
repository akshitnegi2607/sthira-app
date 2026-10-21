/**
 * Sthira — Ekadashi Fasting & Observance Banner
 * Displays upcoming Ekadashi dates, countdown, athletic fasting tips,
 * and multi-week forward planning so Jay can pause heavy gym sessions and plan phalahar.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { getEkadashiStatus, formatEkadashiDate } from '@/services/ekadashiService';

interface EkadashiBannerProps {
  currentDateStr?: string;
  onPressPlanFast?: () => void;
}

export const EkadashiBanner: React.FC<EkadashiBannerProps> = ({
  currentDateStr,
  onPressPlanFast,
}) => {
  const { colors, isDark } = useAppTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const status = useMemo(() => {
    return getEkadashiStatus(currentDateStr);
  }, [currentDateStr]);

  const { isToday, todayEvent, isTomorrow, tomorrowEvent, nextEvent, daysUntilNext, upcomingEvents } = status;

  // Gold / saffron spiritual accent tones
  const saffronBg = isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.08)';
  const saffronBorder = isDark ? 'rgba(245, 158, 11, 0.35)' : 'rgba(217, 119, 6, 0.3)';
  const saffronText = isDark ? '#FBBF24' : '#D97706';

  return (
    <View style={[styles.container, { backgroundColor: saffronBg, borderColor: saffronBorder }]}>
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <View style={[styles.iconPill, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.15)' }]}>
            <Ionicons name="sparkles" size={13} color={saffronText} />
          </View>
          <Text style={[styles.badgeText, { color: saffronText }]}>
            {isToday
              ? 'TODAY IS EKADASHI'
              : isTomorrow
              ? 'EKADASHI TOMORROW'
              : daysUntilNext === 0
              ? 'EKADASHI TODAY'
              : `NEXT EKADASHI IN ${daysUntilNext} DAY${daysUntilNext === 1 ? '' : 'S'}`}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          style={[styles.expandBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.expandBtnText, { color: saffronText }]}>
            {isExpanded ? 'Hide Calendar' : 'View Calendar'}
          </Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={13}
            color={saffronText}
          />
        </TouchableOpacity>
      </View>

      {/* Main Focus Card */}
      <View style={styles.contentBody}>
        <Text style={[styles.title, { color: colors.text }]}>
          {isToday && todayEvent ? todayEvent.name : nextEvent.name}
        </Text>

        <Text style={[styles.dateSubtitle, { color: colors.textSecondary }]}>
          {isToday && todayEvent
            ? formatEkadashiDate(todayEvent.date)
            : formatEkadashiDate(nextEvent.date)}
          {' • '}
          <Text style={{ fontStyle: 'italic' }}>
            {isToday && todayEvent ? todayEvent.paksha : nextEvent.paksha} Paksha
          </Text>
        </Text>

        <Text style={[styles.description, { color: colors.textMuted }]}>
          {isToday && todayEvent ? todayEvent.significance : nextEvent.significance}
        </Text>

        {/* Actionable Athletic & Fasting Guidance */}
        <View style={[styles.guidanceBox, { backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.6)' }]}>
          <View style={styles.guideRow}>
            <Ionicons name="barbell-outline" size={14} color={saffronText} style={{ marginTop: 2 }} />
            <Text style={[styles.guideText, { color: colors.text }]}>
              <Text style={{ fontWeight: '700' }}>Training: </Text>
              {isToday && todayEvent ? todayEvent.recommendedActivity : nextEvent.recommendedActivity}
            </Text>
          </View>

          <View style={styles.guideRow}>
            <Ionicons name="leaf-outline" size={14} color={saffronText} style={{ marginTop: 2 }} />
            <Text style={[styles.guideText, { color: colors.text }]}>
              <Text style={{ fontWeight: '700' }}>Phalahar / Fast: </Text>
              {isToday && todayEvent ? todayEvent.nutritionTip : nextEvent.nutritionTip}
            </Text>
          </View>
        </View>
      </View>

      {/* Expanded Multi-Week Calendar */}
      {isExpanded && (
        <View style={[styles.expandedSection, { borderTopColor: saffronBorder }]}>
          <Text style={[styles.calendarHeading, { color: saffronText }]}>
            UPCOMING EKADASHI DATES (PLAN AHEAD)
          </Text>

          {upcomingEvents.slice(0, 5).map((event, idx) => (
            <View
              key={event.date}
              style={[
                styles.calendarItem,
                idx !== upcomingEvents.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                },
              ]}>
              <View style={styles.calDateCol}>
                <Text style={[styles.calDateText, { color: colors.text }]}>
                  {formatEkadashiDate(event.date)}
                </Text>
                <Text style={[styles.calPakshaText, { color: colors.textMuted }]}>
                  {event.paksha} Paksha
                </Text>
              </View>

              <View style={{ flex: 1, paddingLeft: Spacing.sm }}>
                <Text style={[styles.calNameText, { color: colors.text }]}>
                  {event.name}
                </Text>
                <Text style={[styles.calTipText, { color: colors.textMuted }]} numberOfLines={1}>
                  {event.recommendedActivity}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconPill: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  expandBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  contentBody: {
    marginTop: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  dateSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  guidanceBox: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    gap: 6,
  },
  guideRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  guideText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  expandedSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  calendarHeading: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  calendarItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
  },
  calDateCol: {
    minWidth: 120,
  },
  calDateText: {
    fontSize: 12,
    fontWeight: '700',
  },
  calPakshaText: {
    fontSize: 10,
  },
  calNameText: {
    fontSize: 12,
    fontWeight: '700',
  },
  calTipText: {
    fontSize: 11,
  },
});
