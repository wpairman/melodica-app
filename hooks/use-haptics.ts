"use client"

/**
 * useHaptics – thin wrapper around @capacitor/haptics.
 *
 * Gracefully degrades on web (no-ops) so the same code works in both
 * the Capacitor native shell and a regular browser.
 */

// Synchronous native check – avoids async import round-trip.
function isNativePlatform(): boolean {
  if (typeof window === "undefined") return false
  try {
    // @ts-ignore
    return !!(window.Capacitor && window.Capacitor.isNativePlatform())
  } catch {
    return false
  }
}

async function triggerHaptic(style: "light" | "medium" | "heavy" | "success" | "warning" | "error" = "medium") {
  if (!isNativePlatform()) return
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import("@capacitor/haptics")
    if (style === "success" || style === "warning" || style === "error") {
      const typeMap = {
        success: NotificationType.Success,
        warning: NotificationType.Warning,
        error: NotificationType.Error,
      }
      await Haptics.notification({ type: typeMap[style] })
    } else {
      const styleMap = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy,
      }
      await Haptics.impact({ style: styleMap[style] })
    }
  } catch {
    // Haptics unavailable – silently ignore.
  }
}

export function useHaptics() {
  return {
    impact: (style: "light" | "medium" | "heavy" = "medium") => triggerHaptic(style),
    success: () => triggerHaptic("success"),
    warning: () => triggerHaptic("warning"),
    error: () => triggerHaptic("error"),
  }
}
