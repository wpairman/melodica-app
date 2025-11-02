"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Music, Activity, ListMusic, Star, ExternalLink, Plus, X, Edit2, Trash2 } from "lucide-react"
import { MenuButton } from "@/components/navigation-sidebar"
import { getInteractions, type InteractionLog } from "@/lib/interactions"
import { useToast } from "@/hooks/use-toast"

interface RatedItem {
  id: string
  kind: "song" | "activity"
  title: string
  rating: number
  meta?: Record<string, any>
  timestamp: number
}

interface CustomPlaylist {
  id: string
  name: string
  songs: Array<{
    id: string
    title: string
    artist?: string
    meta?: Record<string, any>
  }>
  createdAt: string
}

export default function PlaylistsPage() {
  const { toast } = useToast()
  const [ratedItems, setRatedItems] = useState<RatedItem[]>([])
  const [activityRatings, setActivityRatings] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [customPlaylists, setCustomPlaylists] = useState<CustomPlaylist[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState("")
  const [selectedPlaylist, setSelectedPlaylist] = useState<CustomPlaylist | null>(null)
  const [isAddSongDialogOpen, setIsAddSongDialogOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load interaction logs (rated songs and activities from recommendations)
      const interactions = getInteractions()
      
      // Convert interactions to rated items
      const ratedFromInteractions: RatedItem[] = interactions.map((interaction: InteractionLog) => ({
        id: interaction.id,
        kind: interaction.kind,
        title: interaction.title,
        rating: interaction.rating,
        meta: interaction.meta,
        timestamp: interaction.timestamp,
      }))

      // Load activity ratings from activity preferences
      const storedActivityRatings = localStorage.getItem("activityRatings")
      let activityRatingsData: Record<string, number> = {}
      
      if (storedActivityRatings) {
        try {
          activityRatingsData = JSON.parse(storedActivityRatings)
          setActivityRatings(activityRatingsData)
          
          // Convert activity ratings to rated items
          const ratedActivities: RatedItem[] = Object.entries(activityRatingsData).map(([activity, rating]) => ({
            id: `activity-${activity}`,
            kind: "activity" as const,
            title: activity,
            rating,
            timestamp: Date.now(),
          }))
          
          // Combine all rated items
          const allRatedItems = [...ratedFromInteractions, ...ratedActivities]
          
          // Remove duplicates (prefer interaction logs over activity ratings if same title exists)
          const uniqueItems = new Map<string, RatedItem>()
          allRatedItems.forEach(item => {
            const key = `${item.kind}-${item.title.toLowerCase()}`
            if (!uniqueItems.has(key) || item.meta?.source) {
              uniqueItems.set(key, item)
            }
          })
          
          setRatedItems(Array.from(uniqueItems.values()))
        } catch (error) {
          console.error("Error parsing activity ratings:", error)
          setRatedItems(ratedFromInteractions)
        }
      } else {
        setRatedItems(ratedFromInteractions)
      }

      // Load custom playlists
      const storedPlaylists = localStorage.getItem("customPlaylists")
      if (storedPlaylists) {
        try {
          setCustomPlaylists(JSON.parse(storedPlaylists))
        } catch (error) {
          console.error("Error parsing custom playlists:", error)
        }
      }

      setLoading(false)
    }
  }, [])

  // Group items by rating (1-5 stars)
  const itemsByRating = {
    1: ratedItems.filter(item => item.rating === 1),
    2: ratedItems.filter(item => item.rating === 2),
    3: ratedItems.filter(item => item.rating === 3),
    4: ratedItems.filter(item => item.rating === 4),
    5: ratedItems.filter(item => item.rating === 5),
  }

  const hasAnyRatings = ratedItems.length > 0
  const allRatedSongs = ratedItems.filter(item => item.kind === "song")

  const savePlaylists = (playlists: CustomPlaylist[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("customPlaylists", JSON.stringify(playlists))
      setCustomPlaylists(playlists)
    }
  }

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) {
      toast({
        title: "Playlist name required",
        description: "Please enter a name for your playlist",
        variant: "destructive",
      })
      return
    }

    const newPlaylist: CustomPlaylist = {
      id: `playlist-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: newPlaylistName.trim(),
      songs: [],
      createdAt: new Date().toISOString(),
    }

    const updatedPlaylists = [...customPlaylists, newPlaylist]
    savePlaylists(updatedPlaylists)
    
    toast({
      title: "Playlist created! 🎵",
      description: `"${newPlaylistName}" has been created. Start adding songs!`,
    })

    setNewPlaylistName("")
    setIsCreateDialogOpen(false)
  }

  const handleAddSongToPlaylist = (playlist: CustomPlaylist, song: RatedItem) => {
    // Check if song already in playlist
    if (playlist.songs.some(s => s.id === song.id)) {
      toast({
        title: "Song already in playlist",
        description: `"${song.title}" is already in "${playlist.name}"`,
        variant: "destructive",
      })
      return
    }

    const songToAdd = {
      id: song.id,
      title: song.title,
      artist: song.meta?.artist,
      meta: song.meta,
    }

    const updatedPlaylists = customPlaylists.map(p => 
      p.id === playlist.id 
        ? { ...p, songs: [...p.songs, songToAdd] }
        : p
    )

    savePlaylists(updatedPlaylists)
    toast({
      title: "Song added! 🎵",
      description: `"${song.title}" added to "${playlist.name}"`,
    })
  }

  const handleRemoveSongFromPlaylist = (playlistId: string, songId: string) => {
    const updatedPlaylists = customPlaylists.map(playlist => 
      playlist.id === playlistId 
        ? { ...playlist, songs: playlist.songs.filter(s => s.id !== songId) }
        : playlist
    )

    savePlaylists(updatedPlaylists)
    toast({
      title: "Song removed",
      description: "Song has been removed from playlist",
    })
  }

  const handleDeletePlaylist = (playlistId: string) => {
    const playlist = customPlaylists.find(p => p.id === playlistId)
    if (!playlist) return

    if (confirm(`Are you sure you want to delete "${playlist.name}"? This action cannot be undone.`)) {
      const updatedPlaylists = customPlaylists.filter(p => p.id !== playlistId)
      savePlaylists(updatedPlaylists)
      toast({
        title: "Playlist deleted",
        description: `"${playlist.name}" has been deleted`,
      })
    }
  }

  const handleRenamePlaylist = (playlistId: string, newName: string) => {
    if (!newName.trim()) {
      toast({
        title: "Playlist name required",
        description: "Please enter a name for your playlist",
        variant: "destructive",
      })
      return
    }

    const updatedPlaylists = customPlaylists.map(playlist =>
      playlist.id === playlistId
        ? { ...playlist, name: newName.trim() }
        : playlist
    )

    savePlaylists(updatedPlaylists)
    toast({
      title: "Playlist renamed",
      description: `Playlist renamed to "${newName.trim()}"`,
    })
  }

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-white">Loading playlists...</p>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
          {/* Header */}
          <div className="sticky top-0 z-50 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center gap-4">
            <MenuButton />
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <ListMusic className="h-6 w-6 text-teal-400" />
                Playlists
              </h1>
              <p className="text-gray-300 text-sm">Your rated music and custom playlists</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Playlist
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Playlist</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Give your playlist a name
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="playlist-name" className="text-white">Playlist Name</Label>
                    <Input
                      id="playlist-name"
                      placeholder="e.g., My Favorites, Workout Mix, Chill Vibes"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCreatePlaylist()
                        }
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-gray-600 text-white hover:bg-gray-700">
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePlaylist} className="bg-teal-600 hover:bg-teal-700">
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="p-6">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Custom Playlists Section */}
              {customPlaylists.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <ListMusic className="h-5 w-5 text-teal-400" />
                    Your Playlists
                  </h2>
                  {customPlaylists.map((playlist) => (
                    <Card key={playlist.id} className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="p-2 bg-purple-900/30 rounded-lg">
                              <ListMusic className="h-5 w-5 text-purple-400" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-white flex items-center gap-2">
                                <span>{playlist.name}</span>
                                <span className="text-gray-400 text-sm font-normal">
                                  ({playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'})
                                </span>
                              </CardTitle>
                              <CardDescription className="text-gray-300 text-xs">
                                Created {new Date(playlist.createdAt).toLocaleDateString()}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedPlaylist(playlist)}
                                  className="border-gray-600 text-white hover:bg-gray-700"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add Songs
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="text-white">Add Songs to "{playlist.name}"</DialogTitle>
                                  <DialogDescription className="text-gray-300">
                                    Select songs from your rated items to add to this playlist
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                  {allRatedSongs.length === 0 ? (
                                    <p className="text-gray-400 text-center py-8">
                                      No rated songs yet. Start rating songs to add them to playlists!
                                    </p>
                                  ) : (
                                    allRatedSongs.map((song) => {
                                      const isInPlaylist = playlist.songs.some(s => s.id === song.id)
                                      return (
                                        <div
                                          key={song.id}
                                          className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                                        >
                                          <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <Music className="h-5 w-5 text-teal-400 flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                              <div className="text-sm font-medium text-white truncate">{song.title}</div>
                                              {song.meta?.artist && (
                                                <div className="text-xs text-gray-400 truncate">{song.meta.artist}</div>
                                              )}
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                              {Array.from({ length: song.rating }).map((_, i) => (
                                                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                              ))}
                                            </div>
                                          </div>
                                          <Button
                                            variant={isInPlaylist ? "outline" : "default"}
                                            size="sm"
                                            onClick={() => {
                                              if (isInPlaylist) {
                                                handleRemoveSongFromPlaylist(playlist.id, song.id)
                                              } else {
                                                handleAddSongToPlaylist(playlist, song)
                                              }
                                            }}
                                            disabled={isInPlaylist}
                                            className={isInPlaylist 
                                              ? "border-gray-600 text-gray-500 cursor-not-allowed" 
                                              : "bg-teal-600 hover:bg-teal-700"
                                            }
                                          >
                                            {isInPlaylist ? "Added" : "Add"}
                                          </Button>
                                        </div>
                                      )
                                    })
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="border-gray-600 text-white hover:bg-gray-700"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-gray-800 border-gray-700">
                                <DialogHeader>
                                  <DialogTitle className="text-white">Rename Playlist</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="rename-input" className="text-white">Playlist Name</Label>
                                    <Input
                                      id="rename-input"
                                      defaultValue={playlist.name}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          const input = e.target as HTMLInputElement
                                          handleRenamePlaylist(playlist.id, input.value)
                                          // Close dialog
                                          const dialog = e.currentTarget.closest('[role="dialog"]')
                                          if (dialog) {
                                            const closeButton = dialog.querySelector('[aria-label="Close"]') as HTMLElement
                                            closeButton?.click()
                                          }
                                        }
                                      }}
                                      className="bg-gray-700 border-gray-600 text-white"
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    onClick={(e) => {
                                      const input = document.getElementById('rename-input') as HTMLInputElement
                                      if (input) {
                                        handleRenamePlaylist(playlist.id, input.value)
                                      }
                                    }}
                                    className="bg-teal-600 hover:bg-teal-700"
                                  >
                                    Save
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeletePlaylist(playlist.id)}
                              className="border-red-600 text-red-400 hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {playlist.songs.length === 0 ? (
                          <div className="text-center py-8 text-gray-400">
                            <Music className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>This playlist is empty</p>
                            <p className="text-sm mt-1">Click "Add Songs" to add music to this playlist</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {playlist.songs.map((song) => (
                              <div
                                key={song.id}
                                className="px-4 py-3 bg-gray-700/50 rounded-lg text-white flex items-center justify-between hover:bg-gray-700 transition-colors group"
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <Music className="h-5 w-5 text-purple-400 flex-shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <div className="text-sm font-medium truncate">{song.title}</div>
                                    {song.artist && (
                                      <div className="text-xs text-gray-400 truncate">{song.artist}</div>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRemoveSongFromPlaylist(playlist.id, song.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-600 rounded"
                                  title="Remove from playlist"
                                >
                                  <X className="h-4 w-4 text-gray-400 hover:text-red-400" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Create First Playlist Prompt */}
              {customPlaylists.length === 0 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="py-12">
                    <div className="text-center">
                      <ListMusic className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">Create Your First Playlist</h3>
                      <p className="text-gray-400 mb-6">
                        Organize your favorite songs into custom playlists. Name them whatever you want!
                      </p>
                      <Button 
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="bg-teal-600 hover:bg-teal-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Playlist
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Star-Rated Sections */}
              {hasAnyRatings && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    Rated by Stars
                  </h2>
                  {[5, 4, 3, 2, 1].map((starRating) => {
                    const items = itemsByRating[starRating as keyof typeof itemsByRating]
                    if (items.length === 0) return null

                    const songs = items.filter(item => item.kind === "song")
                    const activities = items.filter(item => item.kind === "activity")

                    return (
                      <Card key={starRating} className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: starRating }).map((_, i) => (
                                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                              ))}
                              {Array.from({ length: 5 - starRating }).map((_, i) => (
                                <Star key={i} className="h-5 w-5 text-gray-600" />
                              ))}
                            </div>
                            <span className="ml-2">{starRating} {starRating === 1 ? 'Star' : 'Stars'}</span>
                            <span className="text-gray-400 text-sm font-normal ml-2">
                              ({items.length} {items.length === 1 ? 'item' : 'items'})
                            </span>
                          </CardTitle>
                          <CardDescription className="text-gray-300">
                            {starRating === 5 && "Your absolute favorites"}
                            {starRating === 4 && "Really enjoyed these"}
                            {starRating === 3 && "These were okay"}
                            {starRating === 2 && "Could be better"}
                            {starRating === 1 && "Not your favorite"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            {/* Songs Section */}
                            {songs.length > 0 && (
                              <div>
                                <h3 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                                  <Music className="h-4 w-4 text-teal-400" />
                                  Songs ({songs.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {songs.map((item) => (
                                    <div
                                      key={item.id}
                                      className="px-4 py-3 bg-gray-700/50 rounded-lg text-white flex items-center justify-between hover:bg-gray-700 transition-colors group"
                                    >
                                      <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <Music className="h-5 w-5 text-teal-400 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                          <div className="text-sm font-medium truncate">{item.title}</div>
                                          {item.meta?.artist && (
                                            <div className="text-xs text-gray-400 truncate">{item.meta.artist}</div>
                                          )}
                                          {item.meta?.mood && (
                                            <div className="text-xs text-teal-400 mt-1">{item.meta.mood}</div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {customPlaylists.length > 0 && (
                                          <Dialog>
                                            <DialogTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Add to playlist"
                                              >
                                                <Plus className="h-4 w-4 text-teal-400" />
                                              </Button>
                                            </DialogTrigger>
                                            <DialogContent className="bg-gray-800 border-gray-700">
                                              <DialogHeader>
                                                <DialogTitle className="text-white">Add to Playlist</DialogTitle>
                                                <DialogDescription className="text-gray-300">
                                                  Select a playlist to add "{item.title}" to
                                                </DialogDescription>
                                              </DialogHeader>
                                              <div className="space-y-2">
                                                {customPlaylists.map((playlist) => {
                                                  const isInPlaylist = playlist.songs.some(s => s.id === item.id)
                                                  return (
                                                    <Button
                                                      key={playlist.id}
                                                      variant={isInPlaylist ? "outline" : "default"}
                                                      className="w-full justify-start"
                                                      onClick={() => {
                                                        if (!isInPlaylist) {
                                                          handleAddSongToPlaylist(playlist, item)
                                                          // Close dialog
                                                          const closeButton = document.querySelector('[aria-label="Close"]') as HTMLElement
                                                          closeButton?.click()
                                                        }
                                                      }}
                                                      disabled={isInPlaylist}
                                                    >
                                                      <ListMusic className="h-4 w-4 mr-2" />
                                                      {playlist.name}
                                                      {isInPlaylist && (
                                                        <span className="ml-auto text-xs text-gray-400">(Added)</span>
                                                      )}
                                                    </Button>
                                                  )
                                                })}
                                              </div>
                                            </DialogContent>
                                          </Dialog>
                                        )}
                                        {item.meta?.source === "recommendations" && (
                                          <a
                                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(item.title)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-2 flex-shrink-0"
                                          >
                                            <ExternalLink className="h-4 w-4 text-gray-400 hover:text-teal-400" />
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Activities Section */}
                            {activities.length > 0 && (
                              <div>
                                <h3 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                                  <Activity className="h-4 w-4 text-green-400" />
                                  Activities ({activities.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {activities.map((item) => (
                                    <div
                                      key={item.id}
                                      className="px-4 py-3 bg-gray-700/50 rounded-lg text-white flex items-center gap-3 hover:bg-gray-700 transition-colors"
                                    >
                                      <Activity className="h-5 w-5 text-green-400 flex-shrink-0" />
                                      <span className="text-sm font-medium">{item.title}</span>
                                      {item.meta?.duration && (
                                        <span className="text-xs text-gray-400 ml-auto">{item.meta.duration}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}

              {/* Empty State */}
              {!hasAnyRatings && customPlaylists.length === 0 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="py-12">
                    <div className="text-center">
                      <Star className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">Get Started with Playlists</h3>
                      <p className="text-gray-400 mb-6">
                        Rate some songs first, then create custom playlists to organize your favorites!
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Button 
                          onClick={() => setIsCreateDialogOpen(true)}
                          className="bg-teal-600 hover:bg-teal-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Playlist
                        </Button>
                        <a href="/dashboard" className="inline-flex items-center justify-center rounded-md bg-gray-700 hover:bg-gray-600 px-4 py-2 text-sm font-medium text-white">
                          Go to Recommendations
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
