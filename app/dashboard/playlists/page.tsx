"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, Activity, ListMusic, Star, ExternalLink } from "lucide-react"
import { MenuButton } from "@/components/navigation-sidebar"
import { getInteractions, type InteractionLog } from "@/lib/interactions"

interface RatedItem {
  id: string
  kind: "song" | "activity"
  title: string
  rating: number
  meta?: Record<string, any>
  timestamp: number
}

export default function PlaylistsPage() {
  const [ratedItems, setRatedItems] = useState<RatedItem[]>([])
  const [activityRatings, setActivityRatings] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

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
            timestamp: Date.now(), // Use current time as fallback
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
              <p className="text-gray-300 text-sm">Your rated music and activities organized by star rating</p>
            </div>
          </div>

          <div className="p-6">
            <div className="max-w-6xl mx-auto space-y-6">
              {!hasAnyRatings ? (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="py-12">
                    <div className="text-center">
                      <Star className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Rated Items Yet</h3>
                      <p className="text-gray-400 mb-6">
                        Start rating songs and activities to see them organized here by star rating
                      </p>
                      <div className="flex gap-4 justify-center">
                        <a href="/dashboard" className="text-teal-400 hover:text-teal-300 underline">
                          Go to Recommendations
                        </a>
                        <a href="/music-preferences" className="text-teal-400 hover:text-teal-300 underline">
                          Browse Songs
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                // Display items organized by star rating (5 stars first, down to 1 star)
                [5, 4, 3, 2, 1].map((starRating) => {
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
                                    className="px-4 py-3 bg-gray-700/50 rounded-lg text-white flex items-center justify-between hover:bg-gray-700 transition-colors"
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
                })
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
