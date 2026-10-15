import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export async function triggerHaptic(type: 'light' | 'success' | 'selection' | 'warning' = 'light') {
  try {
    if (type === 'light') {
      await Haptics.impact({ style: ImpactStyle.Light });
    } else if (type === 'success') {
      await Haptics.notification({ type: NotificationType.Success });
    } else if (type === 'warning') {
      await Haptics.notification({ type: NotificationType.Warning });
    } else if (type === 'selection') {
      await Haptics.selectionStart();
      await Haptics.selectionChanged();
      await Haptics.selectionEnd();
    }
  } catch {
    // Web fallback if navigator.vibrate is available
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        if (type === 'success') navigator.vibrate([30, 40, 30]);
        else if (type === 'light') navigator.vibrate(15);
        else if (type === 'selection') navigator.vibrate(10);
      }
    } catch {
      // Ignored
    }
  }
}
