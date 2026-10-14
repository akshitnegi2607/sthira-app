import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';

export function useAppTheme() {
  // Sthira is strictly designed around a signature calm, premium obsidian aesthetic.
  // Lock to dark mode permanently so device light-mode settings never bleach the header or footer.
  return {
    isDark: true,
    colors: Colors.dark,
  };
}

export function useTheme() {
  const { colors } = useAppTheme();
  return colors;
}
