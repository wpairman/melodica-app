"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface MusicInstrumentsSectionProps {
  value: string[]
  onChange: (instruments: string[]) => void
}

export default function MusicInstrumentsSection({ value, onChange }: MusicInstrumentsSectionProps) {
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>(value || [])
  const [otherInstrument, setOtherInstrument] = useState("")

  const instruments = [
    // String instruments
    "Acoustic Guitar",
    "Electric Guitar",
    "Bass Guitar",
    "Violin",
    "Cello",
    "Harp",
    // Percussion
    "Drums",
    "Piano",
    "Synthesizer",
    "Xylophone",
    "Marimba",
    // Wind instruments
    "Saxophone",
    "Trumpet",
    "Flute",
    "Clarinet",
    "Harmonica",
    // Electronic
    "Synthesizers",
    "Electronic Beats",
    "Sampler",
    // Voice
    "Male Vocals",
    "Female Vocals",
    "Choir",
    "Vocal Harmonies",
  ]

  useEffect(() => {
    onChange(selectedInstruments)
  }, [selectedInstruments, onChange])

  const handleInstrumentChange = (instrument: string, checked: boolean) => {
    if (checked) {
      setSelectedInstruments([...selectedInstruments, instrument])
    } else {
      setSelectedInstruments(selectedInstruments.filter((i) => i !== instrument))
    }
  }

  const handleAddOtherInstrument = () => {
    if (otherInstrument && !selectedInstruments.includes(otherInstrument)) {
      const updatedInstruments = [...selectedInstruments, otherInstrument]
      setSelectedInstruments(updatedInstruments)
      setOtherInstrument("")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Which instruments do you enjoy hearing in music?</h3>
        <p className="text-sm text-gray-500 mb-4">
          Select all instruments that you particularly enjoy or pay attention to when listening to music.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {instruments.map((instrument) => (
            <div key={instrument} className="flex items-center space-x-2">
              <Checkbox
                id={`instrument-${instrument}`}
                checked={selectedInstruments.includes(instrument)}
                onCheckedChange={(checked) => handleInstrumentChange(instrument, checked === true)}
              />
              <Label htmlFor={`instrument-${instrument}`} className="text-sm">
                {instrument}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium mb-2">Add other instruments you enjoy</h4>
        <div className="flex space-x-2">
          <Input
            placeholder="Enter another instrument"
            value={otherInstrument}
            onChange={(e) => setOtherInstrument(e.target.value)}
            className="flex-1"
          />
          <button
            onClick={handleAddOtherInstrument}
            className="px-4 py-2 bg-gray-100 rounded-md text-sm font-medium hover:bg-gray-200"
            disabled={!otherInstrument}
          >
            Add
          </button>
        </div>

        {selectedInstruments.filter((i) => !instruments.includes(i)).length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Your added instruments:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedInstruments
                .filter((i) => !instruments.includes(i))
                .map((instrument) => (
                  <div
                    key={instrument}
                    className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs flex items-center"
                  >
                    {instrument}
                    <button
                      onClick={() => handleInstrumentChange(instrument, false)}
                      className="ml-2 text-teal-600 hover:text-teal-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
