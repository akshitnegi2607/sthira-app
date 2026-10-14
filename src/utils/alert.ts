import { Alert, Platform } from 'react-native';

export interface AlertButton {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

/**
 * Cross-platform alert utility.
 * In React Native Web, Alert.alert is an empty no-op.
 * This helper uses window.confirm and window.alert on web so buttons and actions work reliably.
 */
export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[]
): void {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    if (!buttons || buttons.length <= 1) {
      const fullMsg = title + (message ? `\n\n${message}` : '');
      window.alert(fullMsg);
      if (buttons && buttons[0]?.onPress) {
        buttons[0].onPress();
      }
      return;
    }

    // Confirmation dialog (multiple buttons)
    const cancelBtn = buttons.find((b) => b.style === 'cancel');
    const confirmBtn =
      buttons.find((b) => b.style === 'destructive' || b.style === 'default') ||
      buttons.find((b) => b !== cancelBtn) ||
      buttons[buttons.length - 1];

    const confirmed = window.confirm(
      (title ? `${title}\n\n` : '') + (message || 'Are you sure you want to proceed?')
    );

    if (confirmed) {
      confirmBtn?.onPress?.();
    } else {
      cancelBtn?.onPress?.();
    }
    return;
  }

  // Native iOS & Android
  Alert.alert(title, message, buttons);
}
