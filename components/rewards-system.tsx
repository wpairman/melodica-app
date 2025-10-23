"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Trophy,
  Star,
  Flame,
  Target,
  Award,
  Sparkles,
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  Check,
} from "lucide-react"
import { useSafeToast } from "@/components/toast-provider"

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  requirement: number
  earned: boolean
  earnedDate?: Date
  type: "streak" | "total" | "special"
}

interface RewardsSystemProps {
  moodHistory: Array<{ mood: number; timestamp: Date; notes?: string }>
  onAchievementEarned?: (achievement: Achievement) => void
}

/** ----------------------------------------------------------------
 *  Utilities for (de)serialising achievements
 *  ----------------------------------------------------------------*/
const iconMap: Record<string, React.ReactNode> = {
  "first-entry": <Star className="h-6 w-6 text-yellow-500" />,
  "week-warrior": <Flame className="h-6 w-6 text-orange-500" />,
  "two-week-champion": <Trophy className="h-6 w-6 text-gold-500" />,
  "month-master": <Award className="h-6 w-6 text-purple-500" />,
  "consistency-king": <Target className="h-6 w-6 text-blue-500" />,
  "mindful-milestone": <Sparkles className="h-6 w-6 text-pink-500" />,
}

function serializeAchievements(achievements: Achievement[]) {
  // Remove cyclic/unsuitable fields (icon)
  return JSON.stringify(achievements.map(({ icon, ...rest }) => rest))
}

function deserializeAchievements(raw: string | null, fallback: Achievement[]): Achievement[] {
  if (!raw) return fallback
  try {
    const parsed: Omit<Achievement, "icon">[] = JSON.parse(raw)
    return parsed.map((a) => ({
      ...a,
      icon: iconMap[a.id] ?? <Star className="h-6 w-6" />,
    }))
  } catch {
    return fallback
  }
}

