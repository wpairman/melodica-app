"use client"

import { useState, useEffect } from "react"

export type LocationPermissionState = "unknown" | "granted" | "denied" | "prompt" | "not-supported"

export function useLocationPermission() {
  const [permission, setPermission] = useState<LocationPermissionState>("unknown")
  const [isLocationEnabled, setIsLocationEnabled] = useState(false)

  const checkViaGetCurrentPosition = () => {
    const nav = typeof window !== 'undefined' ? window.navigator : null
    if (!nav || !('geolocation' in nav)) {
      setPermission("not-supported")
      setIsLocationEnabled(false)
      return
    }

    // Use a timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      setPermission("prompt")
      setIsLocationEnabled(false)
    }, 5000) // 5 second timeout

    nav.geolocation.getCurrentPosition(
      () => {
        clearTimeout(timeoutId)
        setPermission("granted")
        setIsLocationEnabled(true)
      },
      (error: GeolocationPositionError) => {
        clearTimeout(timeoutId)
        // Handle different error codes silently
        if (error.code === error.PERMISSION_DENIED) {
          setPermission("denied")
          setIsLocationEnabled(false)
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setPermission("prompt")
          setIsLocationEnabled(false)
        } else if (error.code === error.TIMEOUT) {
          setPermission("prompt")
          setIsLocationEnabled(false)
        } else {
          setPermission("prompt")
          setIsLocationEnabled(false)
        }
      },
      { 
        maximumAge: 60000,
        timeout: 5000,
        enableHighAccuracy: false
      }
    )
  }

  const checkPermission = async () => {
    try {
      // Modern browsers support Permissions API
      if ('permissions' in navigator) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
          setPermission(result.state as LocationPermissionState)
          setIsLocationEnabled(result.state === 'granted')
          
          // Listen for permission changes
          result.onchange = () => {
            setPermission(result.state as LocationPermissionState)
            setIsLocationEnabled(result.state === 'granted')
          }
        } catch (permError) {
          // Permissions API might not be available or might throw
          // Fall back to checking via getCurrentPosition
          checkViaGetCurrentPosition()
        }
      } else {
        // Fallback for older browsers
        checkViaGetCurrentPosition()
      }
    } catch (error) {
      // Silently handle errors - set to unknown state
      setPermission("unknown")
      setIsLocationEnabled(false)
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setPermission("not-supported")
      return
    }

    // Check current permission status
    checkPermission()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const requestPermission = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
        setPermission("not-supported")
        setIsLocationEnabled(false)
        resolve(false)
        return
      }

      // Set a timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        setPermission("prompt")
        setIsLocationEnabled(false)
        resolve(false)
      }, 10000) // 10 second timeout

      navigator.geolocation.getCurrentPosition(
        () => {
          clearTimeout(timeoutId)
          setPermission("granted")
          setIsLocationEnabled(true)
          resolve(true)
        },
        (error: GeolocationPositionError) => {
          clearTimeout(timeoutId)
          // Handle errors silently - don't log to console
          if (error.code === error.PERMISSION_DENIED) {
            setPermission("denied")
            setIsLocationEnabled(false)
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            setPermission("prompt")
            setIsLocationEnabled(false)
          } else if (error.code === error.TIMEOUT) {
            setPermission("prompt")
            setIsLocationEnabled(false)
          } else {
            setPermission("prompt")
            setIsLocationEnabled(false)
          }
          resolve(false)
        },
        {
          timeout: 10000,
          maximumAge: 0, // Always get fresh position when requesting permission
          enableHighAccuracy: false
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

