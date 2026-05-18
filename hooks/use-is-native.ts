"use client"

import { useState, useEffect } from "react"

// Detect native platform synchronously using multiple reliable signals.
// capacitor.config.ts sets iosScheme: 'https', so the app is served from
// https://localhost (no port) on native iOS — never from a real domain.
function detectNativeSync(): boolean {
  if (typeof window === "undefined") return false
  try {
    // Primary: Capacitor global injected by native bridge before any JS runs
    const cap = (window as any).Capacitor
    if (cap && typeof cap.isNativePlatform === "function") {
      return cap.isNativePlatform()
    }
    // Fallback: with iosScheme: 'https', native iOS serves from https://localhost (no port).
    // Production web is always a real domain. Local dev uses a port (e.g. :3000).
    // So hostname=localhost + no port = definitively native.
    if (
      window.location.hostname === "localhost" &&
      (window.location.port === "" || window.location.port === "443")
    ) {
      return true
    }
  } catch {
    return false
  }
  return false
}

export function useIsNative(): { isNative: boolean; isLoading: boolean } {
  const [isNative, setIsNative] = useState<boolean>(() => detectNativeSync())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Confirm via the full Capacitor module after hydration
    import("@capacitor/core")
      .then(({ Capacitor }) => {
        setIsNative(Capacitor.isNativePlatform())
      })
      .catch(() => {
        // If module fails, keep the sync result but also try hostname check
        setIsNative(detectNativeSync())
      })
      .finally(() => setIsLoading(false))
  }, [])

  return { isNative, isLoading }
}