export default function RewardsSystem({ moodHistory, onAchievementEarned }: RewardsSystemProps) {
  const { toast } = useSafeToast()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [showCelebration, setShowCelebration] = useState(false)
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [copiedAchievement, setCopiedAchievement] = useState<string | null>(null)

  const defaultAchievements: Achievement[] = [
    {
      id: "first-entry",
      title: "First Steps",
      description: "Log your first mood entry",
      icon: <Star className="h-6 w-6 text-yellow-500" />,
      requirement: 1,
      earned: false,
      type: "total",
    },
    {
      id: "week-warrior",
      title: "Week Warrior",
      description: "Log your mood for 7 consecutive days",
      icon: <Flame className="h-6 w-6 text-orange-500" />,
      requirement: 7,
      earned: false,
      type: "streak",
    },
    {
      id: "two-week-champion",
      title: "Two Week Champion",
      description: "Log your mood for 14 consecutive days",
      icon: <Trophy className="h-6 w-6 text-gold-500" />,
      requirement: 14,
      earned: false,
      type: "streak",
    },
    {
      id: "month-master",
      title: "Month Master",
      description: "Log your mood for 30 consecutive days",
      icon: <Award className="h-6 w-6 text-purple-500" />,
      requirement: 30,
      earned: false,
      type: "streak",
    },
    {
      id: "consistency-king",
      title: "Consistency King",
      description: "Log 50 total mood entries",
      icon: <Target className="h-6 w-6 text-blue-500" />,
      requirement: 50,
      earned: false,
      type: "total",
    },
    {
      id: "mindful-milestone",
      title: "Mindful Milestone",
      description: "Log 100 total mood entries",
      icon: <Sparkles className="h-6 w-6 text-pink-500" />,
      requirement: 100,
      earned: false,
      type: "total",
    },
  ]

  useEffect(() => {
    // Load achievements from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const storedAchievements = localStorage.getItem("userAchievements")
      setAchievements(deserializeAchievements(storedAchievements, defaultAchievements))
    }
  }, [])

  // Separate useEffect for checking achievements when mood history changes
  useEffect(() => {
    if (moodHistory.length > 0 && achievements.length > 0) {
      const streak = calculateCurrentStreak()
      const totalEntries = moodHistory.length

      // Check if any achievement should be earned
      const hasNewAchievement = achievements.some((achievement) => {
        if (achievement.earned) return false
        
        if (achievement.type === "streak" && streak >= achievement.requirement) {
          return true
        } else if (achievement.type === "total" && totalEntries >= achievement.requirement) {
          return true
        }
        return false
      })

      // Only update if there's a new achievement to earn
      if (hasNewAchievement) {
        setCurrentStreak(streak)
        const updatedAchievements = achievements.map((achievement) => {
          if (achievement.earned) return achievement

          let shouldEarn = false

          if (achievement.type === "streak" && streak >= achievement.requirement) {
            shouldEarn = true
          } else if (achievement.type === "total" && totalEntries >= achievement.requirement) {
            shouldEarn = true
          }

          if (shouldEarn) {
            const earnedAchievement = {
              ...achievement,
              earned: true,
              earnedDate: new Date(),
            }

            // Show celebration
            setNewAchievement(earnedAchievement)
            setShowCelebration(true)

            // Show toast notification
            try {
              toast({
                title: "🎉 Achievement Unlocked!",
                description: `${achievement.title}: ${achievement.description}`,
              })
            } catch (error) {
              console.error('Error showing achievement toast:', error)
            }

            if (onAchievementEarned) {
              onAchievementEarned(earnedAchievement)
            }

            return earnedAchievement
          }

          return achievement
        })

        setAchievements(updatedAchievements)
        // Save to localStorage (client-side only)
        if (typeof window !== 'undefined') {
          localStorage.setItem("userAchievements", serializeAchievements(updatedAchievements))
        }
      }
    }
  }, [moodHistory.length]) // Only depend on moodHistory length to prevent infinite loops

  const calculateCurrentStreak = () => {
    if (moodHistory.length === 0) return 0

    const sortedHistory = [...moodHistory].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )

    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < sortedHistory.length; i++) {
      const entryDate = new Date(sortedHistory[i].timestamp)
      entryDate.setHours(0, 0, 0, 0)

      const expectedDate = new Date(today)
      expectedDate.setDate(today.getDate() - i)

      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  const checkAchievements = useCallback(() => {
    // Safety check to prevent accessing before initialization
    if (!achievements || achievements.length === 0) return;
    
    const streak = calculateCurrentStreak()
    setCurrentStreak(streak)
    const totalEntries = moodHistory.length

    const updatedAchievements = achievements.map((achievement) => {
      if (achievement.earned) return achievement

      let shouldEarn = false

      if (achievement.type === "streak" && streak >= achievement.requirement) {
        shouldEarn = true
      } else if (achievement.type === "total" && totalEntries >= achievement.requirement) {
        shouldEarn = true
      }

      if (shouldEarn) {
        const earnedAchievement = {
          ...achievement,
          earned: true,
          earnedDate: new Date(),
        }

        // Show celebration
        setNewAchievement(earnedAchievement)
        setShowCelebration(true)

        // Show toast notification
        try {
          toast({
            title: "🎉 Achievement Unlocked!",
            description: `${achievement.title}: ${achievement.description}`,
          })
        } catch (error) {
          console.error('Error showing achievement toast:', error)
        }

        if (onAchievementEarned) {
          onAchievementEarned(earnedAchievement)
        }

        return earnedAchievement
      }

      return achievement
    })

    setAchievements(updatedAchievements)
    // Save to localStorage (client-side only)
    if (typeof window !== 'undefined') {
      localStorage.setItem("userAchievements", serializeAchievements(updatedAchievements))
    }
  }, [moodHistory, achievements, toast, onAchievementEarned])

  const getProgressPercentage = (achievement: Achievement) => {
    if (achievement.earned) return 100

    if (achievement.type === "streak") {
      return Math.min((currentStreak / achievement.requirement) * 100, 100)
    } else if (achievement.type === "total") {
      return Math.min((moodHistory.length / achievement.requirement) * 100, 100)
    }

    return 0
  }

  const getProgressText = (achievement: Achievement) => {
    if (achievement.earned) return "Completed!"

    if (achievement.type === "streak") {
      return `${currentStreak}/${achievement.requirement} days`
    } else if (achievement.type === "total") {
      return `${moodHistory.length}/${achievement.requirement} entries`
    }

    return ""
  }

  const generateShareText = (achievement: Achievement) => {
    const earnedDate = achievement.earnedDate ? new Date(achievement.earnedDate).toLocaleDateString() : "today"
    return `🎉 Just unlocked the "${achievement.title}" achievement in my mental wellness journey! ${achievement.description} 💪 #MentalHealth #Wellness #SelfCare #Achievement`
  }

  const shareToTwitter = (achievement: Achievement) => {
    const text = generateShareText(achievement)
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(url, "_blank", "width=550,height=420")
  }

  const shareToFacebook = (achievement: Achievement) => {
    const text = generateShareText(achievement)
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(text)}`
    window.open(url, "_blank", "width=550,height=420")
  }

  const shareToLinkedIn = (achievement: Achievement) => {
    const text = generateShareText(achievement)
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}&summary=${encodeURIComponent(text)}`
    window.open(url, "_blank", "width=550,height=420")
  }

  const copyToClipboard = async (achievement: Achievement) => {
    const text = generateShareText(achievement)
    try {
      await navigator.clipboard.writeText(text)
      setCopiedAchievement(achievement.id)
      toast({
        title: "Copied to clipboard!",
        description: "Achievement text copied successfully.",
      })
      setTimeout(() => setCopiedAchievement(null), 2000)
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive",
      })
    }
  }

  const ShareButton = ({ achievement }: { achievement: Achievement }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => shareToTwitter(achievement)} className="cursor-pointer">
          <Twitter className="h-4 w-4 mr-2 text-blue-400" />
          Share on Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => shareToFacebook(achievement)} className="cursor-pointer">
          <Facebook className="h-4 w-4 mr-2 text-blue-600" />
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => shareToLinkedIn(achievement)} className="cursor-pointer">
          <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
          Share on LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => copyToClipboard(achievement)} className="cursor-pointer">
          {copiedAchievement === achievement.id ? (
            <Check className="h-4 w-4 mr-2 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          {copiedAchievement === achievement.id ? "Copied!" : "Copy text"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const earnedCount = achievements.filter((a) => a.earned).length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Your Achievements
          </CardTitle>
          <CardDescription>
            Keep logging your mood to unlock rewards! Current streak: {currentStreak} days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-500">
                {earnedCount}/{achievements.length} achievements
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(earnedCount / achievements.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border transition-all ${
                  achievement.earned
                    ? "bg-gradient-to-r from-green-50 to-blue-50 border-green-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`${achievement.earned ? "opacity-100" : "opacity-50"}`}>{achievement.icon}</div>
                    <div>
                      <h3 className={`font-medium ${achievement.earned ? "text-green-700" : "text-gray-700"}`}>
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{getProgressText(achievement)}</p>
                      {achievement.earned && achievement.earnedDate && (
                        <p className="text-xs text-green-600 mt-1">
                          Earned on {new Date(achievement.earnedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {achievement.earned ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Earned
                        </Badge>
                        <ShareButton achievement={achievement} />
                      </div>
                    ) : (
                      <div className="w-16 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressPercentage(achievement)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Celebration Dialog */}
      <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">🎉 Congratulations! 🎉</DialogTitle>
            <DialogDescription className="text-center">You've unlocked a new achievement!</DialogDescription>
          </DialogHeader>
          {newAchievement && (
            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full">
                {newAchievement.icon}
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800">{newAchievement.title}</h3>
                <p className="text-gray-600 mt-1">{newAchievement.description}</p>
              </div>
              <div className="text-center text-sm text-gray-500">
                <p>Keep up the great work! Consistency is key to better mental health.</p>
              </div>

              {/* Share buttons in celebration dialog */}
              <div className="flex flex-col gap-2 w-full">
                <div className="text-center text-sm font-medium text-gray-700 mb-2">Share your achievement:</div>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareToTwitter(newAchievement)}
                    className="flex items-center gap-2"
                  >
                    <Twitter className="h-4 w-4 text-blue-400" />
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareToFacebook(newAchievement)}
                    className="flex items-center gap-2"
                  >
                    <Facebook className="h-4 w-4 text-blue-600" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareToLinkedIn(newAchievement)}
                    className="flex items-center gap-2"
                  >
                    <Linkedin className="h-4 w-4 text-blue-700" />
                    LinkedIn
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(newAchievement)}
                  className="flex items-center gap-2 justify-center"
                >
                  {copiedAchievement === newAchievement.id ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy text
                    </>
                  )}
                </Button>
              </div>

              <Button onClick={() => setShowCelebration(false)} className="w-full mt-4">
                Continue
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
