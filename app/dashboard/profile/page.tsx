"use client"

import type React from "react"

import { useState, useEffect } from "react"

// Force dynamic rendering to avoid SSR issues with event handlers
export const dynamic = 'force-dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Camera, Lock, User, Heart, Music, Activity, Save, Edit3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import DashboardLayout from "@/components/layouts/dashboard-layout"

export default function ProfilePage() {
  const { toast } = useToast()
  const [userData, setUserData] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [profileImage, setProfileImage] = useState<string>("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    favoriteArtists: "",
    favoriteActivities: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      // Load user data from localStorage
      const storedData = localStorage.getItem("userData")
      if (storedData) {
        const parsed = JSON.parse(storedData)
        setUserData(parsed)
        setFormData({
          name: parsed.name || "",
          email: parsed.email || "",
          bio: parsed.bio || "",
          favoriteArtists: parsed.favoriteArtists || "",
          favoriteActivities: parsed.favoriteActivities || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      }

      // Load profile image
      const storedImage = localStorage.getItem("profileImage")
      if (storedImage) {
        setProfileImage(storedImage)
      }
    }
  }, [])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        setProfileImage(imageUrl)
        if (typeof window !== 'undefined') {
          localStorage.setItem("profileImage", imageUrl)
        }
        toast({
          title: "Profile picture updated",
          description: "Your profile picture has been saved successfully.",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    // Validate password change if attempted
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        toast({
          title: "Password mismatch",
          description: "New password and confirmation don't match.",
          variant: "destructive",
        })
        return
      }
      if (formData.newPassword.length < 6) {
        toast({
          title: "Password too short",
          description: "Password must be at least 6 characters long.",
          variant: "destructive",
        })
        return
      }
    }

    // Update user data
    const updatedUserData = {
      ...userData,
      name: formData.name,
      email: formData.email,
      bio: formData.bio,
      favoriteArtists: formData.favoriteArtists,
      favoriteActivities: formData.favoriteActivities,
      lastUpdated: new Date().toISOString(),
    }

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem("userData", JSON.stringify(updatedUserData))
    }
    setUserData(updatedUserData)
    setIsEditing(false)

    // Clear password fields
    setFormData((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }))

    toast({
      title: "Profile updated",
      description: "Your profile has been saved successfully.",
    })
  }

  const handleClearSavedCredentials = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("savedCredentials")
    }
    toast({
      title: "Saved credentials cleared",
      description: "Your saved login credentials have been removed.",
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getMoodStats = () => {
    if (typeof window === 'undefined') return null
    
    const moodHistory = JSON.parse(localStorage.getItem("moodHistory") || "[]")
    if (moodHistory.length === 0) return null

    const totalEntries = moodHistory.length
    const avgMood = moodHistory.reduce((sum: number, entry: any) => sum + entry.mood, 0) / totalEntries
    const streak = calculateStreak(moodHistory)

    return { totalEntries, avgMood: avgMood.toFixed(1), streak }
  }

  const calculateStreak = (history: any[]) => {
    if (history.length === 0) return 0

    let streak = 0
    const today = new Date()
    const sortedHistory = history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    for (let i = 0; i < sortedHistory.length; i++) {
      const entryDate = new Date(sortedHistory[i].timestamp)
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === i) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  const moodStats = getMoodStats()

  if (!userData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p>Loading profile...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Profile</h1>
            <p className="text-gray-300">Manage your account and customize your experience</p>
          </div>
          <Button onClick={() => {
            if (typeof window !== 'undefined') {
              isEditing ? handleSave() : setIsEditing(true)
            }
          }} className="flex items-center gap-2">
            {isEditing ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
            {isEditing ? "Save Changes" : "Edit Profile"}
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Overview */}
          <Card className="md:col-span-1 bg-gray-800 border-gray-700">
            <CardHeader className="text-center">
              <div className="relative mx-auto">
                <Avatar className="w-24 h-24 mx-auto">
                  <AvatarImage src={profileImage || "/placeholder.svg"} alt={userData.name} />
                  <AvatarFallback className="text-2xl bg-gray-700 text-white">{getInitials(userData.name)}</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                    <Camera className="h-4 w-4" />
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
              <CardTitle className="mt-4 text-white">{userData.name}</CardTitle>
              <CardDescription className="text-gray-300">{userData.email}</CardDescription>
            </CardHeader>
            <CardContent>
              {moodStats && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-400 uppercase tracking-wide">Mood Stats</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-blue-900/20 rounded-lg border border-blue-800">
                      <div className="text-2xl font-bold text-blue-400">{moodStats.totalEntries}</div>
                      <div className="text-xs text-gray-300">Total Entries</div>
                    </div>
                    <div className="text-center p-3 bg-green-900/20 rounded-lg border border-green-800">
                      <div className="text-2xl font-bold text-green-400">{moodStats.avgMood}</div>
                      <div className="text-xs text-gray-300">Avg Mood</div>
                    </div>
                    <div className="text-center p-3 bg-purple-900/20 rounded-lg border border-purple-800 col-span-2">
                      <div className="text-2xl font-bold text-purple-400">{moodStats.streak}</div>
                      <div className="text-xs text-gray-300">Day Streak</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name" className="text-white">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio" className="text-white">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us a bit about yourself..."
                    disabled={!isEditing}
                    rows={3}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="artists" className="flex items-center gap-2">
                    <Music className="h-4 w-4" />
                    Favorite Artists
                  </Label>
                  <Textarea
                    id="artists"
                    value={formData.favoriteArtists}
                    onChange={(e) => setFormData((prev) => ({ ...prev, favoriteArtists: e.target.value }))}
                    placeholder="List your favorite artists or musicians..."
                    disabled={!isEditing}
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="activities" className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Favorite Activities
                  </Label>
                  <Textarea
                    id="activities"
                    value={formData.favoriteActivities}
                    onChange={(e) => setFormData((prev) => ({ ...prev, favoriteActivities: e.target.value }))}
                    placeholder="List your favorite activities..."
                    disabled={!isEditing}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            {isEditing && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Change Password
                  </CardTitle>
                  <CardDescription>Leave blank if you don't want to change your password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData((prev) => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Clear Saved Credentials */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Saved Credentials
                </CardTitle>
                <CardDescription>Manage your saved login credentials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-400">
                    If you have saved your login credentials for easy access, you can clear them here for security purposes.
                  </p>
                  <Button 
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        handleClearSavedCredentials()
                      }
                    }}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Clear Saved Credentials
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm text-gray-600">Member Since</Label>
                    <p className="font-medium">
                      {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "Recently"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Last Updated</Label>
                    <p className="font-medium">
                      {userData.lastUpdated ? new Date(userData.lastUpdated).toLocaleDateString() : "Never"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Account Status</Label>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Subscription</Label>
                    <Badge variant="outline">Free Plan</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
