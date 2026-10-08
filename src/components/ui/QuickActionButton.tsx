import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';

interface QuickActionButtonProps {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accentColor?: string;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  label,
  iconName,
  onPress,
  accentColor,
}) => {
  const { colors, isDark } = useAppTheme();
  const iconColor = accentColor || colors.accent;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}
      onPress={onPress}>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: isDark
              ? `${iconColor}22`
              : `${iconColor}15`,
          },
        ]}>
        <Ionicons name={iconName} size={22} color={iconColor} />
      </View>
      <Text style={[styles.label, { color: colors.text }]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    margin: Spacing.xs,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
