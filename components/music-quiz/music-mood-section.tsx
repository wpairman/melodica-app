"use client"

import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"

interface MusicMoodSectionProps {
  value: Record<string, number>
  onChange: (moods: Record<string, number>) => void
}

export default function MusicMoodSection({ value, onChange }: MusicMoodSectionProps) {
  const initialMoods = {
    happy: 50,
    sad: 50,
    energetic: 50,
    calm: 50,
    nostalgic: 50,
    ...value,
  }

  const [moods, setMoods] = useState<Record<string, number>>(initialMoods)

  useEffect(() => {
    onChange(moods)
  }, [moods, onChange])

  const handleMoodChange = (mood: string, value: number[]) => {
    setMoods({
      ...moods,
      [mood]: value[0],
    })
  }

  const moodDescriptions = {
    happy: {
      low: "I rarely listen to upbeat, cheerful music",
      high: "I love upbeat, cheerful music",
    },
    sad: {
      low: "I avoid melancholic or sad music",
      high: "I connect deeply with melancholic or sad music",
    },
    energetic: {
      low: "I rarely enjoy high-energy music",
      high: "I love high-energy, pumped-up music",
    },
    calm: {
      low: "I rarely listen to relaxing, peaceful music",
      high: "I frequently seek out relaxing, peaceful music",
    },
    nostalgic: {
      low: "I don't connect with music from the past",
      high: "I love music that evokes memories and nostalgia",
    },
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-white">How do you connect with different music moods?</h3>
        <p className="text-sm text-gray-300 mb-6">
          Move the sliders to indicate how much you enjoy or connect with each type of musical mood.
        </p>

        <div className="space-y-8">
          {Object.entries(moods).map(([mood, value]) => (
            <div key={mood} className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-semibold capitalize text-white">{mood} Music</label>
                <span className="text-sm text-gray-200 font-medium">{value}%</span>
              </div>
              <Slider
                defaultValue={[value]}
                max={100}
                step={1}
                onValueChange={(value) => handleMoodChange(mood, value)}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{moodDescriptions[mood as keyof typeof moodDescriptions]?.low}</span>
                <span>{moodDescriptions[mood as keyof typeof moodDescriptions]?.high}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
