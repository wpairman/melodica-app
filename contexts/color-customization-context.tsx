"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface CustomTheme {
  name: string
  backgroundColor: string
  secondaryColor: string
  textColor: string
  accentColor: string
  cardBackground: string
  borderColor: string
  mutedTextColor: string
}

export interface ColorCustomizationContextType {
  customTheme: CustomTheme | null
  isCustomThemeEnabled: boolean
  setCustomTheme: (theme: CustomTheme | null) => void
  enableCustomTheme: (enabled: boolean) => void
  applyCustomTheme: (theme: CustomTheme) => void
  resetToDefault: () => void
  presetThemes: CustomTheme[]
}

const ColorCustomizationContext = createContext<ColorCustomizationContextType | undefined>(undefined)

export const presetThemes: CustomTheme[] = [
  {
    name: "Ocean",
    backgroundColor: "#0f172a",
    secondaryColor: "#0ea5e9",
    textColor: "#f1f5f9",
    accentColor: "#38bdf8",
    cardBackground: "#1e293b",
    borderColor: "#334155",
    mutedTextColor: "#94a3b8"
  },
  {
    name: "Forest",
    backgroundColor: "#0f172a",
    secondaryColor: "#10b981",
    textColor: "#f1f5f9",
    accentColor: "#34d399",
    cardBackground: "#1e293b",
    borderColor: "#334155",
    mutedTextColor: "#94a3b8"
  },
  {
    name: "Sunset",
    backgroundColor: "#0f172a",
    secondaryColor: "#f97316",
    textColor: "#f1f5f9",
    accentColor: "#fb923c",
    cardBackground: "#1e293b",
    borderColor: "#334155",
    mutedTextColor: "#94a3b8"
  },
  {
    name: "Lavender",
    backgroundColor: "#0f172a",
    secondaryColor: "#8b5cf6",
    textColor: "#f1f5f9",
    accentColor: "#a78bfa",
    cardBackground: "#1e293b",
    borderColor: "#334155",
    mutedTextColor: "#94a3b8"
  },
  {
    name: "Rose",
    backgroundColor: "#0f172a",
    secondaryColor: "#f43f5e",
    textColor: "#f1f5f9",
    accentColor: "#fb7185",
    cardBackground: "#1e293b",
    borderColor: "#334155",
    mutedTextColor: "#94a3b8"
  },
  {
    name: "Mint",
    backgroundColor: "#0f172a",
    secondaryColor: "#06d6a0",
    textColor: "#f1f5f9",
    accentColor: "#5eead4",
    cardBackground: "#1e293b",
    borderColor: "#334155",
    mutedTextColor: "#94a3b8"
  },
  {
    name: "Classic Dark",
    backgroundColor: "#0f172a",
    secondaryColor: "#3b82f6",
    textColor: "#f1f5f9",
    accentColor: "#60a5fa",
    cardBackground: "#1e293b",
    borderColor: "#334155",
    mutedTextColor: "#94a3b8"
  },
  {
    name: "High Contrast",
    backgroundColor: "#000000",
    secondaryColor: "#ffffff",
    textColor: "#ffffff",
    accentColor: "#ffffff",
    cardBackground: "#1a1a1a",
    borderColor: "#ffffff",
    mutedTextColor: "#cccccc"
  },
  {
    name: "Warm Dark",
    backgroundColor: "#1c1917",
    secondaryColor: "#f59e0b",
    textColor: "#fef3c7",
    accentColor: "#fbbf24",
    cardBackground: "#292524",
    borderColor: "#44403c",
    mutedTextColor: "#d6d3d1"
  },
  {
    name: "Cool Dark",
    backgroundColor: "#0c0a09",
    secondaryColor: "#06b6d4",
    textColor: "#ecfeff",
    accentColor: "#22d3ee",
    cardBackground: "#1c1917",
    borderColor: "#44403c",
    mutedTextColor: "#a8a29e"
  }
]

