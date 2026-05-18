"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { User, Share2, Users, Copy, CheckCircle2, Lock, Globe } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getUserPlan, hasFeatureAccess } from "@/lib/plan-features"
import { UpgradePrompt } from "@/components/upgrade-prompt"
import { useIsNative } from "@/hooks/use-is-native"

interface SharedProfile {
  id: string
  userId: string
  userName: string
  userEmail: string
  sharedAt: Date
  sharedData: {
    moodTrends: boolean
    activityProgress: boolean
    achievements: boolean
    musicPreferences: boolean
  }
}

export default function ProfileSharing() {
  const { toast } = useToast()
  const { isNative } = useIsNative()
  const [isSharingEnabled, setIsSharingEnabled] = useState(false)
  const [shareSettings, setShareSettings] = useState({
    moodTrends: true,
    activityProgress: true,
    achievements: true,
    musicPreferences: false
  })
  const [sharedProfiles, setSharedProfiles] = useState<SharedProfile[]>([])
  const [shareCode, setShareCode] = useState("")
  const [userPlan, setUserPlan] = useState<string>("free")
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const plan = getUserPlan()
      setUserPlan(plan)
      
      // Load sharing settings
      const settings = localStorage.getItem("profileSharingSettings")
      if (settings) {
        try {
          const parsed = JSON.parse(settings)
          setIsSharingEnabled(parsed.enabled || false)
          setShareSettings(parsed.settings || shareSettings)
          setShareCode(parsed.shareCode || "")
        } catch (e) {
          console.error("Error parsing sharing settings:", e)
        }
      }
      
      // Load shared profiles
      const shared = localStorage.getItem("sharedProfiles")
      if (shared) {
        try {
          const parsed = JSON.parse(shared)
          setSharedProfiles(parsed.map((p: any) => ({
            ...p,
            sharedAt: new Date(p.sharedAt)
          })))
        } catch (e) {
          console.error("Error parsing shared profiles:", e)
        }
      }
    }
  }, [])

  const generateShareCode = () => {
    const code = `MELODICA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    setShareCode(code)
    
    const settings = {
      enabled: isSharingEnabled,
      settings: shareSettings,
      shareCode: code
    }
    localStorage.setItem("profileSharingSettings", JSON.stringify(settings))
    
    return code
  }

  const handleToggleSharing = (enabled: boolean) => {
    if (!isNative && !hasFeatureAccess(userPlan as any, "profileSharing")) {
      setShowUpgrade(true)
      return
    }

    setIsSharingEnabled(enabled)
    
    if (enabled && !shareCode) {
      generateShareCode()
    }
    
    const settings = {
      enabled,
      settings: shareSettings,
      shareCode: shareCode || generateShareCode()
    }
    localStorage.setItem("profileSharingSettings", JSON.stringify(settings))
    
    toast({
      title: enabled ? "Profile Sharing Enabled" : "Profile Sharing Disabled",
      description: enabled 
        ? "Your profile can now be shared with other Ultimate users."
        : "Your profile is now private.",
    })
  }

  const handleCopyShareCode = () => {
    if (!shareCode) {
      generateShareCode()
    }
    
    const codeToCopy = shareCode || generateShareCode()
    navigator.clipboard.writeText(codeToCopy)
    setCopied(true)
    
    toast({
      title: "Share Code Copied!",
      description: "Share this code with other Ultimate users to connect.",
    })
    
    setTimeout(() => setCopied(false), 2000)
  }

  const handleJoinShareCode = () => {
    // In a real implementation, this would validate and connect to another user's profile
    toast({
      title: "Feature Coming Soon",
      description: "Profile connection via share code will be available soon.",
    })
  }

  const handleUpdateShareSettings = (key: string, value: boolean) => {
    const updated = { ...shareSettings, [key]: value }
    setShareSettings(updated)
    
    const settings = {
      enabled: isSharingEnabled,
      settings: updated,
      shareCode
    }
    localStorage.setItem("profileSharingSettings", JSON.stringify(settings))
    
    toast({
      title: "Settings Updated",
      description: "Your sharing preferences have been saved.",
    })
  }

  if (!isNative && !hasFeatureAccess(userPlan as any, "profileSharing")) {
    return (
      <>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-pink-500" />
              Profile Sharing
            </CardTitle>
            <CardDescription className="text-gray-300">
              Share your wellness journey with other Ultimate users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-300 mb-4">
                  With profile sharing, you can:
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-pink-500" />
                    Share mood trends and progress with friends
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-pink-500" />
                    Connect with other Ultimate users
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-pink-500" />
                    Celebrate achievements together
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-pink-500" />
                    Build a supportive community
                  </li>
                </ul>
              </div>
              <Button
                onClick={() => setShowUpgrade(true)}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white"
              >
                Upgrade to Ultimate for Profile Sharing
              </Button>
            </div>
          </CardContent>
        </Card>
        {showUpgrade && (
          <UpgradePrompt
            feature="Profile Sharing"
            requiredPlan="ultimate"
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
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-pink-500" />
          Profile Sharing
        </CardTitle>
        <CardDescription className="text-gray-300">
          Share your wellness journey with other Ultimate users
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Sharing */}
        <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-3">
            {isSharingEnabled ? (
              <Globe className="h-5 w-5 text-green-500" />
            ) : (
              <Lock className="h-5 w-5 text-gray-500" />
            )}
            <div>
              <p className="text-white font-medium">
                {isSharingEnabled ? "Profile Sharing Enabled" : "Profile Sharing Disabled"}
              </p>
              <p className="text-sm text-gray-400">
                {isSharingEnabled 
                  ? "Your profile can be shared with other Ultimate users"
                  : "Your profile is private"}
              </p>
            </div>
          </div>
          <Switch
            checked={isSharingEnabled}
            onCheckedChange={handleToggleSharing}
          />
        </div>

        {isSharingEnabled && (
          <>
            {/* Share Code */}
            <div className="space-y-4">
              <div>
                <Label className="text-white mb-2 block">Your Share Code</Label>
                <div className="flex gap-2">
                  <Input
                    value={shareCode || "Generate a code to share"}
                    readOnly
                    className="bg-gray-700 border-gray-600 text-white font-mono"
                  />
                  <Button
                    onClick={handleCopyShareCode}
                    className="bg-pink-600 hover:bg-pink-700 text-white"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Share this code with other Ultimate users to connect your profiles
                </p>
              </div>

              {/* Join Share Code */}
              <div>
                <Label className="text-white mb-2 block">Join with Share Code</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter share code"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Button
                    onClick={handleJoinShareCode}
                    variant="outline"
                    className="border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white"
                  >
                    Connect
                  </Button>
                </div>
              </div>
            </div>

            {/* Share Settings */}
            <div className="space-y-4">
              <Label className="text-white">What to Share</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="text-white text-sm font-medium">Mood Trends</p>
                    <p className="text-gray-400 text-xs">Share your mood patterns and insights</p>
                  </div>
                  <Switch
                    checked={shareSettings.moodTrends}
                    onCheckedChange={(checked) => handleUpdateShareSettings("moodTrends", checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="text-white text-sm font-medium">Activity Progress</p>
                    <p className="text-gray-400 text-xs">Share your activity completion and programs</p>
                  </div>
                  <Switch
                    checked={shareSettings.activityProgress}
                    onCheckedChange={(checked) => handleUpdateShareSettings("activityProgress", checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="text-white text-sm font-medium">Achievements</p>
                    <p className="text-gray-400 text-xs">Share your milestones and rewards</p>
                  </div>
                  <Switch
                    checked={shareSettings.achievements}
                    onCheckedChange={(checked) => handleUpdateShareSettings("achievements", checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="text-white text-sm font-medium">Music Preferences</p>
                    <p className="text-gray-400 text-xs">Share your favorite artists and playlists</p>
                  </div>
                  <Switch
                    checked={shareSettings.musicPreferences}
                    onCheckedChange={(checked) => handleUpdateShareSettings("musicPreferences", checked)}
                  />
                </div>
              </div>
            </div>

            {/* Shared Profiles */}
            {sharedProfiles.length > 0 && (
              <div className="space-y-4">
                <Label className="text-white">Connected Profiles</Label>
                <div className="space-y-2">
                  {sharedProfiles.map((profile) => (
                    <Card key={profile.id} className="bg-gray-700/50 border-gray-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center">
                              <User className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{profile.userName}</p>
                              <p className="text-xs text-gray-400">
                                Connected {profile.sharedAt.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-green-600 text-white">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}



