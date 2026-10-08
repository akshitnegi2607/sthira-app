import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '@/hooks/use-theme';
import { BorderRadius } from '@/constants/theme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  height?: number;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color,
  height = 8,
  style,
}) => {
  const { colors } = useAppTheme();
  const clamped = Math.min(Math.max(progress, 0), 1);
  const barColor = color || colors.accent;

  return (
    <View
      style={[
        styles.track,
        {
          height,
          backgroundColor: colors.cardBorder,
        },
        style,
      ]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clamped * 100}%`,
            backgroundColor: barColor,
            height,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: BorderRadius.full,
  },
});
