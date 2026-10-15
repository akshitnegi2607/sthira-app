import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { JournalEntry } from '@/types/database';

interface JournalTimelineCardProps {
  entries: JournalEntry[];
}

function formatDayHeader(dateStr: string): string {
  try {
    const today = new Date();
    const [y, m, d] = dateStr.split('-').map(Number);
    const itemDate = new Date(y, m - 1, d);

    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    const dayName = itemDate.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = itemDate.toLocaleDateString('en-US', { month: 'short' });

    if (dateStr === todayStr) {
      return `Today • ${dayName}, ${d} ${monthName}`;
    }
    if (dateStr === yesterdayStr) {
      return `Yesterday • ${dayName}, ${d} ${monthName}`;
    }
    return `${itemDate.toLocaleDateString('en-US', { weekday: 'long' })}, ${d} ${monthName}`;
  } catch {
    return dateStr;
  }
}

function formatTimeOnly(isoString?: string): string | null {
  if (!isoString) return null;
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return null;
  }
}

export const JournalTimelineCard: React.FC<JournalTimelineCardProps> = ({
  entries,
}) => {
  const { colors, isDark } = useAppTheme();

  if (!entries || entries.length === 0) return null;

  // Group entries by date
  const dateMap = new Map<string, JournalEntry[]>();
  for (const entry of entries) {
    const d = entry.date;
    if (!dateMap.has(d)) {
      dateMap.set(d, []);
    }
    dateMap.get(d)!.push(entry);
  }

  const sortedDates = Array.from(dateMap.keys()).sort((a, b) => (b > a ? 1 : b < a ? -1 : 0));

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="book-outline" size={18} color={colors.accent} />
          <Text style={[styles.title, { color: colors.text }]}>
            Reflections Timeline
          </Text>
        </View>
        <View style={[styles.countBadge, { backgroundColor: colors.cardElevated, borderColor: colors.cardBorder }]}>
          <Text style={[styles.count, { color: colors.textMuted }]}>
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </Text>
        </View>
      </View>

      <View style={styles.timelineList}>
        {sortedDates.slice(0, 5).map((dateKey, dateIdx) => {
          const dayEntries = dateMap.get(dateKey) || [];
          const headerTitle = formatDayHeader(dateKey);

          return (
            <View key={dateKey} style={[styles.daySection, dateIdx > 0 && styles.daySectionMargin]}>
              {/* Day Section Header */}
              <View
                style={[
                  styles.dayHeaderRow,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F1F5F9',
                    borderColor: colors.cardBorder,
                  },
                ]}>
                <View style={styles.dayHeaderLeft}>
                  <Ionicons name="calendar-outline" size={14} color={colors.accent} />
                  <Text style={[styles.dayHeaderText, { color: colors.text }]}>
                    {headerTitle}
                  </Text>
                </View>
                <Text style={[styles.dayEntryCount, { color: colors.textMuted }]}>
                  {dayEntries.length} {dayEntries.length === 1 ? 'log' : 'logs'}
                </Text>
              </View>

              {/* Day's Entries */}
              <View style={[styles.dayEntriesContainer, { borderColor: colors.cardBorder }]}>
                {dayEntries.map((item, idx) => {
                  let themes: string[] = [];
                  if (item.themes) {
                    try {
                      themes = JSON.parse(item.themes);
                    } catch {
                      themes = [item.themes];
                    }
                  }

                  const isMorning = item.entry_type === 'morning';
                  const timeFormatted = formatTimeOnly(item.created_at);

                  return (
                    <View
                      key={item.id || `${dateKey}_${idx}`}
                      style={[
                        styles.itemRow,
                        idx > 0 && {
                          borderTopWidth: StyleSheet.hairlineWidth,
                          borderTopColor: colors.cardBorder,
                        },
                      ]}>
                      <View style={styles.topRow}>
                        <View style={styles.badgeRow}>
                          <View
                            style={[
                              styles.typeBadge,
                              {
                                backgroundColor: isMorning
                                  ? isDark
                                    ? 'rgba(245, 158, 11, 0.16)'
                                    : 'rgba(217, 119, 6, 0.12)'
                                  : isDark
                                  ? 'rgba(99, 102, 241, 0.16)'
                                  : 'rgba(79, 70, 229, 0.12)',
                                borderColor: isMorning
                                  ? colors.calories
                                  : '#818CF8',
                              },
                            ]}>
                            <Ionicons
                              name={isMorning ? 'sunny-outline' : 'moon-outline'}
                              size={12}
                              color={isMorning ? colors.calories : '#818CF8'}
                            />
                            <Text
                              style={[
                                styles.typeText,
                                { color: isMorning ? colors.calories : '#818CF8' },
                              ]}>
                              {isMorning ? 'Morning Check-In' : 'Evening Wind-Down'}
                            </Text>
                          </View>

                          {timeFormatted && (
                            <Text style={[styles.timeText, { color: colors.textMuted }]}>
                              {timeFormatted}
                            </Text>
                          )}
                        </View>

                        {item.sentiment_label ? (
                          <View
                            style={[
                              styles.sentimentPill,
                              {
                                backgroundColor: colors.cardElevated,
                                borderColor: colors.cardBorder,
                              },
                            ]}>
                            <Text
                              style={[
                                styles.sentimentText,
                                { color: colors.textSecondary },
                              ]}>
                              {item.sentiment_label}
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      <Text style={[styles.notesText, { color: colors.text }]}>
                        "{item.notes}"
                      </Text>

                      {themes.length > 0 ? (
                        <View style={styles.themesRow}>
                          {themes.map((th) => (
                            <View
                              key={th}
                              style={[
                                styles.themeChip,
                                {
                                  backgroundColor: colors.cardElevated,
                                  borderColor: colors.cardBorder,
                                },
                              ]}>
                              <Text
                                style={[styles.themeTag, { color: colors.textMuted }]}>
                                #{th}
                              </Text>
                            </View>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
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
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  count: {
    fontSize: 12,
    fontWeight: '600',
  },
  timelineList: {
    gap: Spacing.md,
  },
  daySection: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  daySectionMargin: {
    marginTop: 4,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: 6,
  },
  dayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dayHeaderText: {
    fontSize: 13,
    fontWeight: '700',
  },
  dayEntryCount: {
    fontSize: 11,
    fontWeight: '500',
  },
  dayEntriesContainer: {
    paddingHorizontal: 6,
  },
  itemRow: {
    paddingVertical: Spacing.sm + 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sentimentPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  sentimentText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  notesText: {
    fontSize: 13.5,
    lineHeight: 20,
    fontStyle: 'italic',
    marginTop: 4,
  },
  themesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  themeChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  themeTag: {
    fontSize: 11,
    fontWeight: '600',
  },
});
