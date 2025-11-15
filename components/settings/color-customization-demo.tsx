"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Palette, Sparkles, RotateCcw } from 'lucide-react'
import { useColorCustomization, SimpleTheme } from '@/contexts/color-customization-context'

const PRESET_THEMES: (SimpleTheme & { name: string })[] = [
  {
    name: "Ocean Blue",
    mainBackground: "#0a1929",
    secondaryBackground: "#132f4c",
    mainText: "#e3f2fd",
    secondaryText: "#90caf9",
    togglesColor: "#2196f3"
  },
  {
    name: "Forest Green",
    mainBackground: "#0d1f0d",
    secondaryBackground: "#1a3a1a",
    mainText: "#e8f5e9",
    secondaryText: "#a5d6a7",
    togglesColor: "#4caf50"
  },
  {
    name: "Sunset Orange",
    mainBackground: "#1a0f0a",
    secondaryBackground: "#3d1f0f",
    mainText: "#fff3e0",
    secondaryText: "#ffcc80",
    togglesColor: "#ff9800"
  },
  {
    name: "Purple Dream",
    mainBackground: "#1a0d1a",
    secondaryBackground: "#3d1f3d",
    mainText: "#f3e5f5",
    secondaryText: "#ce93d8",
    togglesColor: "#9c27b0"
  },
  {
    name: "Midnight",
    mainBackground: "#0a0a0a",
    secondaryBackground: "#1a1a1a",
    mainText: "#f5f5f5",
    secondaryText: "#b0b0b0",
    togglesColor: "#9e9e9e"
  },
  {
    name: "Rose Gold",
    mainBackground: "#1a0f0f",
    secondaryBackground: "#3d1f1f",
    mainText: "#fce4ec",
    secondaryText: "#f8bbd0",
    togglesColor: "#e91e63"
  }
]

export function ColorCustomizationDemo() {
  const { theme, isEnabled, setTheme, enableTheme, resetToDefault } = useColorCustomization()

  const quickThemes = PRESET_THEMES.slice(0, 4)

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Palette className="h-5 w-5" />
          Quick Color Themes
        </CardTitle>
        <CardDescription className="text-gray-300">
          Try different color schemes instantly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-white">Custom Colors:</span>
          <Button
            variant={isEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => enableTheme(!isEnabled)}
            className={isEnabled ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            {isEnabled ? "ON" : "OFF"}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {quickThemes.map((presetTheme) => (
            <button
              key={presetTheme.name}
              onClick={() => {
                setTheme(presetTheme)
                enableTheme(true)
              }}
              className="p-3 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
              style={{ backgroundColor: presetTheme.secondaryBackground }}
            >
              <div className="space-y-2">
                <div className="flex gap-1">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: presetTheme.mainBackground }}
                  />
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: presetTheme.secondaryBackground }}
                  />
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: presetTheme.togglesColor }}
                  />
                </div>
                <span 
                  className="text-xs font-medium block"
                  style={{ color: presetTheme.mainText }}
                >
                  {presetTheme.name}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const randomTheme = PRESET_THEMES[Math.floor(Math.random() * PRESET_THEMES.length)]
              setTheme(randomTheme)
              enableTheme(true)
            }}
            className="flex-1"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Random
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              resetToDefault()
            }}
            className="flex-1"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>

        {theme && (
          <div className="p-3 rounded-lg border" style={{ 
            backgroundColor: theme.secondaryBackground,
            borderColor: theme.secondaryBackground
          }}>
            <p 
              className="text-sm font-medium mb-1"
              style={{ color: theme.mainText }}
            >
              Current Theme Active
            </p>
            <p 
              className="text-xs"
              style={{ color: theme.secondaryText }}
            >
              Customize more colors in Settings
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

