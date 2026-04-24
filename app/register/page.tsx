"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Heart, ArrowRight, Loader2, Music, Sparkles, Zap, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { signInWithCustomToken } from "firebase/auth"
import { auth } from "@/lib/firebase-config"
import { createStripeCheckoutSession } from "@/lib/api-utils"
import { useToast } from "@/hooks/use-toast"

const PLAN_LABELS: Record<string, string> = {
  premium_monthly: "Premium (Monthly)",
  premium_yearly: "Premium (Yearly)",
  ultimate_monthly: "Ultimate (Monthly)",
  ultimate_yearly: "Ultimate (Yearly)",
  ultimate_lifetime: "Lifetime",
}

const SUBSCRIPTION_OPTIONS = [
  { plan: "premium", interval: "monthly", label: "Premium Monthly", price: "$1.99/mo", popular: true, icon: Music },
  { plan: "premium", interval: "yearly", label: "Premium Yearly", price: "$19.99/yr", popular: false, icon: Music },
  { plan: "ultimate", interval: "monthly", label: "Ultimate Monthly", price: "$2.99/mo", popular: false, icon: Sparkles },
  { plan: "ultimate", interval: "yearly", label: "Ultimate Yearly", price: "$29.99/yr", popular: false, icon: Sparkles },
  { plan: "ultimate", interval: "lifetime", label: "Lifetime", price: "$99.99 once", popular: false, icon: Zap },
]

const MUSIC_GENRES = [
  "Pop", "Rock", "Hip-Hop/Rap", "R&B", "Country", "Electronic/Dance",
  "Jazz", "Classical", "Folk", "Indie", "Metal", "Blues", "Reggae",
  "Ambient", "Alternative", "Soul", "Funk",
]

