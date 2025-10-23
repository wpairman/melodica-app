"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface MusicGenreSectionProps {
  value: string[]
  onChange: (genres: string[]) => void
}

export default function MusicGenreSection({ value, onChange }: MusicGenreSectionProps) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>(value || [])
  const [otherGenre, setOtherGenre] = useState("")

  const genres = [
    "Pop",
    "Rock",
    "Hip-Hop/Rap",
    "R&B",
    "Country",
    "Electronic/Dance",
    "Jazz",
    "Classical",
    "Folk",
    "Indie",
    "Metal",
    "Blues",
    "Reggae",
    "World",
    "Alternative",
    "Punk",
    "Soul",
    "Funk",
    "Ambient",
  ]

  useEffect(() => {
    onChange(selectedGenres)
  }, [selectedGenres, onChange])

  const handleGenreChange = (genre: string, checked: boolean) => {
    if (checked) {
      setSelectedGenres([...selectedGenres, genre])
    } else {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre))
    }
  }

  const handleAddOtherGenre = () => {
    if (otherGenre && !selectedGenres.includes(otherGenre)) {
      const updatedGenres = [...selectedGenres, otherGenre]
      setSelectedGenres(updatedGenres)
      setOtherGenre("")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">What genres of music do you enjoy?</h3>
        <p className="text-sm text-gray-500 mb-4">
          Select all that apply. This helps us understand your general music preferences.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {genres.map((genre) => (
            <div key={genre} className="flex items-center space-x-2">
              <Checkbox
                id={`genre-${genre}`}
                checked={selectedGenres.includes(genre)}
                onCheckedChange={(checked) => handleGenreChange(genre, checked === true)}
              />
              <Label htmlFor={`genre-${genre}`} className="text-sm">
                {genre}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium mb-2">Add other genres you enjoy</h4>
        <div className="flex space-x-2">
          <Input
            placeholder="Enter another genre"
            value={otherGenre}
            onChange={(e) => setOtherGenre(e.target.value)}
            className="flex-1"
          />
          <button
            onClick={handleAddOtherGenre}
            className="px-4 py-2 bg-gray-100 rounded-md text-sm font-medium hover:bg-gray-200"
            disabled={!otherGenre}
          >
            Add
          </button>
        </div>

        {selectedGenres.filter((g) => !genres.includes(g)).length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Your added genres:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedGenres
                .filter((g) => !genres.includes(g))
                .map((genre) => (
                  <div
                    key={genre}
                    className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs flex items-center"
                  >
                    {genre}
                    <button
                      onClick={() => handleGenreChange(genre, false)}
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
