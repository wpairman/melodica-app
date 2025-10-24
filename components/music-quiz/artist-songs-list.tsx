"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, ExternalLink } from "lucide-react"

interface ArtistSongsListProps {
  favoriteArtists: string
}

export default function ArtistSongsList({ favoriteArtists }: ArtistSongsListProps) {
  const [artistsList, setArtistsList] = useState<string[]>([])
  const [songsByArtist, setSongsByArtist] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (favoriteArtists) {
      // Parse the favorite artists string into an array
      const artists = favoriteArtists
        .split(",")
        .map((artist) => artist.trim())
        .filter((artist) => artist.length > 0)

      setArtistsList(artists)

      // For each artist, generate mock songs (in a real app, you'd fetch from an API)
      const mockSongs: Record<string, any[]> = {}

      artists.forEach((artist) => {
        mockSongs[artist] = generateMockSongs(artist)
      })

      setSongsByArtist(mockSongs)
      setLoading(false)
    }
  }, [favoriteArtists])

  // Generate mock songs for demo purposes
  const generateMockSongs = (artist: string) => {
    const songTitles = [
      "Beautiful Day",
      "Midnight Dreams",
      "Ocean Waves",
      "Mountain High",
      "City Lights",
      "Starry Night",
      "Summer Breeze",
      "Winter's Tale",
      "Autumn Leaves",
      "Spring Bloom",
      "Sunset Boulevard",
      "Morning Glory",
    ]

    const genres = ["Pop", "Rock", "R&B", "Hip-Hop", "Jazz", "Classical", "Electronic", "Folk"]

    // Generate 3-5 songs per artist
    const songCount = Math.floor(Math.random() * 3) + 3
    const songs = []

    for (let i = 0; i < songCount; i++) {
      const randomTitle = songTitles[Math.floor(Math.random() * songTitles.length)]
      songs.push({
        id: `song-${artist.replace(/\s+/g, "-").toLowerCase()}-${i}`,
        title: `${randomTitle}`,
        artist: artist,
        album: `${artist}'s Greatest Hits`,
        genre: genres[Math.floor(Math.random() * genres.length)],
        duration: `${Math.floor(Math.random() * 2) + 2}:${Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, "0")}`,
        coverUrl: `/placeholder.svg?height=80&width=80&text=${encodeURIComponent(artist.charAt(0))}`,
      })
    }

    return songs
  }

  if (loading) {
    return <div className="text-center py-8">Loading songs from your favorite artists...</div>
  }

  if (artistsList.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-4">
            <p className="text-gray-500">No favorite artists found. Please update your profile.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-black">Songs from Your Favorite Artists</h2>

      {artistsList.map((artist) => (
        <Card key={artist}>
          <CardHeader>
            <CardTitle className="text-black">{artist}</CardTitle>
            <CardDescription className="text-black">Popular songs you might enjoy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {songsByArtist[artist]?.map((song) => (
                <div key={song.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
                      <img
                        src={song.coverUrl || "/placeholder.svg"}
                        alt={song.artist}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-black">{song.title}</h4>
                      <p className="text-sm text-black">
                        {song.album} • {song.duration}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <Play className="h-4 w-4" />
                      <span className="sr-only">Play</span>
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">Open</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
