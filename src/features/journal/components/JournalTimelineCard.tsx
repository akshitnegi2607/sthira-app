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

export const JournalTimelineCard: React.FC<JournalTimelineCardProps> = ({
  entries,
}) => {
  const { colors, isDark } = useAppTheme();

  if (!entries || entries.length === 0) return null;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="book-outline" size={16} color={colors.textMuted} />
          <Text style={[styles.title, { color: colors.text }]}>
            Recent Reflections Timeline
          </Text>
        </View>
        <Text style={[styles.count, { color: colors.textMuted }]}>
          {entries.length} logged
        </Text>
      </View>

      <View style={styles.timelineList}>
        {entries.slice(0, 6).map((item, idx) => {
          let themes: string[] = [];
          if (item.themes) {
            try {
              themes = JSON.parse(item.themes);
            } catch {
              themes = [item.themes];
            }
          }

          const isMorning = item.entry_type === 'morning';

          return (
            <View
              key={item.id || idx}
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
                      size={11}
                      color={isMorning ? colors.calories : '#818CF8'}
                    />
                    <Text
                      style={[
                        styles.typeText,
                        { color: isMorning ? colors.calories : '#818CF8' },
                      ]}>
                      {isMorning ? 'Morning' : 'Evening'}
                    </Text>
                  </View>

                  <Text style={[styles.dateText, { color: colors.textMuted }]}>
                    {item.date}
                  </Text>
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
                    <Text
                      key={th}
                      style={[styles.themeTag, { color: colors.textMuted }]}>
                      #{th}
                    </Text>
                  ))}
                </View>
              ) : null}
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
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  count: {
    fontSize: 12,
  },
  timelineList: {},
  itemRow: {
    paddingVertical: Spacing.sm + 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 11,
    fontWeight: '500',
  },
  sentimentPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  sentimentText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  notesText: {
    fontSize: 12.5,
    lineHeight: 18,
    fontStyle: 'italic',
    marginTop: 2,
  },
  themesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  themeTag: {
    fontSize: 10,
    fontWeight: '600',
  },
});
