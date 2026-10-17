import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export async function triggerSuccessHaptic(): Promise<void> {
  try {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.([40, 60, 80]);
    }
  } catch {
    // Fail silently on unsupported environments
  }
}

export async function triggerLightHaptic(): Promise<void> {
  try {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.(25);
    }
  } catch {
    // Fail silently on unsupported environments
  }
}

export async function triggerMediumHaptic(): Promise<void> {
  try {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.(50);
    }
  } catch {
    // Fail silently on unsupported environments
  }
}
