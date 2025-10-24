"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { useSafeToast } from "@/components/toast-provider"

interface ActivityPreferencesProps {
  userData: {
    favoriteActivities: string
  }
}

const ACTIVITIES = [
  "Reading",
  "Writing",
  "Drawing",
  "Painting",
  "Gardening",
  "Cooking",
  "Baking",
  "Exercise",
  "Yoga",
  "Meditation",
  "Music",
  "Singing",
  "Playing instruments",
  "Dancing",
  "Photography",
  "Video games",
  "Board games",
  "Puzzles",
  "Knitting",
  "Sewing",
  "Walking",
  "Running",
  "Cycling",
  "Swimming",
  "Hiking",
  "Traveling",
  "Socializing",
  "Movies",
  "TV shows",
  "Podcasts",
  "Learning",
  "Cleaning",
  "Organizing",
  "Shopping",
  "Fashion",
  "Sports",
  "Crafts",
  "DIY projects",
  "Blogging",
  "Journaling",
]

export default function ActivityPreferences({ userData }: ActivityPreferencesProps) {
  const { toast } = useSafeToast()
  const [completedActivities, setCompletedActivities] = useState<string[]>([])
  const [activityRatings, setActivityRatings] = useState<Record<string, number>>({})

  useEffect(() => {
    // Load from localStorage
    if (typeof window !== 'undefined') {
      const storedCompleted = localStorage.getItem("completedActivities")
      const storedRatings = localStorage.getItem("activityRatings")
      
      if (storedCompleted) {
        setCompletedActivities(JSON.parse(storedCompleted))
      }
      
      if (storedRatings) {
        setActivityRatings(JSON.parse(storedRatings))
      }
    }
  }, [])

  const toggleActivity = (activity: string) => {
    const newCompleted = completedActivities.includes(activity)
      ? completedActivities.filter(a => a !== activity)
      : [...completedActivities, activity]
    
    setCompletedActivities(newCompleted)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem("completedActivities", JSON.stringify(newCompleted))
    }
  }

  const rateActivity = (activity: string, rating: number) => {
    const newRatings = { ...activityRatings, [activity]: rating }
    setActivityRatings(newRatings)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem("activityRatings", JSON.stringify(newRatings))
    }
    
    try {
      toast({
        title: "Rating saved!",
        description: `Your ${rating}-star rating for ${activity} has been saved.`,
      })
    } catch (error) {
      console.error('Error showing rating toast:', error)
    }
  }

  const getFavoriteActivities = () => {
    return userData.favoriteActivities.split(',').map(a => a.trim())
  }

  return (
    <Card className="bg-gray-800 text-white border-gray-700">
      <CardHeader>
        <CardTitle className="text-2xl">Activity Preferences</CardTitle>
        <CardDescription className="text-gray-300">
          Track the activities you've done and rate the ones you enjoy most
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Favorite Activities Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Your Favorite Activities</h3>
          <div className="flex flex-wrap gap-2">
            {getFavoriteActivities().map((activity) => (
              <Badge key={activity} variant="secondary" className="bg-teal-600 text-white">
                {activity}
              </Badge>
            ))}
          </div>
        </div>

        {/* Activity Checkbox Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Mark Activities You've Done</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ACTIVITIES.map((activity) => (
              <div key={activity} className="flex items-center space-x-2">
                <Checkbox
                  id={activity}
                  checked={completedActivities.includes(activity)}
                  onCheckedChange={() => toggleActivity(activity)}
                  className="data-[state=checked]:bg-teal-600 data-[state=unchecked]:bg-gray-700"
                />
                <Label htmlFor={activity} className="text-sm text-white cursor-pointer">
                  {activity}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Rated Activities Section */}
        {Object.keys(activityRatings).length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Your Activity Ratings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(activityRatings).map(([activity, rating]) => (
                <div key={activity} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <span className="text-white">{activity}</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rate Activities Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Rate Your Activities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {completedActivities.map((activity) => (
              <div key={activity} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <span className="text-white">{activity}</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => rateActivity(activity, star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-5 w-5 transition-colors ${
                          star <= (activityRatings[activity] || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-500 hover:text-yellow-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
