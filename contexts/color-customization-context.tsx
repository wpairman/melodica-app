"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface SimpleTheme {
  mainBackground: string      // Main background color
  secondaryBackground: string // Secondary background color (cards, panels)
  mainText: string           // Main text color
  secondaryText: string      // Secondary text color
  togglesColor: string       // Toggles/buttons/primary elements color
}

export interface ColorCustomizationContextType {
  theme: SimpleTheme | null
  isEnabled: boolean
  setTheme: (theme: SimpleTheme | null) => void
  enableTheme: (enabled: boolean) => void
  resetToDefault: () => void
}

const ColorCustomizationContext = createContext<ColorCustomizationContextType | undefined>(undefined)

const DEFAULT_THEME: SimpleTheme = {
  mainBackground: "#0f172a",
  secondaryBackground: "#1e293b",
  mainText: "#f1f5f9",
  secondaryText: "#94a3b8",
  togglesColor: "#3b82f6"
}

export function ColorCustomizationProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<SimpleTheme | null>(null)
  const [isEnabled, setIsEnabled] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Load saved theme from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('simpleTheme')
      const isEnabledSaved = localStorage.getItem('simpleThemeEnabled') === 'true'
      
      if (savedTheme && isEnabledSaved) {
        try {
          const parsed = JSON.parse(savedTheme)
          setThemeState(parsed)
          setIsEnabled(true)
          applyTheme(parsed)
        } catch (error) {
          console.error("Error parsing saved theme:", error)
        }
      }
    }
    setIsInitialized(true)
  }, [])

  const hexToRgbTriplet = (hex: string): string => {
    const cleaned = hex.replace('#', '')
    const full = cleaned.length === 3 ? cleaned.split('').map((c) => c + c).join('') : cleaned
    const bigint = parseInt(full, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return `${r} ${g} ${b}`
  }

  const applyTheme = (customTheme: SimpleTheme) => {
    const root = document.documentElement
    
    // Convert hex to RGB triplets
    const mainBg = hexToRgbTriplet(customTheme.mainBackground)
    const secondaryBg = hexToRgbTriplet(customTheme.secondaryBackground)
    const mainTxt = hexToRgbTriplet(customTheme.mainText)
    const secondaryTxt = hexToRgbTriplet(customTheme.secondaryText)
    const toggles = hexToRgbTriplet(customTheme.togglesColor)

    // Apply directly to CSS variables - these will override everything
    root.style.setProperty('--background', mainBg)
    root.style.setProperty('--foreground', mainTxt)
    root.style.setProperty('--card', secondaryBg)
    root.style.setProperty('--card-foreground', mainTxt)
    root.style.setProperty('--popover', secondaryBg)
    root.style.setProperty('--popover-foreground', mainTxt)
    root.style.setProperty('--primary', toggles)
    root.style.setProperty('--primary-foreground', mainTxt)
    root.style.setProperty('--secondary', secondaryBg)
    root.style.setProperty('--secondary-foreground', mainTxt)
    root.style.setProperty('--muted', secondaryBg)
    root.style.setProperty('--muted-foreground', secondaryTxt)
    root.style.setProperty('--accent', toggles)
    root.style.setProperty('--accent-foreground', mainTxt)
    root.style.setProperty('--border', secondaryBg)
    root.style.setProperty('--input', secondaryBg)
    root.style.setProperty('--ring', toggles)
    
    // Apply body background directly
    if (typeof document !== 'undefined') {
      document.body.style.backgroundColor = customTheme.mainBackground
      document.body.style.color = customTheme.mainText
    }
  }

  const resetToDefault = () => {
    const root = document.documentElement
    
    // Remove all custom properties
    const customProperties = [
      '--background', '--foreground', '--card', '--card-foreground',
      '--popover', '--popover-foreground', '--primary', '--primary-foreground',
      '--secondary', '--secondary-foreground', '--muted', '--muted-foreground',
      '--accent', '--accent-foreground', '--border', '--input', '--ring'
    ]
    
    customProperties.forEach(prop => {
      root.style.removeProperty(prop)
    })
    
    if (typeof document !== 'undefined') {
      document.body.style.removeProperty('background-color')
      document.body.style.removeProperty('color')
    }
    
    setThemeState(null)
    setIsEnabled(false)
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('simpleTheme')
      localStorage.removeItem('simpleThemeEnabled')
    }
  }

  const enableTheme = (enabled: boolean) => {
    setIsEnabled(enabled)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('simpleThemeEnabled', enabled.toString())
    }
    
    if (enabled && theme) {
      applyTheme(theme)
    } else if (!enabled) {
      resetToDefault()
    }
  }

  const handleSetTheme = (newTheme: SimpleTheme | null) => {
    setThemeState(newTheme)
    if (newTheme) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('simpleTheme', JSON.stringify(newTheme))
      }
      if (isEnabled) {
        applyTheme(newTheme)
      }
    }
  }

  return (
    <ColorCustomizationContext.Provider
      value={{
        theme,
        isEnabled,
        setTheme: handleSetTheme,
        enableTheme,
        resetToDefault
      }}
    >
      {children}
    </ColorCustomizationContext.Provider>
  )
}

export function useColorCustomization() {
  const context = useContext(ColorCustomizationContext)
  if (context === undefined) {
    throw new Error('useColorCustomization must be used within a ColorCustomizationProvider')
  }
  return context
}
