"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Palette, Sparkles, RotateCcw } from 'lucide-react'
import { useColorCustomization } from '@/contexts/color-customization-context'

export function ColorCustomizationDemo() {
  const { customTheme, isCustomThemeEnabled, presetThemes, setCustomTheme, enableCustomTheme } = useColorCustomization()

  const quickThemes = presetThemes.slice(0, 4)

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
            variant={isCustomThemeEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => enableCustomTheme(!isCustomThemeEnabled)}
            className={isCustomThemeEnabled ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            {isCustomThemeEnabled ? "ON" : "OFF"}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {quickThemes.map((theme) => (
            <button
              key={theme.name}
              onClick={() => {
                setCustomTheme(theme)
                enableCustomTheme(true)
              }}
              className="p-3 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
              style={{ backgroundColor: theme.cardBackground }}
            >
              <div className="space-y-2">
                <div className="flex gap-1">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: theme.backgroundColor }}
                  />
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: theme.secondaryColor }}
                  />
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: theme.accentColor }}
                  />
                </div>
                <span 
                  className="text-xs font-medium block"
                  style={{ color: theme.textColor }}
                >
                  {theme.name}
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
              const randomTheme = presetThemes[Math.floor(Math.random() * presetThemes.length)]
              setCustomTheme(randomTheme)
              enableCustomTheme(true)
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
              enableCustomTheme(false)
            }}
            className="flex-1"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>

        {customTheme && (
          <div className="p-3 rounded-lg border" style={{ 
            backgroundColor: customTheme.cardBackground,
            borderColor: customTheme.borderColor
          }}>
            <p 
              className="text-sm font-medium mb-1"
              style={{ color: customTheme.textColor }}
            >
              Current Theme: {customTheme.name}
            </p>
            <p 
              className="text-xs"
              style={{ color: customTheme.mutedTextColor }}
            >
              Customize more colors in Settings
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