export function ColorCustomizationProvider({ children }: { children: React.ReactNode }) {
  const [customTheme, setCustomTheme] = useState<CustomTheme | null>(null)
  const [isCustomThemeEnabled, setIsCustomThemeEnabled] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Load saved theme from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('customTheme')
      const isEnabled = localStorage.getItem('customThemeEnabled') === 'true'
      
      if (savedTheme && isEnabled) {
        try {
          const theme = JSON.parse(savedTheme)
          setCustomTheme(theme)
          setIsCustomThemeEnabled(true)
          applyCustomTheme(theme)
        } catch (error) {
          console.error("Error parsing saved theme:", error)
        }
      }
    }
    setIsInitialized(true)
  }, [])

  const hexToRgbTriplet = (hex: string): string => {
    const cleaned = hex.replace('#', '')
    const bigint = parseInt(cleaned.length === 3
      ? cleaned.split('').map((c) => c + c).join('')
      : cleaned, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return `${r} ${g} ${b}`
  }

  const applyCustomTheme = (theme: CustomTheme) => {
    const root = document.documentElement
    
    // Convert hex colors to space-separated RGB triplets to match current CSS usage
    const bg = hexToRgbTriplet(theme.backgroundColor)
    const text = hexToRgbTriplet(theme.textColor)
    const card = hexToRgbTriplet(theme.cardBackground)
    const border = hexToRgbTriplet(theme.borderColor)
    const primary = hexToRgbTriplet(theme.secondaryColor)
    const accent = hexToRgbTriplet(theme.accentColor)
    const mutedText = hexToRgbTriplet(theme.mutedTextColor)

    // Apply CSS custom properties
    root.style.setProperty('--background', bg)
    root.style.setProperty('--foreground', text)
    root.style.setProperty('--card', card)
    root.style.setProperty('--card-foreground', text)
    root.style.setProperty('--popover', card)
    root.style.setProperty('--popover-foreground', text)
    root.style.setProperty('--primary', primary)
    root.style.setProperty('--primary-foreground', text)
    root.style.setProperty('--secondary', accent)
    root.style.setProperty('--secondary-foreground', text)
    root.style.setProperty('--muted', card)
    root.style.setProperty('--muted-foreground', mutedText)
    root.style.setProperty('--accent', accent)
    root.style.setProperty('--accent-foreground', text)
    root.style.setProperty('--destructive', '239 68 68')
    root.style.setProperty('--destructive-foreground', '255 255 255')
    root.style.setProperty('--border', border)
    root.style.setProperty('--input', border)
    root.style.setProperty('--ring', primary)
    
    // Apply additional custom properties for better control
    root.style.setProperty('--custom-bg', bg)
    root.style.setProperty('--custom-text', text)
    root.style.setProperty('--custom-card', card)
    root.style.setProperty('--custom-border', border)
    root.style.setProperty('--custom-accent', accent)
    root.style.setProperty('--custom-secondary', primary)
    root.style.setProperty('--custom-muted', mutedText)
  }

  const resetToDefault = () => {
    const root = document.documentElement
    
    // Remove all custom properties
    const customProperties = [
      '--background', '--foreground', '--card', '--card-foreground',
      '--popover', '--popover-foreground', '--primary', '--primary-foreground',
      '--secondary', '--secondary-foreground', '--muted', '--muted-foreground',
      '--accent', '--accent-foreground', '--border', '--input', '--ring',
      '--custom-bg', '--custom-text', '--custom-card', '--custom-border',
      '--custom-accent', '--custom-secondary', '--custom-muted'
    ]
    
    customProperties.forEach(prop => {
      root.style.removeProperty(prop)
    })
    
    setCustomTheme(null)
    setIsCustomThemeEnabled(false)
    // Clear localStorage (client-side only)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('customTheme')
      localStorage.removeItem('customThemeEnabled')
    }
  }

  const enableCustomTheme = (enabled: boolean) => {
    setIsCustomThemeEnabled(enabled)
    // Save to localStorage (client-side only)
    if (typeof window !== 'undefined') {
      localStorage.setItem('customThemeEnabled', enabled.toString())
    }
    
    if (!enabled) {
      resetToDefault()
    }
  }

  const handleSetCustomTheme = (theme: CustomTheme | null) => {
    setCustomTheme(theme)
    if (theme) {
      // Save to localStorage (client-side only)
      if (typeof window !== 'undefined') {
        localStorage.setItem('customTheme', JSON.stringify(theme))
      }
      applyCustomTheme(theme)
    }
  }

  return (
    <ColorCustomizationContext.Provider
      value={{
        customTheme,
        isCustomThemeEnabled,
        setCustomTheme: handleSetCustomTheme,
        enableCustomTheme,
        applyCustomTheme,
        resetToDefault,
        presetThemes
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

