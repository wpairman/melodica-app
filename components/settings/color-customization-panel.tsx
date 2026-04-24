"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Palette, Sparkles } from 'lucide-react'

export function ColorCustomizationPanel() {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Palette className="h-5 w-5" />
          Color Customization
        </CardTitle>
        <CardDescription className="text-gray-300">
          Personalize your Melodica experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
          <div className="h-14 w-14 rounded-full bg-teal-600/20 flex items-center justify-center">
            <Sparkles className="h-7 w-7 text-teal-400" />
          </div>
          <h3 className="text-white font-semibold">Theme Customization</h3>
          <p className="text-gray-400 text-sm max-w-xs">
            Light mode and custom color themes are coming soon. For now, enjoy our carefully crafted dark theme.
          </p>
          <span className="text-xs text-teal-400 font-medium bg-teal-400/10 px-3 py-1 rounded-full">
            Coming Soon
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
