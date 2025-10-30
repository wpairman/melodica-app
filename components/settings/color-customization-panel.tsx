"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Palette, RotateCcw } from 'lucide-react'
import { useColorCustomization, SimpleTheme } from '@/contexts/color-customization-context'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (color: string) => void
}

function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-white">{label}</Label>
      <div className="flex items-center justify-center">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-20 h-20 rounded-lg border-2 border-gray-600 cursor-pointer bg-transparent hover:border-gray-500 transition-colors"
            style={{ backgroundColor: value }}
          />
          <div className="absolute inset-0 rounded-lg border border-white/20 pointer-events-none" />
        </div>
      </div>
    </div>
  )
}

export function ColorCustomizationPanel() {
  const { theme, isEnabled, setTheme, enableTheme, resetToDefault } = useColorCustomization()

  const [editingTheme, setEditingTheme] = useState<SimpleTheme>({
    mainBackground: "#0f172a",
    secondaryBackground: "#1e293b",
    mainText: "#f1f5f9",
    secondaryText: "#94a3b8",
    togglesColor: "#3b82f6"
  })

  useEffect(() => {
    if (theme) {
      setEditingTheme(theme)
    }
  }, [theme])

  const handleColorChange = (field: keyof SimpleTheme, color: string) => {
    const updated = { ...editingTheme, [field]: color }
    setEditingTheme(updated)
    setTheme(updated)
  }

  const handleReset = () => {
    const defaultTheme: SimpleTheme = {
      mainBackground: "#0f172a",
      secondaryBackground: "#1e293b",
      mainText: "#f1f5f9",
      secondaryText: "#94a3b8",
      togglesColor: "#3b82f6"
    }
    setEditingTheme(defaultTheme)
    setTheme(defaultTheme)
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Palette className="h-5 w-5" />
          Color Customization
        </CardTitle>
        <CardDescription className="text-gray-300">
          Customize your app colors with individual color wheels
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-white">Enable Custom Colors</Label>
            <p className="text-sm text-gray-400">Apply your custom color scheme</p>
          </div>
          <Button
            variant={isEnabled ? "default" : "outline"}
            onClick={() => enableTheme(!isEnabled)}
            className={isEnabled ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            {isEnabled ? "Enabled" : "Disabled"}
          </Button>
        </div>

        {/* Color Pickers */}
        {isEnabled && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-white text-base">Color Settings</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset to Default
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <ColorPicker
                label="Main Background Color"
                value={editingTheme.mainBackground}
                onChange={(color) => handleColorChange('mainBackground', color)}
              />
              
              <ColorPicker
                label="Secondary Background Color"
                value={editingTheme.secondaryBackground}
                onChange={(color) => handleColorChange('secondaryBackground', color)}
              />
              
              <ColorPicker
                label="Main Text Color"
                value={editingTheme.mainText}
                onChange={(color) => handleColorChange('mainText', color)}
              />
              
              <ColorPicker
                label="Secondary Text Color"
                value={editingTheme.secondaryText}
                onChange={(color) => handleColorChange('secondaryText', color)}
              />
              
              < ColorPicker
                label="Toggles Color"
                value={editingTheme.togglesColor}
                onChange={(color) => handleColorChange('togglesColor', color)}
              />
            </div>

            {/* Live Preview */}
            <div className="space-y-3">
              <Label className="text-white">Live Preview</Label>
              <div 
                className="p-4 rounded-lg border"
                style={{ 
                  backgroundColor: editingTheme.secondaryBackground,
                  borderColor: editingTheme.secondaryBackground,
                  color: editingTheme.mainText
                }}
              >
                <div className="space-y-2">
                  <h4 
                    className="font-semibold"
                    style={{ color: editingTheme.mainText }}
                  >
                    Sample Heading
                  </h4>
                  <p 
                    className="text-sm"
                    style={{ color: editingTheme.secondaryText }}
                  >
                    This is sample text to preview your color scheme
                  </p>
                  <button
                    className="px-3 py-1 rounded text-sm font-medium"
                    style={{ 
                      backgroundColor: editingTheme.togglesColor,
                      color: editingTheme.mainText
                    }}
                  >
                    Button / Toggle
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
