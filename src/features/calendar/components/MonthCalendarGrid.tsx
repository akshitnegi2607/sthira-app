/**
 * Sthira — Month Calendar Grid Component
 * Renders an interactive monthly calendar with previous/next month navigation,
 * quick "Today" jump, and dot indicators for Workouts, Nutrition, Journal, and Ekadashi.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { CalendarHistoryService, DayOverview } from '@/services/calendarHistoryService';

interface MonthCalendarGridProps {
  year: number;
  month: number; // 1 to 12
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const MonthCalendarGrid: React.FC<MonthCalendarGridProps> = ({
  year,
  month,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onGoToToday,
}) => {
  const { colors, isDark } = useAppTheme();

  const days: DayOverview[] = useMemo(() => {
    return CalendarHistoryService.getMonthOverview(year, month, selectedDate);
  }, [year, month, selectedDate]);

  const monthTitle = `${MONTH_NAMES[month - 1]} ${year}`;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}>
      {/* 1. Header Navigation */}
      <View style={styles.headerRow}>
        <View style={styles.monthNavGroup}>
          <TouchableOpacity
            onPress={onPrevMonth}
            style={[styles.navArrowBtn, { backgroundColor: colors.cardElevated, borderColor: colors.cardBorder }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-back" size={16} color={colors.text} />
          </TouchableOpacity>

          <Text style={[styles.monthTitleText, { color: colors.text }]}>{monthTitle}</Text>

          <TouchableOpacity
            onPress={onNextMonth}
            style={[styles.navArrowBtn, { backgroundColor: colors.cardElevated, borderColor: colors.cardBorder }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-forward" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={onGoToToday}
          style={[
            styles.todayBtn,
            {
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.16)' : 'rgba(16, 185, 129, 0.12)',
              borderColor: 'rgba(16, 185, 129, 0.3)',
            },
          ]}>
          <Ionicons name="calendar-outline" size={13} color={colors.accent} />
          <Text style={[styles.todayBtnText, { color: colors.accent }]}>Today</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Weekday Label Strip */}
      <View style={styles.weekdaysRow}>
        {WEEKDAY_LABELS.map((label, idx) => {
          const isWeekend = idx >= 5;
          return (
            <View key={label} style={styles.weekdayCell}>
              <Text
                style={[
                  styles.weekdayLabel,
                  { color: isWeekend ? colors.textMuted : colors.textSecondary },
                ]}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* 3. Days Grid (Padded Monday-first) */}
      <View style={styles.gridContainer}>
        {days.map((day, idx) => {
          const isSelected = day.isSelected;
          const isToday = day.isToday;
          const isCurrentMonth = day.isCurrentMonth;

          return (
            <TouchableOpacity
              key={`${day.date}_${idx}`}
              activeOpacity={0.7}
              onPress={() => onSelectDate(day.date)}
              style={[
                styles.dayCell,
                isSelected && {
                  backgroundColor: colors.accent,
                  borderRadius: BorderRadius.md,
                },
                !isSelected && isToday && {
                  borderWidth: 1.5,
                  borderColor: colors.accent,
                  borderRadius: BorderRadius.md,
                },
              ]}>
              {/* Day Number */}
              <View style={styles.dayNumberRow}>
                <Text
                  style={[
                    styles.dayNumberText,
                    {
                      color: isSelected
                        ? '#FFFFFF'
                        : isCurrentMonth
                        ? colors.text
                        : colors.textMuted,
                      fontWeight: isSelected || isToday ? '800' : '600',
                      opacity: isCurrentMonth ? 1 : 0.35,
                    },
                  ]}>
                  {day.dayNumber}
                </Text>

                {/* Ekadashi Star Icon */}
                {day.isEkadashi && isCurrentMonth && (
                  <Ionicons
                    name="sparkles"
                    size={9}
                    color={isSelected ? '#FDE047' : '#F59E0B'}
                    style={{ marginLeft: 2 }}
                  />
                )}
              </View>

              {/* Dot Indicators Strip */}
              {isCurrentMonth && (
                <View style={styles.dotsRow}>
                  {/* Workout Dot */}
                  {day.hasWorkout && (
                    <View
                      style={[
                        styles.dot,
                        { backgroundColor: isSelected ? '#FFFFFF' : '#10B981' },
                      ]}
                    />
                  )}

                  {/* Nutrition Dot */}
                  {day.hasNutrition && (
                    <View
                      style={[
                        styles.dot,
                        { backgroundColor: isSelected ? '#FDE047' : '#F97316' },
                      ]}
                    />
                  )}

                  {/* Journal Dot */}
                  {day.hasJournal && (
                    <View
                      style={[
                        styles.dot,
                        { backgroundColor: isSelected ? '#E0E7FF' : '#8B5CF6' },
                      ]}
                    />
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 4. Visual Legend */}
      <View style={[styles.legendRow, { borderTopColor: colors.cardBorder }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={[styles.legendText, { color: colors.textMuted }]}>Workout</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
          <Text style={[styles.legendText, { color: colors.textMuted }]}>Nutrition</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
          <Text style={[styles.legendText, { color: colors.textMuted }]}>Journal</Text>
        </View>

        <View style={styles.legendItem}>
          <Ionicons name="sparkles" size={11} color="#F59E0B" />
          <Text style={[styles.legendText, { color: colors.textMuted }]}>Ekadashi</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  monthNavGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navArrowBtn: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  monthTitleText: {
    fontSize: 15,
    fontWeight: '800',
    minWidth: 130,
    textAlign: 'center',
  },
  todayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  todayBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingVertical: 4,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  dayNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumberText: {
    fontSize: 13,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    marginTop: 3,
    height: 6,
  },
  dot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.5,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
    borderTopWidth: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
