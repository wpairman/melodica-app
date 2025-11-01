"use client"

import { useState, useEffect } from "react"

export type LocationPermissionState = "unknown" | "granted" | "denied" | "prompt" | "not-supported"

export function useLocationPermission() {
  const [permission, setPermission] = useState<LocationPermissionState>("unknown")
  const [isLocationEnabled, setIsLocationEnabled] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setPermission("not-supported")
      return
    }

    // Check current permission status
    checkPermission()
  }, [])

  const checkPermission = async () => {
    try {
      // Modern browsers support Permissions API
      if ('permissions' in navigator) {
        const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
        setPermission(result.state as LocationPermissionState)
        setIsLocationEnabled(result.state === 'granted')
        
        // Listen for permission changes
        result.onchange = () => {
          setPermission(result.state as LocationPermissionState)
          setIsLocationEnabled(result.state === 'granted')
        }
      } else {
        // Fallback for older browsers
        navigator.geolocation.getCurrentPosition(
          () => {
            setPermission("granted")
            setIsLocationEnabled(true)
          },
          (error) => {
            if (error.code === error.PERMISSION_DENIED) {
              setPermission("denied")
              setIsLocationEnabled(false)
            } else {
              setPermission("prompt")
              setIsLocationEnabled(false)
            }
          },
          { maximumAge: 60000 }
        )
      }
    } catch (error) {
      console.error("Error checking location permission:", error)
      setPermission("unknown")
      setIsLocationEnabled(false)
    }
  }

  const requestPermission = (): Promise<boolean> => {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => {
          setPermission("granted")
          setIsLocationEnabled(true)
          resolve(true)
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setPermission("denied")
            setIsLocationEnabled(false)
          } else {
            setPermission("prompt")
            setIsLocationEnabled(false)
          }
          resolve(false)
        }
      )
    })
  }

  return {
    permission,
    isLocationEnabled,
    requestPermission,
    checkPermission
  }
}

