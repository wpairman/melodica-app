"use client"

import { useState, useEffect } from "react"

// Synchronously detect native platform on first render to avoid flash.
// Capacitor sets window.Capacitor before any JS runs in a native WebView,
// so we can check it synchronously without waiting for an async import.
function detectNativeSync(): boolean {
  if (typeof window === "undefined") return false
  try {
    // @ts-ignore – Capacitor injects this global in the native WebView
    return !!(window.Capacitor && window.Capacitor.isNativePlatform())
  } catch {
    return false
  }
}

/**
 * Returns { isNative, isLoading }.
 *
 * The synchronous check makes isLoading start as false on native platforms
 * so that callers never render a blank loading state in the Capacitor WebView,
 * which previously caused the iPad flash-back-to-homepage issue (2.1a).
 */
export function useIsNative(): { isNative: boolean; isLoading: boolean } {
  // Initialize synchronously so the very first render already knows the platform.
  const [isNative] = useState<boolean>(() => detectNativeSync())
  // isLoading is always false because we detect synchronously.
  // Kept in the return value for backward compatibility with existing callers.
  const [isLoading] = useState(false)

  return { isNative, isLoading }
}
