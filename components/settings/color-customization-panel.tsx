"use client"

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Palette, Eye, RotateCcw, Sparkles, Save, Trash2, Upload } from 'lucide-react'
import { CustomTheme, useColorCustomization } from '@/contexts/color-customization-context'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (color: string) => void
  description?: string
}

export function ColorPicker({ label, value, onChange, description }: ColorPickerProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const generateShades = (color: string) => {
    // Generate lighter and darker shades of the color
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)

    const shades = []
    for (let i = 0; i < 5; i++) {
      const factor = 0.2 + (i * 0.2)
      const newR = Math.round(r + (255 - r) * factor)
      const newG = Math.round(g + (255 - g) * factor)
      const newB = Math.round(b + (255 - b) * factor)
      shades.push(`#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`)
    }
    return shades
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">{label}</Label>
          {description && (
            <p className="text-xs text-gray-400 mt-1">{description}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs"
        >
          {showAdvanced ? 'Simple' : 'Advanced'}
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-12 rounded-lg border-2 border-gray-600 cursor-pointer bg-transparent"
            style={{ backgroundColor: value }}
          />
          <div className="absolute inset-0 rounded-lg border border-white/20 pointer-events-none" />
        </div>

        <div className="flex-1">
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#ffffff"
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
        </div>
      </div>

      {showAdvanced && (
        <div className="space-y-2">
          <Label className="text-xs text-gray-400">Quick Shades</Label>
          <div className="flex gap-1">
            {generateShades(value).map((shade, index) => (
              <button
                key={index}
                onClick={() => onChange(shade)}
                className="w-8 h-8 rounded border border-gray-600 hover:scale-110 transition-transform"
                style={{ backgroundColor: shade }}
                title={shade}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface ThemePreviewProps {
  theme: CustomTheme
  isSelected?: boolean
  onClick?: () => void
}

export function ThemePreview({ theme, isSelected, onClick }: ThemePreviewProps) {
  return (
    <button
      onClick={onClick}
      className={`relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
        isSelected 
          ? 'border-blue-500 ring-2 ring-blue-500/20' 
          : 'border-gray-600 hover:border-gray-500'
      }`}
      style={{ backgroundColor: theme.cardBackground }}
    >
      <div className="space-y-2">
        {/* Header */}
        <div 
          className="h-3 rounded"
          style={{ backgroundColor: theme.backgroundColor }}
        />
        
        {/* Content */}
        <div className="space-y-1">
          <div 
            className="h-2 rounded w-3/4"
            style={{ backgroundColor: theme.textColor }}
          />
          <div 
            className="h-2 rounded w-1/2"
            style={{ backgroundColor: theme.mutedTextColor }}
          />
        </div>
        
        {/* Button */}
        <div 
          className="h-2 rounded w-1/3"
          style={{ backgroundColor: theme.secondaryColor }}
        />
        
        {/* Accent */}
        <div 
          className="h-1 rounded w-1/4"
          style={{ backgroundColor: theme.accentColor }}
        />
      </div>
      
      <div className="mt-2 text-center">
        <span 
          className="text-xs font-medium"
          style={{ color: theme.textColor }}
        >
          {theme.name}
        </span>
      </div>
      
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
        </div>
      )}
    </button>
  )
}

export function ColorCustomizationPanel() {
  const {
    customTheme,
    isCustomThemeEnabled,
    setCustomTheme,
    enableCustomTheme,
    applyCustomTheme,
    resetToDefault,
    presetThemes
  } = useColorCustomization()

  const [editingTheme, setEditingTheme] = useState<CustomTheme>(
    customTheme || {
      name: "Custom",
      backgroundColor: "#0f172a",
      secondaryColor: "#3b82f6",
      textColor: "#f1f5f9",
      accentColor: "#60a5fa",
      cardBackground: "#1e293b",
      borderColor: "#334155",
      mutedTextColor: "#94a3b8"
    }
  )

  // Saved palettes (local-only)
  const [savedPalettes, setSavedPalettes] = useState<CustomTheme[]>([])
  const [newPaletteName, setNewPaletteName] = useState("")

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('savedPalettes')
        if (raw) setSavedPalettes(JSON.parse(raw))
      } catch {}
    }
  }, [])

  const persistPalettes = (palettes: CustomTheme[]) => {
    setSavedPalettes(palettes)
    if (typeof window !== 'undefined') {
      localStorage.setItem('savedPalettes', JSON.stringify(palettes))
    }
  }

  const handlePresetSelect = (preset: CustomTheme) => {
    setEditingTheme(preset)
    setCustomTheme(preset)
  }

  const handleResetToSelectedPreset = () => {
    if (!customTheme) return
    setEditingTheme(customTheme)
    setCustomTheme(customTheme)
  }

  const handleCustomThemeUpdate = (field: keyof CustomTheme, value: string) => {
    const updated = { ...editingTheme, [field]: value }
    setEditingTheme(updated)
    setCustomTheme(updated)
  }

  const generateRandomTheme = () => {
    const colors = [
      { bg: "#0f172a", card: "#1e293b", border: "#334155" },
      { bg: "#1c1917", card: "#292524", border: "#44403c" },
      { bg: "#0c0a09", card: "#1c1917", border: "#44403c" },
      { bg: "#1a1a1a", card: "#2a2a2a", border: "#404040" }
    ]
    
    const accents = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#84cc16"]
    
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    const randomAccent = accents[Math.floor(Math.random() * accents.length)]
    
    const newTheme: CustomTheme = {
      name: "Random",
      backgroundColor: randomColor.bg,
      secondaryColor: randomAccent,
      textColor: "#f1f5f9",
      accentColor: randomAccent,
      cardBackground: randomColor.card,
      borderColor: randomColor.border,
      mutedTextColor: "#94a3b8"
    }
    
    setEditingTheme(newTheme)
    setCustomTheme(newTheme)
  }

  const saveCurrentAsPalette = () => {
    const name = newPaletteName.trim() || editingTheme.name || 'Custom'
    const palette: CustomTheme = { ...editingTheme, name }
    const updated = [palette, ...savedPalettes.filter(p => p.name !== name)]
    persistPalettes(updated)
    setNewPaletteName("")
  }

  const applySavedPalette = (palette: CustomTheme) => {
    setEditingTheme(palette)
    setCustomTheme(palette)
  }

  const deleteSavedPalette = (name: string) => {
    persistPalettes(savedPalettes.filter(p => p.name !== name))
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Palette className="h-5 w-5" />
          Color Customization
        </CardTitle>
        <CardDescription className="text-gray-300">
          Customize the colors and appearance of your app
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
            variant={isCustomThemeEnabled ? "default" : "outline"}
            onClick={() => enableCustomTheme(!isCustomThemeEnabled)}
            className={isCustomThemeEnabled ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            {isCustomThemeEnabled ? "Enabled" : "Disabled"}
          </Button>
        </div>

        {/* Preset Themes */}
        <div className="space-y-3">
          <Label className="text-white">Preset Themes</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {presetThemes.map((preset) => (
              <ThemePreview
                key={preset.name}
                theme={preset}
                isSelected={customTheme?.name === preset.name}
                onClick={() => handlePresetSelect(preset)}
              />
            ))}
          </div>
          {customTheme && (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={handleResetToSelectedPreset} className="text-xs">
                <RotateCcw className="h-3 w-3 mr-1" /> Reset to selected preset
              </Button>
            </div>
          )}
        </div>

        {/* Custom Color Controls */}
        {isCustomThemeEnabled && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-white">Custom Colors</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateRandomTheme}
                  className="text-xs"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Random
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetToDefault}
                  className="text-xs"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ColorPicker
                label="Background Color"
                value={editingTheme.backgroundColor}
                onChange={(color) => handleCustomThemeUpdate('backgroundColor', color)}
                description="Main background color"
              />
              
              <ColorPicker
                label="Card Background"
                value={editingTheme.cardBackground}
                onChange={(color) => handleCustomThemeUpdate('cardBackground', color)}
                description="Card and panel backgrounds"
              />
              
              <ColorPicker
                label="Text Color"
                value={editingTheme.textColor}
                onChange={(color) => handleCustomThemeUpdate('textColor', color)}
                description="Primary text color"
              />
              
              <ColorPicker
                label="Muted Text"
                value={editingTheme.mutedTextColor}
                onChange={(color) => handleCustomThemeUpdate('mutedTextColor', color)}
                description="Secondary text color"
              />
              
              <ColorPicker
                label="Primary Color"
                value={editingTheme.secondaryColor}
                onChange={(color) => handleCustomThemeUpdate('secondaryColor', color)}
                description="Buttons and primary elements"
              />
              
              <ColorPicker
                label="Accent Color"
                value={editingTheme.accentColor}
                onChange={(color) => handleCustomThemeUpdate('accentColor', color)}
                description="Highlights and accents"
              />
              
              <ColorPicker
                label="Border Color"
                value={editingTheme.borderColor}
                onChange={(color) => handleCustomThemeUpdate('borderColor', color)}
                description="Borders and dividers"
              />
            </div>

            {/* Live Preview */}
            <div className="space-y-3">
              <Label className="text-white">Live Preview</Label>
              <div 
                className="p-4 rounded-lg border"
                style={{ 
                  backgroundColor: editingTheme.cardBackground,
                  borderColor: editingTheme.borderColor
                }}
              >
                <div className="space-y-2">
                  <h4 
                    className="font-semibold"
                    style={{ color: editingTheme.textColor }}
                  >
                    Sample Heading
                  </h4>
                  <p 
                    className="text-sm"
                    style={{ color: editingTheme.mutedTextColor }}
                  >
                    This is sample text to preview your color scheme
                  </p>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 rounded text-sm font-medium"
                      style={{ 
                        backgroundColor: editingTheme.secondaryColor,
                        color: editingTheme.textColor
                      }}
                    >
                      Primary Button
                    </button>
                    <button
                      className="px-3 py-1 rounded text-sm font-medium border"
                      style={{ 
                        backgroundColor: 'transparent',
                        color: editingTheme.accentColor,
                        borderColor: editingTheme.borderColor
                      }}
                    >
                      Secondary Button
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Save/Apply Palettes */}
            <div className="space-y-3">
              <Label className="text-white">Your Saved Palettes</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={newPaletteName}
                  onChange={(e) => setNewPaletteName(e.target.value)}
                  placeholder="Palette name (e.g., My Calm Theme)"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
                <Button onClick={saveCurrentAsPalette} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-1" /> Save palette
                </Button>
              </div>
              {savedPalettes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {savedPalettes.map((p) => (
                    <div key={p.name} className="p-3 rounded-lg border bg-gray-900 border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-white font-medium">{p.name}</div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => applySavedPalette(p)} className="text-xs">
                            <Upload className="w-3 h-3 mr-1" /> Apply
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteSavedPalette(p.name)} className="text-xs">
                            <Trash2 className="w-3 h-3 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-6 gap-1">
                        {[p.backgroundColor, p.cardBackground, p.textColor, p.mutedTextColor, p.secondaryColor, p.accentColor].map((c, i) => (
                          <div key={i} className="h-4 rounded" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No saved palettes yet. Give this theme a name and click Save palette.</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

