"use client"

import { useEffect } from "react"

export function PWALifecycle() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Register service worker for offline support (both dev and prod)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered with scope:", registration.scope)
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available, reload to use it
                  console.log('New service worker available. Reloading...')
                  window.location.reload()
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error)
        })
    }
  }, [])

  return null
}
