"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface MusicEraSectionProps {
  value: string[]
  onChange: (eras: string[]) => void
}

export default function MusicEraSection({ value, onChange }: MusicEraSectionProps) {
  const [selectedEras, setSelectedEras] = useState<string[]>(value || [])
  const [discoveryPreference, setDiscoveryPreference] = useState<number>(50)

  const musicEras = [
    {
      value: "pre_1950s",
      label: "Pre-1950s",
      description: "Classical, Jazz standards, Early blues, Big band",
    },
    {
      value: "1950s",
      label: "1950s",
      description: "Early rock and roll, Doo-wop, Classic country",
    },
    {
      value: "1960s",
      label: "1960s",
      description: "British Invasion, Folk rock, Motown, Psychedelic",
    },
    {
      value: "1970s",
      label: "1970s",
      description: "Disco, Progressive rock, Early punk, Classic rock",
    },
    {
      value: "1980s",
      label: "1980s",
      description: "New wave, Hair metal, Early hip-hop, Synthpop",
    },
    {
      value: "1990s",
      label: "1990s",
      description: "Grunge, Alternative rock, Boy bands, Gangsta rap",
    },
    {
      value: "2000s",
      label: "2000s",
      description: "Pop punk, Emo, R&B, Early indie rock",
    },
    {
      value: "2010s",
      label: "2010s",
      description: "EDM, Trap, Indie pop, Modern pop",
    },
    {
      value: "current",
      label: "Current",
      description: "Latest releases and contemporary artists",
    },
  ]

  useEffect(() => {
    // Add discovery preference to selected eras
    let updatedEras = [...selectedEras]

    // Remove any existing discovery preferences
    updatedEras = updatedEras.filter((era) => !era.startsWith("Discovery:"))

    // Add current discovery preference
    updatedEras.push(`Discovery: ${discoveryPreference}`)

    onChange(updatedEras)
  }, [selectedEras, discoveryPreference, onChange])

  const handleEraChange = (era: string, checked: boolean) => {
    if (checked) {
      setSelectedEras([...selectedEras, era])
    } else {
      setSelectedEras(selectedEras.filter((e) => e !== era))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Which music eras do you enjoy?</h3>
        <p className="text-sm text-gray-500 mb-4">
          Select all the time periods of music you typically enjoy listening to.
        </p>

        <div className="space-y-3">
          {musicEras.map((era) => (
            <div key={era.value} className="flex items-center space-x-2">
              <Checkbox
                id={`era-${era.value}`}
                checked={selectedEras.includes(era.value)}
                onCheckedChange={(checked) => handleEraChange(era.value, checked === true)}
              />
              <Label htmlFor={`era-${era.value}`} className="flex flex-col">
                <span className="font-medium">{era.label}</span>
                <span className="text-xs text-gray-500">{era.description}</span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Music discovery preference</h3>
        <p className="text-sm text-gray-500 mb-6">
          How much do you prefer familiar music versus discovering new music?
        </p>

        <div className="space-y-4">
          <Slider
            defaultValue={[discoveryPreference]}
            max={100}
            step={1}
            onValueChange={(value) => setDiscoveryPreference(value[0])}
          />
          <div className="flex justify-between text-sm">
            <div className="text-center">
              <div className="font-medium">Familiar</div>
              <div className="text-xs text-gray-500">I prefer music I already know</div>
            </div>
            <div className="text-center">
              <div className="font-medium">Balanced</div>
              <div className="text-xs text-gray-500">I like both equally</div>
            </div>
            <div className="text-center">
              <div className="font-medium">Exploratory</div>
              <div className="text-xs text-gray-500">I love discovering new music</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
