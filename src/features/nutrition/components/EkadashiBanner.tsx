/**
 * Sthira — Minimal Ekadashi Observance Banner
 * Ultra-compact single card by default with quick date & countdown;
 * expands on toggle to show athletic fasting tips, spiritual significance,
 * and upcoming 2026-2027 Panchang calendar dates.
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
}) => {
  const { colors, isDark } = useAppTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const status = useMemo(() => {
    return getEkadashiStatus(currentDateStr);
  }, [currentDateStr]);

  const { isToday, todayEvent, isTomorrow, nextEvent, daysUntilNext, upcomingEvents } = status;

  const currentDisplayEvent = isToday && todayEvent ? todayEvent : nextEvent;

  // Gold / saffron spiritual accent tones
  const saffronBg = isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.08)';
  const saffronBorder = isDark ? 'rgba(245, 158, 11, 0.35)' : 'rgba(217, 119, 6, 0.3)';
  const saffronText = isDark ? '#FBBF24' : '#D97706';

  const countdownLabel = isToday
    ? 'Today • Fasting Day'
    : isTomorrow
    ? 'Tomorrow'
    : daysUntilNext === 0
    ? 'Today'
    : `In ${daysUntilNext} days`;

  return (
    <View style={[styles.container, { backgroundColor: saffronBg, borderColor: saffronBorder }]}>
      {/* 1. Minimal Compact Bar (Always Visible) */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.minimalRow}>
        <View style={styles.leftGroup}>
          <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.22)' : 'rgba(245, 158, 11, 0.16)' }]}>
            <Ionicons name="sparkles" size={13} color={saffronText} />
          </View>
          <View style={{ flex: 1, paddingRight: Spacing.xs }}>
            <View style={styles.titleLine}>
              <Text style={[styles.eventName, { color: colors.text }]} numberOfLines={1}>
                {currentDisplayEvent.name}
              </Text>
              <View style={[styles.countdownBadge, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.15)' }]}>
                <Text style={[styles.countdownText, { color: saffronText }]}>
                  {countdownLabel}
                </Text>
              </View>
            </View>
            <Text style={[styles.dateSubtext, { color: colors.textMuted }]} numberOfLines={1}>
              {formatEkadashiDate(currentDisplayEvent.date)} • {currentDisplayEvent.paksha} Paksha
            </Text>
          </View>
        </View>

        <View style={[styles.toggleBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
          <Text style={[styles.toggleBtnText, { color: saffronText }]}>
            {isExpanded ? 'Less' : 'Details'}
          </Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={12}
            color={saffronText}
          />
        </View>
      </TouchableOpacity>

      {/* 2. Detailed View (Revealed on Toggle) */}
      {isExpanded && (
        <View style={[styles.expandedContent, { borderTopColor: saffronBorder }]}>
          <Text style={[styles.significance, { color: colors.textSecondary }]}>
            {currentDisplayEvent.significance}
          </Text>

          {/* Actionable Guidance Box */}
          <View style={[styles.guidanceBox, { backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.7)' }]}>
            <View style={styles.guideRow}>
              <Ionicons name="barbell-outline" size={13} color={saffronText} style={{ marginTop: 2 }} />
              <Text style={[styles.guideText, { color: colors.text }]}>
                <Text style={{ fontWeight: '700' }}>Training: </Text>
                {currentDisplayEvent.recommendedActivity}
              </Text>
            </View>

            <View style={styles.guideRow}>
              <Ionicons name="leaf-outline" size={13} color={saffronText} style={{ marginTop: 2 }} />
              <Text style={[styles.guideText, { color: colors.text }]}>
                <Text style={{ fontWeight: '700' }}>Phalahar: </Text>
                {currentDisplayEvent.nutritionTip}
              </Text>
            </View>
          </View>

          {/* Future Ekadashi Calendar */}
          <View style={styles.futureDatesSection}>
            <Text style={[styles.sectionHeading, { color: saffronText }]}>
              UPCOMING 2026–2027 EKADASHI DATES
            </Text>

            {upcomingEvents.slice(0, 5).map((event, idx) => (
              <View
                key={event.date}
                style={[
                  styles.calendarRow,
                  idx !== upcomingEvents.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  },
                ]}>
                <View style={{ flex: 1.2 }}>
                  <Text style={[styles.calDate, { color: colors.text }]}>
                    {formatEkadashiDate(event.date)}
                  </Text>
                  <Text style={[styles.calPaksha, { color: colors.textMuted }]}>
                    {event.paksha} Paksha
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.calName, { color: colors.text }]}>
                    {event.name}
                  </Text>
                  <Text style={[styles.calSub, { color: colors.textMuted }]} numberOfLines={1}>
                    {event.recommendedActivity}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs + 3,
    marginBottom: Spacing.md,
  },
  minimalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventName: {
    fontSize: 13,
    fontWeight: '800',
  },
  countdownBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: BorderRadius.full,
  },
  countdownText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  dateSubtext: {
    fontSize: 11,
    marginTop: 1,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  expandedContent: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  significance: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  guidanceBox: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    gap: 6,
    marginBottom: Spacing.sm,
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
  futureDatesSection: {
    marginTop: Spacing.xs,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginBottom: Spacing.xs,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  calDate: {
    fontSize: 11,
    fontWeight: '700',
  },
  calPaksha: {
    fontSize: 10,
  },
  calName: {
    fontSize: 11,
    fontWeight: '700',
  },
  calSub: {
    fontSize: 10,
  },
});
