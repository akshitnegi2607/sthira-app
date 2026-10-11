import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useAppTheme } from '@/hooks/use-theme';

export const NarayanaAppBackground: React.FC = () => {
  const { isDark } = useAppTheme();

  return (
    <View style={styles.backgroundContainer} pointerEvents="none">
      <Image
        source={require('@/../assets/images/narayana_vishwaroop.jpg')}
        style={[
          styles.backgroundImage,
          {
            opacity: isDark ? 0.09 : 0.05,
          },
        ]}
        resizeMode="cover"
      />
      {/* Ambient gradient overlay ensuring text legibility */}
      <View
        style={[
          styles.ambientOverlay,
          {
            backgroundColor: isDark
              ? 'rgba(11, 15, 23, 0.65)'
              : 'rgba(248, 250, 252, 0.70)',
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundContainer: {
    ...StyleSheet.absoluteFill,
    zIndex: -1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    ...StyleSheet.absoluteFill,
  },
  ambientOverlay: {
    ...StyleSheet.absoluteFill,
  },
});
