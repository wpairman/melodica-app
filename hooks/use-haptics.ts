"use client"

/**
 * useHaptics – thin wrapper around @capacitor/haptics.
 *
 * On native iOS the device will produce real haptic feedback.
 * On web the calls are silently no-ops so the hook is safe to call everywhere.
 */
export function useHaptics() {
  const triggerLight = async () => {
    try {
      const { Haptics, ImpactStyle } = await import("@capacitor/haptics")
      await Haptics.impact({ style: ImpactStyle.Light })
    } catch {
      // Not available on web – ignore
    }
  }

  const triggerMedium = async () => {
    try {
      const { Haptics, ImpactStyle } = await import("@capacitor/haptics")
      await Haptics.impact({ style: ImpactStyle.Medium })
    } catch {
      // Not available on web – ignore
    }
  }

  const triggerHeavy = async () => {
    try {
      const { Haptics, ImpactStyle } = await import("@capacitor/haptics")
      await Haptics.impact({ style: ImpactStyle.Heavy })
    } catch {
      // Not available on web – ignore
    }
  }

  const triggerSuccess = async () => {
    try {
      const { Haptics, NotificationType } = await import("@capacitor/haptics")
      await Haptics.notification({ type: NotificationType.Success })
    } catch {
      // Not available on web – ignore
    }
  }

  const triggerWarning = async () => {
    try {
      const { Haptics, NotificationType } = await import("@capacitor/haptics")
      await Haptics.notification({ type: NotificationType.Warning })
    } catch {
      // Not available on web – ignore
    }
  }

  const triggerError = async () => {
    try {
      const { Haptics, NotificationType } = await import("@capacitor/haptics")
      await Haptics.notification({ type: NotificationType.Error })
    } catch {
      // Not available on web – ignore
    }
  }

  return {
    triggerLight,
    triggerMedium,
    triggerHeavy,
    triggerSuccess,
    triggerWarning,
    triggerError,
  }
}
