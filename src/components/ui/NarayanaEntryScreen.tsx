import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';

interface NarayanaEntryScreenProps {
  onReadyToEnter: () => void;
  isReady: boolean;
}

export const NarayanaEntryScreen: React.FC<NarayanaEntryScreenProps> = ({
  onReadyToEnter,
  isReady,
}) => {
  const { colors, isDark } = useAppTheme();
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Smooth fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Auto transition after brief sacred entry moment
    const timer = setTimeout(() => {
      if (isReady) {
        onReadyToEnter();
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [isReady, onReadyToEnter, fadeAnim]);

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      style={styles.container}
      onPress={() => {
        if (isReady) onReadyToEnter();
      }}>
      {/* Full-screen Background of Lord Narayana */}
      <Image
        source={require('@/../assets/images/narayana_vishwaroop.jpg')}
        style={styles.bgImage}
        resizeMode="cover"
      />

      {/* Dark Vignette Overlay */}
      <View style={styles.darkOverlay} />

      {/* Animated Sacred Content */}
      <Animated.View style={[styles.contentWrap, { opacity: fadeAnim }]}>
        {/* Kamal Logo */}
        <View style={styles.lotusWrapper}>
          <Image
            source={require('@/../assets/images/kamal_logo.png')}
            style={styles.lotusImage}
            resizeMode="contain"
          />
        </View>

        {/* Brand Name */}
        <Text style={styles.brandTitle}>Sthira</Text>

        {/* Sacred Tagline */}
        <View style={styles.taglineBox}>
          <Text style={styles.sacredTagline}>नारायणाय समर्पितम्</Text>
          <Text style={styles.taglineSub}>Dedicated to Narayana</Text>
        </View>

        {/* Shloka */}
        <View style={styles.shlokaBox}>
          <Text style={styles.shlokaLine}>
            अनेकबाहूदरवक्त्रनेत्रं पश्यामि त्वां सर्वतोऽनन्तरूपम् ।
          </Text>
          <Text style={styles.shlokaLine}>
            नान्तं न मध्यं न पुनस्तवादिं पश्यामि विश्वेश्वर विश्वरूप ॥
          </Text>
          <Text style={styles.shlokaRef}>— श्रीमद्भगवद्गीता ११.१६</Text>
        </View>

        {/* Entry Status / Tap Prompt */}
        <View style={styles.footerPrompt}>
          {!isReady ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#FBBF24" />
              <Text style={styles.enteringText}>Initializing your space...</Text>
            </View>
          ) : (
            <View style={styles.touchPrompt}>
              <Text style={styles.touchText}>ॐ नमो नारायणाय • Tap to enter</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F17',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgImage: {
    width: '100%',
    height: '100%',
    ...StyleSheet.absoluteFill,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(8, 12, 20, 0.62)',
  },
  contentWrap: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    zIndex: 2,
    maxWidth: 440,
  },
  lotusWrapper: {
    width: 74,
    height: 74,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.45)', // Warm gold
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: Spacing.md,
  },
  lotusImage: {
    width: '100%',
    height: '100%',
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  taglineBox: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  sacredTagline: {
    color: '#FBBF24', // Divine Gold
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  taglineSub: {
    color: 'rgba(255, 255, 255, 0.70)',
    fontSize: 12.5,
    fontWeight: '500',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  shlokaBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  shlokaLine: {
    color: '#E2E8F0',
    fontSize: 12.5,
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  shlokaRef: {
    color: '#FBBF24',
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: 0.6,
  },
  footerPrompt: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  enteringText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 12.5,
    fontWeight: '500',
  },
  touchPrompt: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.35)',
  },
  touchText: {
    color: '#FDE68A',
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});
