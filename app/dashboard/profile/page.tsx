"use client"

import type React from "react"

import { useState, useEffect } from "react"

// Force dynamic rendering to avoid SSR issues with event handlers
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Camera, Lock, User, Heart, Music, Activity, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import DashboardLayout from "@/components/layouts/dashboard-layout"
import { MenuButton } from "@/components/navigation-sidebar"
import { AuthGuard } from "@/components/auth-guard"

export default function ProfilePage() {
  const { toast } = useToast()
  const [userData, setUserData] = useState<any>(null)
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
    <AuthGuard>
      <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        {/* Fixed header with menu button */}
        <div className="sticky top-0 z-50 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <MenuButton />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Profile</h1>
              <p className="text-gray-300 text-sm">Manage your account and customize your experience</p>
            </div>
          </div>
          <Button onClick={() => typeof window !== 'undefined' && handleSave()} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Profile
          </Button>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Profile Overview */}
          <Card className="md:col-span-1 bg-gray-800 border-gray-700">
            <CardHeader className="text-center">
              <div className="relative mx-auto">
                <Avatar className="w-24 h-24 mx-auto">
                  <AvatarImage src={profileImage || "/placeholder.svg"} alt={userData.name} />
                  <AvatarFallback className="text-2xl bg-gray-700 text-white">{getInitials(userData.name)}</AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 bg-teal-500 text-white p-2 rounded-full cursor-pointer hover:bg-teal-600 transition-colors shadow-lg">
                  <Camera className="h-4 w-4" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-1">Click to add or change photo</p>
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
                      placeholder="Enter your full name"
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
                      placeholder="Enter your email"
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
                    rows={4}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Heart className="h-5 w-5" />
                  Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="artists" className="flex items-center gap-2 text-white">
                    <Music className="h-4 w-4" />
                    Favorite Artists
                  </Label>
                  <Textarea
                    id="artists"
                    value={formData.favoriteArtists}
                    onChange={(e) => setFormData((prev) => ({ ...prev, favoriteArtists: e.target.value }))}
                    placeholder="List your favorite artists or musicians..."
                    rows={3}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 resize-none"
                  />
                </div>
                <div>
                  <Label htmlFor="activities" className="flex items-center gap-2 text-white">
                    <Activity className="h-4 w-4" />
                    Favorite Activities
                  </Label>
                  <Textarea
                    id="activities"
                    value={formData.favoriteActivities}
                    onChange={(e) => setFormData((prev) => ({ ...prev, favoriteActivities: e.target.value }))}
                    placeholder="List your favorite activities..."
                    rows={3}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription className="text-gray-300">Leave blank if you don't want to change your password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword" className="text-white">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="newPassword" className="text-white">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData((prev) => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clear Saved Credentials */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Lock className="h-5 w-5" />
                  Saved Credentials
                </CardTitle>
                <CardDescription className="text-gray-300">Manage your saved login credentials</CardDescription>
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
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm text-gray-400">Member Since</Label>
                    <p className="font-medium text-white">
                      {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "Recently"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-400">Last Updated</Label>
                    <p className="font-medium text-white">
                      {userData.lastUpdated ? new Date(userData.lastUpdated).toLocaleDateString() : "Never"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-400">Account Status</Label>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-400">Subscription</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{userData.subscription?.plan || "Select plan"}</Badge>
                      <Link href="/dashboard/settings" className="text-sm text-teal-600 hover:underline">
                        Change plan
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
    </AuthGuard>
  )
}
