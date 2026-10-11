import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';

interface SthiraBrandLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  showTagline?: boolean;
}

export const SthiraBrandLogo: React.FC<SthiraBrandLogoProps> = ({
  size = 'small',
  showText = true,
  showTagline = false,
}) => {
  const { colors } = useAppTheme();

  const iconDimensions = {
    small: 28,
    medium: 40,
    large: 64,
  }[size];

  const fontSize = {
    small: 18,
    medium: 22,
    large: 30,
  }[size];

  return (
    <View style={styles.container}>
      <Image
        source={require('@/../assets/images/kamal_logo.png')}
        style={[
          styles.logoImage,
          {
            width: iconDimensions,
            height: iconDimensions,
            borderRadius: size === 'large' ? BorderRadius.lg : BorderRadius.sm,
          },
        ]}
        resizeMode="contain"
      />
      {showText && (
        <View style={styles.textCol}>
          <Text style={[styles.brandTitle, { color: colors.text, fontSize }]}>
            Sthira
          </Text>
          {showTagline && (
            <Text style={[styles.tagline, { color: '#FBBF24' }]}>
              नारायणाय समर्पितम्
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoImage: {
    overflow: 'hidden',
  },
  textCol: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginTop: 1,
  },
});
