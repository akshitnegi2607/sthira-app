import React from 'react';
import { View, StyleSheet, ViewProps, ViewStyle } from 'react-native';
import { useAppTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';

interface CardProps extends ViewProps {
  elevated?: boolean;
  style?: ViewStyle;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ elevated = false, style, children, ...props }) => {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: elevated ? colors.cardElevated : colors.card,
          borderColor: colors.cardBorder,
        },
        style,
      ]}
      {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
});
