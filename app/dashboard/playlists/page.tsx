"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Music, Activity, ListMusic, ExternalLink } from "lucide-react"
import { MenuButton } from "@/components/navigation-sidebar"
import Link from "next/link"

export default function PlaylistsPage() {
  const [userData, setUserData] = useState<any>(null)
  const [musicPreferences, setMusicPreferences] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load user data
      const storedData = localStorage.getItem("userData")
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData)
          setUserData(parsed)
        } catch (error) {
          console.error("Error parsing user data:", error)
        }
      }

      // Load music preferences
      const storedPreferences = localStorage.getItem("musicPreferences")
      if (storedPreferences) {
        try {
          setMusicPreferences(JSON.parse(storedPreferences))
        } catch (error) {
          console.error("Error parsing music preferences:", error)
        }
      }

      setLoading(false)
    }
  }, [])

  const getFavoriteArtists = () => {
    if (!userData?.favoriteArtists) return []
    return userData.favoriteArtists.split(',').map((a: string) => a.trim()).filter(Boolean)
  }

  const getFavoriteActivities = () => {
    if (!userData?.favoriteActivities) return []
    return userData.favoriteActivities.split(',').map((a: string) => a.trim()).filter(Boolean)
  }

  const favoriteArtists = getFavoriteArtists()
  const favoriteActivities = getFavoriteActivities()

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
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <ListMusic className="h-6 w-6 text-teal-400" />
                Playlists
              </h1>
              <p className="text-gray-300 text-sm">Your liked music and activities automatically organized</p>
            </div>
          </div>

          <div className="p-6">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Music Playlist */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-teal-900/30 rounded-lg">
                        <Music className="h-6 w-6 text-teal-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white">Music Playlist</CardTitle>
                        <CardDescription className="text-gray-300">
                          Artists and songs from your preferences
                        </CardDescription>
                      </div>
                    </div>
                    <Link href="/music-preferences">
                      <Button variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-700">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Edit Preferences
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {favoriteArtists.length > 0 ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Favorite Artists</h3>
                        <div className="flex flex-wrap gap-2">
                          {favoriteArtists.map((artist: string, index: number) => (
                            <div
                              key={index}
                              className="px-4 py-2 bg-teal-900/20 border border-teal-700/50 rounded-lg text-white flex items-center gap-2"
                            >
                              <Music className="h-4 w-4 text-teal-400" />
                              <span>{artist}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {musicPreferences && (
                        <div className="mt-6 pt-6 border-t border-gray-700">
                          <h3 className="text-lg font-semibold text-white mb-3">Recommended Songs</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {musicPreferences.favoriteSongs?.slice(0, 10).map((song: string, index: number) => (
                              <div
                                key={index}
                                className="px-4 py-2 bg-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
                              >
                                {song}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {musicPreferences?.preferredGenres && (
                        <div className="mt-6 pt-6 border-t border-gray-700">
                          <h3 className="text-lg font-semibold text-white mb-3">Preferred Genres</h3>
                          <div className="flex flex-wrap gap-2">
                            {musicPreferences.preferredGenres.map((genre: string, index: number) => (
                              <div
                                key={index}
                                className="px-3 py-1 bg-purple-900/20 border border-purple-700/50 rounded-full text-sm text-white"
                              >
                                {genre}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Music className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 mb-4">No favorite artists added yet</p>
                      <Link href="/music-preferences">
                        <Button className="bg-teal-600 hover:bg-teal-700">
                          Add Music Preferences
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Activities Playlist */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-900/30 rounded-lg">
                        <Activity className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white">Activities Playlist</CardTitle>
                        <CardDescription className="text-gray-300">
                          Your favorite activities for mood enhancement
                        </CardDescription>
                      </div>
                    </div>
                    <Link href="/dashboard/profile">
                      <Button variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-700">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {favoriteActivities.length > 0 ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Favorite Activities</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {favoriteActivities.map((activity: string, index: number) => (
                            <div
                              key={index}
                              className="px-4 py-3 bg-green-900/20 border border-green-700/50 rounded-lg text-white flex items-center gap-3 hover:bg-green-900/30 transition-colors"
                            >
                              <Activity className="h-5 w-5 text-green-400 flex-shrink-0" />
                              <span>{activity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 mb-4">No favorite activities added yet</p>
                      <Link href="/dashboard/profile">
                        <Button className="bg-green-600 hover:bg-green-700">
                          Add Activities to Profile
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              {(favoriteArtists.length > 0 || favoriteActivities.length > 0) && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Quick Actions</CardTitle>
                    <CardDescription className="text-gray-300">
                      Get started with your playlists
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link href="/music-preferences">
                        <Button variant="outline" className="w-full border-gray-600 text-white hover:bg-gray-700">
                          <Music className="h-4 w-4 mr-2" />
                          Customize Music Preferences
                        </Button>
                      </Link>
                      <Link href="/dashboard/profile">
                        <Button variant="outline" className="w-full border-gray-600 text-white hover:bg-gray-700">
                          <Activity className="h-4 w-4 mr-2" />
                          Update Favorite Activities
                        </Button>
                      </Link>
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

