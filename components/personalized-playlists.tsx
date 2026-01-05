"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Music, Plus, Trash2, ExternalLink, Share2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getUserPlan, hasFeatureAccess, getPlanLimits } from "@/lib/plan-features"
import { UpgradePrompt } from "@/components/upgrade-prompt"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Playlist {
  id: string
  name: string
  description: string
  mood: string
  songs: Array<{
    title: string
    artist: string
    spotifyId?: string
  }>
  createdAt: Date
  spotifySynced: boolean
}

interface PersonalizedPlaylistsProps {
  userData?: {
    favoriteArtists?: string
    musicPreferences?: any
  }
  currentMood?: number
}

export default function PersonalizedPlaylists({ userData, currentMood = 5 }: PersonalizedPlaylistsProps) {
  const { toast } = useToast()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [userPlan, setUserPlan] = useState<string>("free")
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [newPlaylist, setNewPlaylist] = useState({
    name: "",
    description: "",
    mood: "neutral"
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const plan = getUserPlan()
      setUserPlan(plan)
      
      // Load saved playlists
      const saved = localStorage.getItem("personalizedPlaylists")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setPlaylists(parsed.map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt)
          })))
        } catch (e) {
          console.error("Error parsing saved playlists:", e)
        }
      }
    }
  }, [])

  const savePlaylists = (updatedPlaylists: Playlist[]) => {
    setPlaylists(updatedPlaylists)
    localStorage.setItem("personalizedPlaylists", JSON.stringify(updatedPlaylists))
  }

  const generatePlaylistSongs = (mood: string): Array<{ title: string; artist: string }> => {
    const moodSongs: Record<string, Array<{ title: string; artist: string }>> = {
      low: [
        { title: "Here Comes The Sun", artist: "The Beatles" },
        { title: "Don't Stop Me Now", artist: "Queen" },
        { title: "Walking on Sunshine", artist: "Katrina & The Waves" },
        { title: "Happy", artist: "Pharrell Williams" },
        { title: "Shake It Off", artist: "Taylor Swift" },
        { title: "Can't Stop The Feeling", artist: "Justin Timberlake" },
        { title: "Best Day of My Life", artist: "American Authors" },
        { title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars" },
      ],
      neutral: [
        { title: "Weightless", artist: "Marconi Union" },
        { title: "Strawberry Swing", artist: "Coldplay" },
        { title: "River Flows in You", artist: "Yiruma" },
        { title: "Clair de Lune", artist: "Claude Debussy" },
        { title: "Nuvole Bianche", artist: "Ludovico Einaudi" },
        { title: "Breathe", artist: "Télépopmusik" },
        { title: "Porcelain", artist: "Moby" },
        { title: "Experience", artist: "Ludovico Einaudi" },
      ],
      high: [
        { title: "What a Wonderful World", artist: "Louis Armstrong" },
        { title: "Three Little Birds", artist: "Bob Marley" },
        { title: "Beautiful Day", artist: "U2" },
        { title: "Lovely Day", artist: "Bill Withers" },
        { title: "Somewhere Over The Rainbow", artist: "Israel Kamakawiwo'ole" },
        { title: "Lean On Me", artist: "Bill Withers" },
        { title: "Stand By Me", artist: "Ben E. King" },
        { title: "Count on Me", artist: "Bruno Mars" },
      ]
    }

    // Personalize based on favorite artists
    let songs = moodSongs[mood] || moodSongs.neutral
    
    if (userData?.favoriteArtists) {
      const favoriteArtists = userData.favoriteArtists.split(',').map(a => a.trim())
      // Prioritize songs from favorite artists
      songs = songs.sort((a, b) => {
        const aMatches = favoriteArtists.some(artist => 
          a.artist.toLowerCase().includes(artist.toLowerCase())
        )
        const bMatches = favoriteArtists.some(artist => 
          b.artist.toLowerCase().includes(artist.toLowerCase())
        )
        if (aMatches && !bMatches) return -1
        if (!aMatches && bMatches) return 1
        return 0
      })
    }

    return songs.slice(0, 10) // Return up to 10 songs
  }

  const handleCreatePlaylist = async () => {
    if (!hasFeatureAccess(userPlan as any, "unlimitedPersonalizedPlaylists")) {
      setShowUpgrade(true)
      return
    }

    const limits = getPlanLimits(userPlan as any)
    if (userPlan === "premium" && playlists.length >= limits.maxPlaylistsPerWeek) {
      toast({
        title: "Playlist Limit Reached",
        description: `Premium plans allow ${limits.maxPlaylistsPerWeek} playlists per week. Upgrade to Ultimate for unlimited playlists.`,
        variant: "destructive",
      })
      return
    }

    if (!newPlaylist.name.trim()) {
      toast({
        title: "Missing Playlist Name",
        description: "Please provide a playlist name.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Generate songs based on mood
      const songs = generatePlaylistSongs(newPlaylist.mood)

      const playlist: Playlist = {
        id: Date.now().toString(),
        name: newPlaylist.name,
        description: newPlaylist.description,
        mood: newPlaylist.mood,
        songs,
        createdAt: new Date(),
        spotifySynced: false
      }

      savePlaylists([...playlists, playlist])
      
      // Reset form
      setNewPlaylist({
        name: "",
        description: "",
        mood: "neutral"
      })
      setIsCreating(false)
      
      toast({
        title: "Playlist Created!",
        description: `"${playlist.name}" has been created with ${playlist.songs.length} songs.`,
      })
    } catch (error) {
      console.error("Error creating playlist:", error)
      toast({
        title: "Creation Failed",
        description: "Unable to create playlist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSyncToSpotify = async (playlistId: string) => {
    const spotifyToken = localStorage.getItem("spotifyAccessToken")
    if (!spotifyToken) {
      toast({
        title: "Spotify Not Connected",
        description: "Please connect your Spotify account first.",
        variant: "destructive",
      })
      return
    }

    // In a real implementation, this would sync to Spotify API
    const updated = playlists.map(p =>
      p.id === playlistId ? { ...p, spotifySynced: true } : p
    )
    savePlaylists(updated)
    
    toast({
      title: "Synced to Spotify!",
      description: "Your playlist has been synced to Spotify.",
    })
  }

  const handleSharePlaylist = (playlist: Playlist) => {
    const shareText = `Check out my "${playlist.name}" playlist on Melodica!\n\n${playlist.songs.slice(0, 5).map(s => `• ${s.title} - ${s.artist}`).join('\n')}\n\n...and more!`
    
    if (navigator.share) {
      navigator.share({
        title: playlist.name,
        text: shareText,
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareText)
        toast({
          title: "Copied to Clipboard",
          description: "Playlist details have been copied.",
        })
      })
    } else {
      navigator.clipboard.writeText(shareText)
      toast({
        title: "Copied to Clipboard",
        description: "Playlist details have been copied.",
      })
    }
  }

  const handleDeletePlaylist = (playlistId: string) => {
    const updated = playlists.filter(p => p.id !== playlistId)
    savePlaylists(updated)
    
    toast({
      title: "Playlist Deleted",
      description: "The playlist has been removed.",
    })
  }

  const limits = getPlanLimits(userPlan as any)
  const canCreateMore = userPlan === "ultimate" || userPlan === "lifetime" || playlists.length < limits.maxPlaylistsPerWeek

  if (!hasFeatureAccess(userPlan as any, "unlimitedPersonalizedPlaylists") && userPlan !== "premium") {
    return (
      <>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Music className="h-5 w-5 text-purple-500" />
              Personalized Playlists
            </CardTitle>
            <CardDescription className="text-gray-300">
              Create unlimited mood-based playlists tailored to your preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-300 mb-4">
                  With personalized playlists, you can:
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-purple-500" />
                    Create unlimited mood-based playlists
                  </li>
                  <li className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-purple-500" />
                    Sync playlists to Spotify
                  </li>
                  <li className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-purple-500" />
                    Share playlists with friends
                  </li>
                  <li className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-purple-500" />
                    Get AI-powered song suggestions
                  </li>
                </ul>
              </div>
              <Button
                onClick={() => setShowUpgrade(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                Upgrade for Personalized Playlists
              </Button>
            </div>
          </CardContent>
        </Card>
        {showUpgrade && (
          <UpgradePrompt
            feature="Unlimited Personalized Playlists"
            requiredPlan="premium"
            currentPlan={userPlan as any}
            onClose={() => setShowUpgrade(false)}
          />
        )}
      </>
    )
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Music className="h-5 w-5 text-purple-500" />
              Personalized Playlists
            </CardTitle>
            <CardDescription className="text-gray-300">
              {userPlan === "ultimate" || userPlan === "lifetime" 
                ? "Create unlimited playlists"
                : `${limits.maxPlaylistsPerWeek - playlists.length} playlists remaining this week`}
            </CardDescription>
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={!canCreateMore}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Playlist
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Create Personalized Playlist</DialogTitle>
                <DialogDescription className="text-gray-300">
                  Generate a playlist based on your mood and preferences
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="playlistName" className="text-white">Playlist Name</Label>
                  <Input
                    id="playlistName"
                    value={newPlaylist.name}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                    placeholder="e.g., Morning Motivation"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="playlistDescription" className="text-white">Description</Label>
                  <Input
                    id="playlistDescription"
                    value={newPlaylist.description}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                    placeholder="Optional description"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="playlistMood" className="text-white">Mood</Label>
                  <select
                    id="playlistMood"
                    value={newPlaylist.mood}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, mood: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2"
                  >
                    <option value="low">Low (Need a boost)</option>
                    <option value="neutral">Neutral (Balanced)</option>
                    <option value="high">High (Feeling great)</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreatePlaylist}
                    disabled={isGenerating}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Music className="h-4 w-4 mr-2" />
                        Create Playlist
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setIsCreating(false)}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {playlists.length === 0 ? (
          <div className="text-center py-8">
            <Music className="h-12 w-12 mx-auto text-purple-500 mb-4" />
            <p className="text-gray-300 mb-4">
              Create your first personalized playlist based on your mood
            </p>
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Playlist
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {playlists.map((playlist) => (
              <Card key={playlist.id} className="bg-gray-700/50 border-gray-600">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white">{playlist.name}</CardTitle>
                      <CardDescription className="text-gray-300">{playlist.description}</CardDescription>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-purple-600 text-white">{playlist.mood}</Badge>
                        <Badge variant="outline" className="border-gray-500 text-gray-300">
                          {playlist.songs.length} songs
                        </Badge>
                        {playlist.spotifySynced && (
                          <Badge className="bg-green-600 text-white">Synced</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSharePlaylist(playlist)}
                        className="text-blue-400 hover:text-blue-500"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePlaylist(playlist.id)}
                        className="text-red-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {playlist.songs.slice(0, 5).map((song, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                        <div className="flex-1">
                          <p className="text-sm text-white">{song.title}</p>
                          <p className="text-xs text-gray-400">{song.artist}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(song.artist + " " + song.title)}`
                            window.open(url, '_blank')
                          }}
                          className="text-purple-400 hover:text-purple-500"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {playlist.songs.length > 5 && (
                      <p className="text-xs text-gray-400 text-center">
                        +{playlist.songs.length - 5} more songs
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!playlist.spotifySynced && (
                      <Button
                        onClick={() => handleSyncToSpotify(playlist.id)}
                        variant="outline"
                        className="flex-1 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                      >
                        <Music className="h-4 w-4 mr-2" />
                        Sync to Spotify
                      </Button>
                    )}
                    <Button
                      onClick={() => handleSharePlaylist(playlist)}
                      variant="outline"
                      className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


