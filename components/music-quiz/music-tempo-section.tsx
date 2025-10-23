"use client"

import { useState, useEffect } from "react"

interface MusicTempoSectionProps {
  value: string[]
  onChange: (tempo: string[]) => void
}

export default function MusicTempoSection({ value, onChange }: MusicTempoSectionProps) {
  const [selectedTempo, setSelectedTempo] = useState<string[]>(value || [])
  const [currentExample, setCurrentExample] = useState<string | null>(null)

  const tempoOptions = [
    {
      value: "very_slow",
      label: "Very Slow (Largo: 40-60 BPM)",
      description: "Slow, stately music like ballads or ambient",
      example: "Adagio for Strings by Samuel Barber",
    },
    {
      value: "slow",
      label: "Slow (Adagio: 66-76 BPM)",
      description: "Relaxed, gentle tempo like slow jazz or ballads",
      example: "Hallelujah by Leonard Cohen",
    },
    {
      value: "medium_slow",
      label: "Medium-Slow (Andante: 76-108 BPM)",
      description: "Walking pace, like many pop ballads",
      example: "Someone Like You by Adele",
    },
    {
      value: "medium",
      label: "Medium (Moderato: 108-120 BPM)",
      description: "Moderate tempo, like many pop songs",
      example: "Billie Jean by Michael Jackson",
    },
    {
      value: "medium_fast",
      label: "Medium-Fast (Allegro: 120-156 BPM)",
      description: "Lively and quick, like many rock songs",
      example: "Hey Ya! by OutKast",
    },
    {
      value: "fast",
      label: "Fast (Vivace: 156-176 BPM)",
      description: "Energetic and fast, like dance music",
      example: "Don't Stop Me Now by Queen",
    },
    {
      value: "very_fast",
      label: "Very Fast (Presto: 168-200+ BPM)",
      description: "Very rapid tempo, like electronic dance music or metal",
      example: "Through the Fire and Flames by DragonForce",
    },
  ]

  useEffect(() => {
    onChange(selectedTempo)
  }, [selectedTempo, onChange])

  const toggleTempo = (tempo: string) => {
    if (selectedTempo.includes(tempo)) {
      setSelectedTempo(selectedTempo.filter((t) => t !== tempo))
    } else {
      setSelectedTempo([...selectedTempo, tempo])
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">What tempos do you prefer in music?</h3>
        <p className="text-sm text-gray-500 mb-4">
          Select all the tempos you typically enjoy listening to. Tempo refers to the speed or pace of the music.
        </p>

        <div className="space-y-3">
          {tempoOptions.map((option) => (
            <div
              key={option.value}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedTempo.includes(option.value)
                  ? "border-teal-500 bg-teal-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => toggleTempo(option.value)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{option.label}</h4>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
                <div className="h-5 w-5 rounded-full border flex items-center justify-center">
                  {selectedTempo.includes(option.value) && <div className="h-3 w-3 rounded-full bg-teal-500"></div>}
                </div>
              </div>
              <div className="mt-2">
                <button
                  className="text-xs text-teal-600 hover:underline"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentExample(currentExample === option.value ? null : option.value)
                  }}
                >
                  {currentExample === option.value ? "Hide example" : "Show example"}
                </button>
                {currentExample === option.value && (
                  <p className="text-xs text-gray-600 mt-1">Example: {option.example}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
