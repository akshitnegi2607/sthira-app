import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';

export type StatusType = 'PENDING' | 'ON TRACK' | 'ATTENTION' | 'NEEDS ACTION';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
}) => {
  const { colors, isDark } = useAppTheme();

  const getStatusConfig = () => {
    switch (status) {
      case 'PENDING':
        return {
          textColor: colors.textMuted,
          bgColor: isDark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(100, 116, 139, 0.12)',
          dotColor: colors.textMuted,
          defaultLabel: 'PENDING',
        };
      case 'ON TRACK':
        return {
          textColor: colors.statusOnTrack,
          bgColor: isDark ? 'rgba(16, 185, 129, 0.16)' : 'rgba(5, 150, 105, 0.12)',
          dotColor: colors.statusOnTrack,
          defaultLabel: 'ON TRACK',
        };
      case 'ATTENTION':
        return {
          textColor: colors.statusAttention,
          bgColor: isDark ? 'rgba(245, 158, 11, 0.16)' : 'rgba(217, 119, 6, 0.12)',
          dotColor: colors.statusAttention,
          defaultLabel: 'ATTENTION',
        };
      case 'NEEDS ACTION':
        return {
          textColor: colors.statusAlert,
          bgColor: isDark ? 'rgba(239, 68, 68, 0.16)' : 'rgba(220, 38, 38, 0.12)',
          dotColor: colors.statusAlert,
          defaultLabel: 'NEEDS ACTION',
        };
    }
  };

  const config = getStatusConfig();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.bgColor,
          paddingVertical: isSm ? 3 : 5,
          paddingHorizontal: isSm ? 8 : 12,
        },
      ]}>
      <View style={[styles.dot, { backgroundColor: config.dotColor }]} />
      <Text
        style={[
          styles.text,
          {
            color: config.textColor,
            fontSize: isSm ? 11 : 12,
          },
        ]}>
        {label || config.defaultLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
