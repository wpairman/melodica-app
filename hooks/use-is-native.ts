"use client"

import { useState, useEffect } from "react"

// Detect synchronously whether we're running inside Capacitor native.
// window.Capacitor is injected by the native bridge before any JS runs,
// so reading it on the initial render avoids a false-web → true-native
// re-render flash on iPad/iPhone.
function detectNativeSync(): boolean {
  if (typeof window === "undefined") return false
  // @ts-ignore – Capacitor injects this global on native platforms
  const cap = (window as any).Capacitor
  if (cap && typeof cap.isNativePlatform === "function") {
    return cap.isNativePlatform()
  }
  return false
}

export function useIsNative(): { isNative: boolean; isLoading: boolean } {
  // Initialise from the synchronous check so the first render is already correct.
  const [isNative, setIsNative] = useState<boolean>(() => detectNativeSync())
  const [isLoading, setIsLoading] = useState(!detectNativeSync())

  useEffect(() => {
    // Confirm via the full module (handles edge-cases where the global isn't
    // yet populated when the function reference is first evaluated).
    import("@capacitor/core")
      .then(({ Capacitor }) => {
        setIsNative(Capacitor.isNativePlatform())
      })
      .catch(() => setIsNative(false))
      .finally(() => setIsLoading(false))
  }, [])

  return { isNative, isLoading }
}
