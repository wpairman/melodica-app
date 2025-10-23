"use client"

import { useState, useEffect } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface MusicLyricsSectionProps {
  value: string[]
  onChange: (lyrics: string[]) => void
}

export default function MusicLyricsSection({ value, onChange }: MusicLyricsSectionProps) {
  const [selectedLyrics, setSelectedLyrics] = useState<string[]>(value || [])
  const [lyricsImportance, setLyricsImportance] = useState<string>(
    value?.includes("Lyrics are very important")
      ? "very_important"
      : value?.includes("Lyrics are somewhat important")
        ? "somewhat_important"
        : value?.includes("Lyrics are not important")
          ? "not_important"
          : "somewhat_important",
  )

  const lyricThemes = [
    "Love and Relationships",
    "Personal Growth",
    "Social Commentary",
    "Storytelling",
    "Emotional Expression",
    "Philosophical/Existential",
    "Nature and Environment",
    "Spirituality/Religion",
    "Politics",
    "Party/Fun",
    "Nostalgia",
    "Fantasy/Imagination",
  ]

  const languagePreferences = [
    "I prefer lyrics in English",
    "I enjoy lyrics in languages I don't understand",
    "I like instrumental music (no lyrics)",
  ]

  useEffect(() => {
    // Combine importance with selected themes
    let updatedLyrics: string[] = []

    // Add importance
    if (lyricsImportance === "very_important") {
      updatedLyrics.push("Lyrics are very important")
    } else if (lyricsImportance === "somewhat_important") {
      updatedLyrics.push("Lyrics are somewhat important")
    } else {
      updatedLyrics.push("Lyrics are not important")
    }

    // Add selected themes and language preferences
    const themesAndLanguages = selectedLyrics.filter(
      (item) => lyricThemes.includes(item) || languagePreferences.includes(item),
    )

    updatedLyrics = [...updatedLyrics, ...themesAndLanguages]
    onChange(updatedLyrics)
  }, [selectedLyrics, lyricsImportance, onChange, lyricThemes, languagePreferences])

  const handleThemeChange = (theme: string, checked: boolean) => {
    if (checked) {
      setSelectedLyrics([...selectedLyrics, theme])
    } else {
      setSelectedLyrics(selectedLyrics.filter((t) => t !== theme))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">How important are lyrics to you?</h3>

        <RadioGroup value={lyricsImportance} onValueChange={setLyricsImportance} className="space-y-3">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="very_important" id="very_important" />
            <Label htmlFor="very_important">
              <div>
                <span className="font-medium">Very important</span>
                <p className="text-sm text-gray-500">
                  I pay close attention to lyrics and they significantly impact my enjoyment
                </p>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="somewhat_important" id="somewhat_important" />
            <Label htmlFor="somewhat_important">
              <div>
                <span className="font-medium">Somewhat important</span>
                <p className="text-sm text-gray-500">I notice lyrics but they're not the main factor in my enjoyment</p>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="not_important" id="not_important" />
            <Label htmlFor="not_important">
              <div>
                <span className="font-medium">Not important</span>
                <p className="text-sm text-gray-500">I focus more on the melody, rhythm, and overall sound</p>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {lyricsImportance !== "not_important" && (
        <div>
          <h3 className="text-lg font-medium mb-4">What lyrical themes do you connect with?</h3>
          <p className="text-sm text-gray-500 mb-4">Select the themes that resonate with you in song lyrics.</p>

          <div className="grid grid-cols-2 gap-3">
            {lyricThemes.map((theme) => (
              <div key={theme} className="flex items-center space-x-2">
                <Checkbox
                  id={`theme-${theme}`}
                  checked={selectedLyrics.includes(theme)}
                  onCheckedChange={(checked) => handleThemeChange(theme, checked === true)}
                />
                <Label htmlFor={`theme-${theme}`} className="text-sm">
                  {theme}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t pt-4">
        <h3 className="text-lg font-medium mb-4">Language preferences</h3>

        <div className="space-y-3">
          {languagePreferences.map((preference) => (
            <div key={preference} className="flex items-center space-x-2">
              <Checkbox
                id={`lang-${preference}`}
                checked={selectedLyrics.includes(preference)}
                onCheckedChange={(checked) => handleThemeChange(preference, checked === true)}
              />
              <Label htmlFor={`lang-${preference}`} className="text-sm">
                {preference}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
