import { Platform } from 'react-native';

export const Colors = {
  dark: {
    background: '#0B0F17',
    backgroundSubtle: '#0F1622',
    card: '#141D2B',
    cardElevated: '#1A2536',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#8192A9',
    textInverse: '#0B0F17',
    accent: '#10B981', // Emerald for on-track / primary
    accentMuted: 'rgba(16, 185, 129, 0.15)',
    statusOnTrack: '#10B981',
    statusAttention: '#F59E0B',
    statusAlert: '#EF4444',
    calories: '#F59E0B',
    protein: '#38BDF8',
    water: '#60A5FA',
    sleep: '#A78BFA',
    workout: '#34D399',
    divider: 'rgba(255, 255, 255, 0.08)',
    tabBar: '#0E1420',
    tabBarBorder: 'rgba(255, 255, 255, 0.06)',
  },
  light: {
    background: '#0B0F17',
    backgroundSubtle: '#0F1622',
    card: '#141D2B',
    cardElevated: '#1A2536',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#8192A9',
    textInverse: '#0B0F17',
    accent: '#10B981',
    accentMuted: 'rgba(16, 185, 129, 0.15)',
    statusOnTrack: '#10B981',
    statusAttention: '#F59E0B',
    statusAlert: '#EF4444',
    calories: '#F59E0B',
    protein: '#38BDF8',
    water: '#60A5FA',
    sleep: '#A78BFA',
    workout: '#34D399',
    divider: 'rgba(255, 255, 255, 0.08)',
    tabBar: '#0E1420',
    tabBarBorder: 'rgba(255, 255, 255, 0.06)',
  },
} as const;

export type ThemeColors = typeof Colors.dark;

export const Typography = {
  family: Platform.select({
    ios: {
      sans: 'System',
      mono: 'Menlo',
    },
    default: {
      sans: 'Roboto',
      mono: 'monospace',
    },
    web: {
      sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    },
  }),
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
} as const;
