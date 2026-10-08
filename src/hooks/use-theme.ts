import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';

export function useAppTheme() {
  const scheme = useColorScheme();
  const isDark = scheme !== 'light'; // Default to dark for premium calm aesthetic
  const colors = isDark ? Colors.dark : Colors.light;

  return {
    isDark,
    colors,
  };
}

export function useTheme() {
  const { colors } = useAppTheme();
  return colors;
}
