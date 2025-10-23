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

  const applyCustomTheme = (theme: CustomTheme) => {
    const root = document.documentElement
    
    // Apply CSS custom properties
    root.style.setProperty('--background', theme.backgroundColor)
    root.style.setProperty('--foreground', theme.textColor)
    root.style.setProperty('--card', theme.cardBackground)
    root.style.setProperty('--card-foreground', theme.textColor)
    root.style.setProperty('--popover', theme.cardBackground)
    root.style.setProperty('--popover-foreground', theme.textColor)
    root.style.setProperty('--primary', theme.secondaryColor)
    root.style.setProperty('--primary-foreground', theme.textColor)
    root.style.setProperty('--secondary', theme.accentColor)
    root.style.setProperty('--secondary-foreground', theme.textColor)
    root.style.setProperty('--muted', theme.cardBackground)
    root.style.setProperty('--muted-foreground', theme.mutedTextColor)
    root.style.setProperty('--accent', theme.accentColor)
    root.style.setProperty('--accent-foreground', theme.textColor)
    root.style.setProperty('--destructive', '#ef4444')
    root.style.setProperty('--destructive-foreground', '#ffffff')
    root.style.setProperty('--border', theme.borderColor)
    root.style.setProperty('--input', theme.borderColor)
    root.style.setProperty('--ring', theme.secondaryColor)
    
    // Apply additional custom properties for better control
    root.style.setProperty('--custom-bg', theme.backgroundColor)
    root.style.setProperty('--custom-text', theme.textColor)
    root.style.setProperty('--custom-card', theme.cardBackground)
    root.style.setProperty('--custom-border', theme.borderColor)
    root.style.setProperty('--custom-accent', theme.accentColor)
    root.style.setProperty('--custom-secondary', theme.secondaryColor)
    root.style.setProperty('--custom-muted', theme.mutedTextColor)
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

