"use client"

import { useEffect, useState } from "react"

export function PWALifecycle() {
  const [isProduction, setIsProduction] = useState(false)

  useEffect(() => {
    // Check if we're in a production environment by looking at the hostname
    // This prevents service worker registration in preview environments
    const hostname = window.location.hostname
    const isProductionEnvironment =
      !hostname.includes("vusercontent.net") && !hostname.includes("localhost") && !hostname.includes("127.0.0.1")

    setIsProduction(isProductionEnvironment)

    // Only register service worker in production environments
    if (isProductionEnvironment && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered with scope:", registration.scope)
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error)
        })
    } else {
      console.log("Service Worker not registered: not in production environment or not supported")
    }
  }, [])

  return null
}
