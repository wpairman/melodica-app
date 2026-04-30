"use client"

import { useState, useEffect } from "react"

export function useIsNative(): { isNative: boolean; isLoading: boolean } {
  const [isNative, setIsNative] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    import("@capacitor/core")
      .then(({ Capacitor }) => {
        setIsNative(Capacitor.isNativePlatform())
      })
      .catch(() => setIsNative(false))
      .finally(() => setIsLoading(false))
  }, [])

  return { isNative, isLoading }
}
