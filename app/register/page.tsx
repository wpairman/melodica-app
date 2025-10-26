"use client"

import type React from "react"

import { useState } from "react"

// Force dynamic rendering to avoid SSR issues with event handlers
export const dynamic = 'force-dynamic'
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Heart, ArrowLeft, Loader2, Music, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

const MENTAL_HEALTH_CONDITIONS = [
  "Depression",
  "Anxiety Disorder",
  "Bipolar Disorder",
  "PTSD (Post-Traumatic Stress Disorder)",
  "OCD (Obsessive-Compulsive Disorder)",
  "ADHD (Attention-Deficit/Hyperactivity Disorder)",
  "Panic Disorder",
  "Social Anxiety Disorder",
  "Generalized Anxiety Disorder",
  "Seasonal Affective Disorder (SAD)",
  "Eating Disorder",
  "Borderline Personality Disorder",
  "Schizophrenia",
  "Autism Spectrum Disorder",
  "Substance Use Disorder",
  "Insomnia/Sleep Disorders",
  "Chronic Pain Disorder",
  "Other",
]

export default function Register() {
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()
  const [isAnalyzing, setIsAnalyzing] = useState({
    artists: false,
    activities: false,
    medications: false,
  })
  const [analyses, setAnalyses] = useState({
    artists: "",
    activities: "",
    medications: "",
  })
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    favoriteArtists: "",
    favoriteActivities: "",
    hasMentalIllness: false,
    mentalHealthConditions: [] as string[],
    isOnMedication: false,
    medications: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleConditionChange = (condition: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      mentalHealthConditions: checked
        ? [...prev.mentalHealthConditions, condition]
        : prev.mentalHealthConditions.filter((c) => c !== condition),
    }))
  }

  const analyzeArtists = async (artists: string) => {
    if (!artists.trim()) return ""

    setIsAnalyzing((prev) => ({ ...prev, artists: true }))
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const analysis = `Based on your favorite artists, here are personalized music recommendations for mood enhancement:

🎵 **Mood-Boosting Recommendations:**
• When feeling low: Try uplifting songs with similar energy to your favorites
• For relaxation: Look for acoustic or instrumental versions of preferred genres
• During workouts: High-energy tracks from artists with similar styles
• For focus: Ambient or lo-fi versions of your preferred music genres

🎶 **Personalized Playlists:**
• "Morning Motivation" - Energetic tracks to start your day
• "Calm Evening" - Soothing music for wind-down time
• "Mood Lift" - Upbeat songs when you need a boost
• "Focus Flow" - Concentration-friendly versions of your style

We'll use this to create custom playlists that match your taste while supporting your mental wellness journey!`

      setAnalyses((prev) => ({ ...prev, artists: analysis }))
    } catch (error) {
      console.error("Error analyzing artists:", error)
      setAnalyses((prev) => ({ ...prev, artists: "Unable to analyze music preferences at this time." }))
    } finally {
      setIsAnalyzing((prev) => ({ ...prev, artists: false }))
    }
  }

  const analyzeActivities = async (activities: string) => {
    if (!activities.trim()) return ""

    setIsAnalyzing((prev) => ({ ...prev, activities: true }))
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const analysis = `Based on your favorite activities, here are personalized wellness recommendations:

🏃‍♀️ **Activity-Based Mood Boosters:**
• Low energy days: Gentle versions of your favorite activities
• High energy days: Intensified or group versions of preferred activities
• Stress relief: Mindful approaches to activities you already enjoy
• Social connection: Ways to share your interests with others

🎯 **Personalized Suggestions:**
• "Quick Mood Lift" - 5-minute versions of your favorite activities
• "Weekend Wellness" - Extended sessions of preferred activities
• "Social Sessions" - Group activities based on your interests
• "Mindful Moments" - Meditative approaches to your hobbies

💡 **Smart Recommendations:**
• Weather-based alternatives for outdoor activities
• Indoor adaptations for your favorite outdoor pursuits
• Seasonal variations of year-round activities
• Equipment-free versions for travel or convenience

We'll suggest activities that align with your interests while supporting your mental health goals!`

      setAnalyses((prev) => ({ ...prev, activities: analysis }))
    } catch (error) {
      console.error("Error analyzing activities:", error)
      setAnalyses((prev) => ({ ...prev, activities: "Unable to analyze activity preferences at this time." }))
    } finally {
      setIsAnalyzing((prev) => ({ ...prev, activities: false }))
    }
  }

  const analyzeMedications = async (medications: string) => {
    if (!medications.trim()) return ""

    setIsAnalyzing((prev) => ({ ...prev, medications: true }))
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const analysis = `Based on the medications you've listed, here are some potential mood-related considerations:

• Some medications may affect energy levels and sleep patterns
• Certain medications can influence mood stability and emotional regulation
• It's important to track how you feel throughout the day, especially during medication timing
• Consider noting any side effects or mood changes in your daily entries

Remember: This is general information only. Always consult with your healthcare provider about your medications and their effects on your mental health.`

      setAnalyses((prev) => ({ ...prev, medications: analysis }))
    } catch (error) {
      console.error("Error analyzing medications:", error)
      setAnalyses((prev) => ({
        ...prev,
        medications: "Unable to analyze medications at this time. Please consult with your healthcare provider.",
      }))
    } finally {
      setIsAnalyzing((prev) => ({ ...prev, medications: false }))
    }
  }

  const handleArtistsBlur = () => {
    if (formData.favoriteArtists && !analyses.artists) {
      analyzeArtists(formData.favoriteArtists)
    }
  }

  const handleActivitiesBlur = () => {
    if (formData.favoriteActivities && !analyses.activities) {
      analyzeActivities(formData.favoriteActivities)
    }
  }

  const handleMedicationBlur = () => {
    if (formData.medications && !analyses.medications) {
      analyzeMedications(formData.medications)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      })
      return
    }

    // Store user data in localStorage for demo purposes (client-side only)
    const userData = {
      ...formData,
      artistAnalysis: analyses.artists,
      activityAnalysis: analyses.activities,
      medicationAnalysis: analyses.medications,
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem("userData", JSON.stringify(userData))
      
      // Save credentials for easy login (with "Remember me" enabled by default)
      localStorage.setItem("savedCredentials", JSON.stringify({
        email: formData.email,
        password: formData.password,
      }))
    }

    // Use the auth context to log in the user
    login(userData)

    toast({
      title: "Account created successfully!",
      description: "Welcome to Melodica - your personalized recommendations are ready!",
    })

    // Redirect to dashboard
    router.push("/dashboard")
  }

  const isAnyAnalyzing = Object.values(isAnalyzing).some(Boolean)

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="m-auto w-full max-w-md p-4">
        <Card className="border-none shadow-lg bg-gray-800 border-gray-700">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Link href="/" className="inline-flex items-center text-white hover:text-gray-300">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
              <div className="ml-auto flex items-center">
                <Heart className="h-6 w-6 text-rose-500 mr-2" />
                <span className="font-semibold text-white">Melodica</span>
              </div>
            </div>
            <CardTitle className="text-2xl mt-4 text-white">Create an account</CardTitle>
            <CardDescription className="text-gray-300">Enter your information to get started with personalized mood tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-white">Gender</Label>
                <select
                  id="gender"
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleSelectChange}
                  className="flex h-10 w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              {/* Favorite Artists Section */}
              <div className="space-y-3 pt-4 border-t border-gray-600">
                <div className="flex items-center space-x-2">
                  <Music className="h-4 w-4 text-teal-400" />
                  <Label htmlFor="favoriteArtists" className="text-sm font-medium text-white">
                    Favorite Artists/Musicians
                  </Label>
                </div>
                <Textarea
                  id="favoriteArtists"
                  name="favoriteArtists"
                  placeholder="List your favorite artists or musicians (e.g., Taylor Swift, The Beatles, Kendrick Lamar...)"
                  value={formData.favoriteArtists}
                  onChange={handleChange}
                  onBlur={handleArtistsBlur}
                  className="min-h-[60px] text-sm bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />

                {isAnalyzing.artists && (
                  <div className="flex items-center space-x-2 text-sm text-gray-300">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing your music taste...</span>
                  </div>
                )}

                {analyses.artists && (
                  <div className="p-3 bg-purple-900/20 rounded-md border border-purple-800">
                    <h4 className="text-sm font-semibold text-white mb-2 flex items-center">
                      <Music className="h-4 w-4 mr-1" />
                      Music Recommendations:
                    </h4>
                    <div className="text-xs text-gray-300 whitespace-pre-line">{analyses.artists}</div>
                  </div>
                )}
              </div>

              {/* Favorite Activities Section */}
              <div className="space-y-3 pt-4 border-t border-gray-600">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-teal-400" />
                  <Label htmlFor="favoriteActivities" className="text-sm font-medium text-white">
                    Favorite Activities
                  </Label>
                </div>
                <Textarea
                  id="favoriteActivities"
                  name="favoriteActivities"
                  placeholder="List your favorite activities (e.g., hiking, reading, cooking, gaming, yoga...)"
                  value={formData.favoriteActivities}
                  onChange={handleChange}
                  onBlur={handleActivitiesBlur}
                  className="min-h-[60px] text-sm bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />

                {isAnalyzing.activities && (
                  <div className="flex items-center space-x-2 text-sm text-gray-300">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing your activity preferences...</span>
                  </div>
                )}

                {analyses.activities && (
                  <div className="p-3 bg-green-900/20 rounded-md border border-green-800">
                    <h4 className="text-sm font-semibold text-white mb-2 flex items-center">
                      <Activity className="h-4 w-4 mr-1" />
                      Activity Recommendations:
                    </h4>
                    <div className="text-xs text-gray-300 whitespace-pre-line">{analyses.activities}</div>
                  </div>
                )}
              </div>

              {/* Mental Health Section */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasMentalIllness"
                    name="hasMentalIllness"
                    checked={formData.hasMentalIllness}
                    onChange={handleChange}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="hasMentalIllness" className="text-sm font-medium text-white">
                    I have been diagnosed with a mental health condition
                  </Label>
                </div>

                {formData.hasMentalIllness && (
                  <div className="space-y-2 ml-6">
                    <Label className="text-sm text-white">Please select all that apply:</Label>
                    <div className="max-h-32 overflow-y-auto border rounded-md p-2 bg-gray-700 border-gray-600">
                      {MENTAL_HEALTH_CONDITIONS.map((condition) => (
                        <div key={condition} className="flex items-center space-x-2 py-1">
                          <input
                            type="checkbox"
                            id={condition}
                            checked={formData.mentalHealthConditions.includes(condition)}
                            onChange={(e) => handleConditionChange(condition, e.target.checked)}
                            className="h-3 w-3 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                          />
                          <Label htmlFor={condition} className="text-xs text-white">
                            {condition}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Medication Section */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isOnMedication"
                    name="isOnMedication"
                    checked={formData.isOnMedication}
                    onChange={handleChange}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="isOnMedication" className="text-sm font-medium text-white">
                    I am currently taking medication
                  </Label>
                </div>

                {formData.isOnMedication && (
                  <div className="space-y-3 ml-6">
                    <div className="space-y-2">
                      <Label htmlFor="medications" className="text-sm text-white">
                        Please list your current medications:
                      </Label>
                      <Textarea
                        id="medications"
                        name="medications"
                        placeholder="List your medications (e.g., Sertraline 50mg, Adderall XR 20mg, etc.)"
                        value={formData.medications}
                        onChange={handleChange}
                        onBlur={handleMedicationBlur}
                        className="min-h-[60px] text-sm bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>

                    {isAnalyzing.medications && (
                      <div className="flex items-center space-x-2 text-sm text-gray-300">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Analyzing medications...</span>
                      </div>
                    )}

                    {analyses.medications && (
                      <div className="p-3 bg-blue-900/20 rounded-md border border-blue-800">
                        <h4 className="text-sm font-semibold text-white mb-2">Medical Analysis:</h4>
                        <div className="text-xs text-gray-300 whitespace-pre-line">{analyses.medications}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-start space-x-2 pt-4">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="h-4 w-4 mt-1 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="text-sm text-white leading-tight">
                  I agree to the{" "}
                  <Link href="/terms" className="text-teal-400 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/terms" className="text-teal-400 hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isAnyAnalyzing}>
                {isAnyAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-gray-300">
              Already have an account?{" "}
              <Link href="/login" className="text-teal-400 hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}