import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { WeightEntry } from '@/types/database';

interface WeightHistoryListProps {
  entries: WeightEntry[];
  onDelete: (id: string) => Promise<void>;
}

export const WeightHistoryList: React.FC<WeightHistoryListProps> = ({
  entries,
  onDelete,
}) => {
  const { colors, isDark } = useAppTheme();

  // Show latest 7 in reverse chronological order
  const displayEntries = [...entries].reverse().slice(0, 7);

  if (displayEntries.length === 0) return null;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Ionicons name="time-outline" size={16} color={colors.textMuted} />
          <Text style={[styles.title, { color: colors.text }]}>
            Recent Scale Weigh-Ins
          </Text>
        </View>
        <Text style={[styles.sub, { color: colors.textMuted }]}>
          {entries.length} logged
        </Text>
      </View>

      <View style={styles.list}>
        {displayEntries.map((item, idx) => (
          <View
            key={item.id || idx}
            style={[
              styles.itemRow,
              idx > 0 && {
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: colors.cardBorder,
              },
            ]}>
            <View style={styles.itemLeft}>
              <Text style={[styles.dateText, { color: colors.text }]}>
                {item.date}
              </Text>
              {item.notes ? (
                <Text
                  style={[styles.notesText, { color: colors.textMuted }]}
                  numberOfLines={1}>
                  {item.notes}
                </Text>
              ) : null}
            </View>

            <View style={styles.itemRight}>
              <Text style={[styles.weightText, { color: colors.text }]}>
                {item.weight_kg.toFixed(1)}{' '}
                <Text style={[styles.unit, { color: colors.textMuted }]}>
                  kg
                </Text>
              </Text>
              <TouchableOpacity
                onPress={() => onDelete(item.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.deleteBtn}>
                <Ionicons
                  name="trash-outline"
                  size={15}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  sub: {
    fontSize: 12,
  },
  list: {},
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
  },
  itemLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 11,
    marginTop: 2,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  weightText: {
    fontSize: 15,
    fontWeight: '700',
  },
  unit: {
    fontSize: 11,
    fontWeight: '500',
  },
  deleteBtn: {
    padding: 2,
  },
});