const ACTIVITY_OPTIONS = [
  "Yoga", "Meditation", "Exercise", "Reading", "Journaling", "Walking",
  "Creative hobbies", "Music listening", "Deep breathing", "Stretching",
  "Nature time", "Social connection", "Mindfulness", "Art/Crafts",
]

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [selectedInterval, setSelectedInterval] = useState<string>("")
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "" as "" | "male" | "female" | "non-binary",
    musicGenres: [] as string[],
    favoriteArtists: "",
    activityPreferences: [] as string[],
    mentalIllnesses: "no" as "yes" | "no",
    mentalIllnessesDetails: "",
    medication: "no" as "yes" | "no",
    medicationDetails: "",
  })

  const planFromUrl = searchParams?.get("plan") || ""
  const intervalFromUrl = searchParams?.get("interval") || ""

  const plan = planFromUrl || selectedPlan
  const interval = intervalFromUrl || selectedInterval
  const tier = plan && interval ? `${plan}_${interval}` : ""
  const hasPlanSelected = !!tier

  useEffect(() => {
    if (planFromUrl && intervalFromUrl) {
      setSelectedPlan(planFromUrl)
      setSelectedInterval(intervalFromUrl)
    }
  }, [planFromUrl, intervalFromUrl])

  const handleSelectPlan = (p: string, i: string) => {
    setSelectedPlan(p)
    setSelectedInterval(i)
  }

  const handleMusicGenreChange = (genre: string, checked: boolean) => {
    setForm((p) => ({
      ...p,
      musicGenres: checked ? [...p.musicGenres, genre] : p.musicGenres.filter((g) => g !== genre),
    }))
  }

  const handleActivityChange = (activity: string, checked: boolean) => {
    setForm((p) => ({
      ...p,
      activityPreferences: checked ? [...p.activityPreferences, activity] : p.activityPreferences.filter((a) => a !== activity),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tier || !plan || !interval) {
      toast({ title: "Please select a subscription plan", variant: "destructive" })
      return
    }
    if (form.password !== form.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" })
      return
    }
    if (form.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" })
      return
    }
    if (!form.name.trim()) {
      toast({ title: "Please enter your name", variant: "destructive" })
      return
    }
    if (!form.email.trim()) {
      toast({ title: "Please enter your email", variant: "destructive" })
      return
    }
    if (!form.gender) {
      toast({ title: "Please select your gender", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const normalizedEmail = form.email.toLowerCase().trim()

      // ✅ FIXED: Calling Netlify function directly instead of Next.js API route
      const response = await fetch("/.netlify/functions/auth-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: normalizedEmail,
          password: form.password,
          gender: form.gender,
          favoriteArtists: form.favoriteArtists.trim() || "",
          favoriteActivities: form.activityPreferences.join(", "),
          musicGenres: form.musicGenres.join(", "),
          mentalIllnesses: form.mentalIllnesses === "yes"
            ? form.mentalIllnessesDetails.trim() || "Yes"
            : "No",
          medication: form.medication === "yes"
            ? form.medicationDetails.trim() || "Yes"
            : "No",
          selectedPlan: plan,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Registration failed",
          description: data.error || "Something went wrong. Please try again.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const customToken = data.customToken as string | undefined
      if (!customToken) {
        toast({
          title: "Registration incomplete",
          description: "Could not start your session. Try logging in with your new account.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }
      if (!auth) {
        toast({
          title: "Configuration error",
          description: "Authentication is not available. Refresh the page and try again.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }
      await signInWithCustomToken(auth, customToken)

      const { url } = await createStripeCheckoutSession(tier, normalizedEmail)
      if (url) {
        window.location.href = url
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-900 to-gray-800">
      <header className="border-b border-gray-700 px-4 py-4 lg:px-6">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold text-white hover:text-gray-300">
          <Heart className="h-6 w-6 text-rose-500" />
          <span>Melodica</span>
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center p-4 pb-12">
        <Card className="w-full max-w-lg border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-xl text-white">Create your account</CardTitle>
            <CardDescription className="text-gray-300">
              {hasPlanSelected
                ? `You're signing up for ${PLAN_LABELS[tier] || tier}. Your answers help our AI tailor music, activities, and insights to you.`
                : "Choose your plan and fill in your details below. Our AI uses this to personalize your experience."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Plan selection */}
            <div className="mb-6 space-y-3">
              <h3 className="text-sm font-medium text-teal-400">Choose your subscription</h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {SUBSCRIPTION_OPTIONS.map((opt) => {
                  const optTier = `${opt.plan}_${opt.interval}`
                  const isSelected = plan === opt.plan && interval === opt.interval
                  const Icon = opt.icon
                  return (
                    <button
                      key={optTier}
                      type="button"
                      onClick={() => handleSelectPlan(opt.plan, opt.interval)}
                      className={`flex flex-col items-start gap-1 rounded-lg border-2 p-3 text-left transition ${
                        isSelected
                          ? "border-teal-500 bg-teal-500/20"
                          : "border-gray-600 bg-gray-700/50 hover:border-gray-500"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <Icon className={`h-4 w-4 ${isSelected ? "text-teal-400" : "text-gray-400"}`} />
                        {isSelected && <Check className="h-4 w-4 text-teal-400" />}
                      </div>
                      <span className="text-sm font-medium text-white">{opt.label}</span>
                      <span className="text-xs text-gray-400">{opt.price}</span>
                      {opt.popular && (
                        <span className="rounded bg-teal-600/50 px-1.5 py-0.5 text-[10px] text-teal-200">
                          Popular
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-gray-500">
                <Link href="/pricing" className="text-teal-400 hover:underline">
                  Compare all plans
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-teal-400">Basic information</h3>
                <div>
                  <Label htmlFor="name" className="text-white">Full name</Label>
                  <Input
                    id="name"
                    required
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="mt-1 border-gray-600 bg-gray-700 text-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className="mt-1 border-gray-600 bg-gray-700 text-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <Label className="text-white">Gender</Label>
                  <RadioGroup
                    value={form.gender}
                    onValueChange={(v) => setForm((p) => ({ ...p, gender: v as typeof form.gender }))}
                    className="mt-2 flex flex-wrap gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="gender-male" className="border-gray-500" />
                      <Label htmlFor="gender-male" className="text-gray-300 cursor-pointer">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="gender-female" className="border-gray-500" />
                      <Label htmlFor="gender-female" className="text-gray-300 cursor-pointer">Female</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="non-binary" id="gender-non-binary" className="border-gray-500" />
                      <Label htmlFor="gender-non-binary" className="text-gray-300 cursor-pointer">Non-binary</Label>
                    </div>
                  </RadioGroup>
                  <p className="mt-1 text-xs text-gray-500">Female users get access to period tracking & cycle insights</p>
                </div>
                <div>
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    className="mt-1 border-gray-600 bg-gray-700 text-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-white">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    placeholder="Confirm your password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    className="mt-1 border-gray-600 bg-gray-700 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Music preferences */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-teal-400">Music preferences</h3>
                <p className="text-xs text-gray-400">Select genres you enjoy (optional)</p>
                <div className="grid grid-cols-2 gap-2">
                  {MUSIC_GENRES.map((genre) => (
                    <div key={genre} className="flex items-center space-x-2">
                      <Checkbox
                        id={`genre-${genre}`}
                        checked={form.musicGenres.includes(genre)}
                        onCheckedChange={(checked) => handleMusicGenreChange(genre, checked === true)}
                        className="border-gray-500 data-[state=checked]:bg-teal-600"
                      />
                      <Label htmlFor={`genre-${genre}`} className="text-sm text-gray-300 cursor-pointer">
                        {genre}
                      </Label>
                    </div>
                  ))}
                </div>
                <div>
                  <Label htmlFor="favoriteArtists" className="text-white text-sm">Favorite artists (optional)</Label>
                  <Input
                    id="favoriteArtists"
                    placeholder="e.g. Taylor Swift, Coldplay"
                    value={form.favoriteArtists}
                    onChange={(e) => setForm((p) => ({ ...p, favoriteArtists: e.target.value }))}
                    className="mt-1 border-gray-600 bg-gray-700 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Activity preferences */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-teal-400">Activity preferences</h3>
                <p className="text-xs text-gray-400">What activities do you enjoy? (optional)</p>
                <div className="grid grid-cols-2 gap-2">
                  {ACTIVITY_OPTIONS.map((activity) => (
                    <div key={activity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`activity-${activity}`}
                        checked={form.activityPreferences.includes(activity)}
                        onCheckedChange={(checked) => handleActivityChange(activity, checked === true)}
                        className="border-gray-500 data-[state=checked]:bg-teal-600"
                      />
                      <Label htmlFor={`activity-${activity}`} className="text-sm text-gray-300 cursor-pointer">
                        {activity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mental health */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-teal-400">Mental health</h3>
                <p className="text-xs text-gray-400">This helps us tailor recommendations. Your answers are private and secure.</p>
                <div>
                  <Label className="text-white text-sm">Do you have any mental health conditions?</Label>
                  <RadioGroup
                    value={form.mentalIllnesses}
                    onValueChange={(v) => setForm((p) => ({ ...p, mentalIllnesses: v as "yes" | "no" }))}
                    className="mt-2 flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="mental-no" className="border-gray-500" />
                      <Label htmlFor="mental-no" className="text-gray-300 cursor-pointer">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="mental-yes" className="border-gray-500" />
                      <Label htmlFor="mental-yes" className="text-gray-300 cursor-pointer">Yes</Label>
                    </div>
                  </RadioGroup>
                  {form.mentalIllnesses === "yes" && (
                    <Textarea
                      placeholder="If you're comfortable sharing, list any conditions (e.g. anxiety, depression)"
                      value={form.mentalIllnessesDetails}
                      onChange={(e) => setForm((p) => ({ ...p, mentalIllnessesDetails: e.target.value }))}
                      className="mt-2 border-gray-600 bg-gray-700 text-white placeholder:text-gray-400 min-h-[80px]"
                    />
                  )}
                </div>
                <div>
                  <Label className="text-white text-sm">Are you currently taking any medication for mental health?</Label>
                  <RadioGroup
                    value={form.medication}
                    onValueChange={(v) => setForm((p) => ({ ...p, medication: v as "yes" | "no" }))}
                    className="mt-2 flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="med-no" className="border-gray-500" />
                      <Label htmlFor="med-no" className="text-gray-300 cursor-pointer">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="med-yes" className="border-gray-500" />
                      <Label htmlFor="med-yes" className="text-gray-300 cursor-pointer">Yes</Label>
                    </div>
                  </RadioGroup>
                  {form.medication === "yes" && (
                    <Textarea
                      placeholder="If you're comfortable sharing, list any medications"
                      value={form.medicationDetails}
                      onChange={(e) => setForm((p) => ({ ...p, medicationDetails: e.target.value }))}
                      className="mt-2 border-gray-600 bg-gray-700 text-white placeholder:text-gray-400 min-h-[80px]"
                    />
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Continue to payment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-teal-400 hover:underline">
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}