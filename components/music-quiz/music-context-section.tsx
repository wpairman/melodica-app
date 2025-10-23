"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface MusicContextSectionProps {
  value: string[]
  onChange: (contexts: string[]) => void
}

export default function MusicContextSection({ value, onChange }: MusicContextSectionProps) {
  const [selectedContexts, setSelectedContexts] = useState<string[]>(value || [])
  const [customContext, setCustomContext] = useState("")

  const contexts = [
    {
      category: "Activities",
      items: [
        "Working/Studying",
        "Exercising/Working Out",
        "Running/Jogging",
        "Yoga/Meditation",
        "Cooking",
        "Cleaning/Chores",
        "Driving/Commuting",
        "Walking",
        "Reading",
      ],
    },
    {
      category: "Social Settings",
      items: [
        "Parties/Social Gatherings",
        "Intimate Gatherings",
        "Dining",
        "Dancing",
        "Background Music for Conversations",
      ],
    },
    {
      category: "Emotional States",
      items: [
        "When I'm Happy",
        "When I'm Sad",
        "When I Need Motivation",
        "When I Need to Calm Down",
        "When I Need to Focus",
        "When I Want to Reminisce",
        "When I Want to Escape",
      ],
    },
    {
      category: "Times of Day",
      items: ["Morning", "Afternoon", "Evening", "Late Night", "To Help Fall Asleep", "To Wake Up"],
    },
  ]

  useEffect(() => {
    onChange(selectedContexts)
  }, [selectedContexts, onChange])

  const handleContextChange = (context: string, checked: boolean) => {
    if (checked) {
      setSelectedContexts([...selectedContexts, context])
    } else {
      setSelectedContexts(selectedContexts.filter((c) => c !== context))
    }
  }

  const handleAddCustomContext = () => {
    if (customContext && !selectedContexts.includes(customContext)) {
      const updatedContexts = [...selectedContexts, customContext]
      setSelectedContexts(updatedContexts)
      setCustomContext("")
    }
  }

  // Flatten all context items for checking if they're in the standard list
  const allContextItems = contexts.flatMap((category) => category.items)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-white">When and where do you typically listen to music?</h3>
        <p className="text-sm text-gray-300 mb-4">
          Select all the contexts in which you regularly listen to music. This helps us understand when to recommend
          certain types of music.
        </p>

        {contexts.map((category) => (
          <div key={category.category} className="mb-6">
            <h4 className="font-semibold text-sm mb-3 text-white">{category.category}</h4>
            <div className="grid grid-cols-2 gap-3">
              {category.items.map((context) => (
                <div key={context} className="flex items-center space-x-2">
                  <Checkbox
                    id={`context-${context}`}
                    checked={selectedContexts.includes(context)}
                    onCheckedChange={(checked) => handleContextChange(context, checked === true)}
                  />
                  <Label htmlFor={`context-${context}`} className="text-sm text-white cursor-pointer">
                    {context}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium mb-2">Add other contexts where you listen to music</h4>
        <div className="space-y-2">
          <Textarea
            placeholder="Describe another context where you listen to music..."
            value={customContext}
            onChange={(e) => setCustomContext(e.target.value)}
            className="min-h-[80px]"
          />
          <button
            onClick={handleAddCustomContext}
            className="px-4 py-2 bg-gray-100 rounded-md text-sm font-medium hover:bg-gray-200 w-full"
            disabled={!customContext}
          >
            Add Context
          </button>
        </div>

        {selectedContexts.filter((c) => !allContextItems.includes(c)).length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Your added contexts:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedContexts
                .filter((c) => !allContextItems.includes(c))
                .map((context) => (
                  <div
                    key={context}
                    className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs flex items-center"
                  >
                    {context}
                    <button
                      onClick={() => handleContextChange(context, false)}
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
