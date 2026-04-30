"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Heart, Music, TrendingUp, Sparkles, Apple, Smartphone, CheckCircle2, ArrowRight, Play, BarChart3, ListMusic, LayoutDashboard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function Home() {
  const { toast } = useToast()
  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuth()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const timer = setTimeout(() => { setShowSplash(false) }, 800)
    return () => clearTimeout(timer)
  }, [])

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    handleEmailSignupCTA()
    if (!email) {
      toast({ title: "Email required", description: "Please enter your email address.", variant: "destructive" })
      return
    }
    setLoading(true)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'email_signup', { event_category: 'engagement', event_label: 'beta_notification' })
    }
    try {
      const existing = localStorage.getItem("beta_signups") || "[]"
      const signups = JSON.parse(existing)
      signups.push({ email, date: new Date().toISOString() })
      localStorage.setItem("beta_signups", JSON.stringify(signups))
      toast({ title: "Thanks for signing up!", description: "We'll notify you when Melodica launches on the App Store." })
      setEmail("")
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', { page_title: 'Home', page_location: window.location.href })
    }
  }, [])

  const trackCTAClick = (ctaName: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'cta_click', { event_category: 'engagement', event_label: ctaName })
    }
  }

  const handleHeaderSignup = () => { trackCTAClick('header_signup'); if (typeof window !== 'undefined') window.location.href = '/pricing' }
  const handleHeroStartFreeClick = () => { trackCTAClick('hero_start_free'); if (typeof window !== 'undefined') window.location.href = '/pricing' }
  const handleHeroViewPricingClick = () => { trackCTAClick('hero_view_pricing'); if (typeof window !== 'undefined') window.location.href = '/pricing' }
  const handlePricingPremiumClick = () => { trackCTAClick('pricing_premium'); if (typeof window !== 'undefined') window.location.href = '/pricing' }
  const handlePricingUltimateClick = () => { trackCTAClick('pricing_ultimate'); if (typeof window !== 'undefined') window.location.href = '/pricing' }
  const handleEmailSignupCTA = () => { trackCTAClick('email_signup') }
  const handleFinalCTASignupClick = () => { trackCTAClick('final_cta_signup'); if (typeof window !== 'undefined') window.location.href = '/pricing' }
  const handleFinalCTAPricingClick = () => { trackCTAClick('final_cta_pricing'); if (typeof window !== 'undefined') window.location.href = '/pricing' }
  const handleLogout = () => { logout(); toast({ title: "Logged out", description: "You have been signed out." }); router.refresh() }

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <Heart className="h-16 w-16 text-teal-600 mx-auto mb-4 animate-pulse" />
          <h1 className="text-2xl font-bold text-gray-900">Melodica</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <Link className="flex items-center justify-center" href="/">
          <Heart className="h-6 w-6 text-teal-600 mr-2" />
          <span className="font-bold text-xl text-gray-900">Melodica</span>
        </Link>
        <nav className="ml-auto flex flex-wrap gap-3 sm:gap-4 items-center justify-end">
          <Link className="text-sm font-medium hover:underline underline-offset-4 text-gray-700 hover:text-teal-600" href="/pricing">Pricing</Link>
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600 max-w-[160px] truncate hidden sm:inline" title={user?.email}>{user?.name || user?.email}</span>
              <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700 hover:underline underline-offset-4">
                <LayoutDashboard className="h-4 w-4 shrink-0" />Dashboard
              </Link>
              <Button type="button" variant="outline" size="sm" className="border-gray-300" onClick={handleLogout}>Log out</Button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4 text-gray-700 hover:text-teal-600">Login</Link>
              <Link href="/register" className="text-sm font-medium hover:underline underline-offset-4 text-gray-700 hover:text-teal-600">Register</Link>
              {isMounted && <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleHeaderSignup}>Sign Up</Button>}
            </>
          )}
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="w-full py-12 md:py-20 lg:py-28 bg-gradient-to-b from-white to-gray-50">
          <div className="container px-4 md:px-6 mx-auto max-w-6xl">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-full border border-teal-200">
                  <Sparkles className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-medium text-teal-900">2-Week Free Trial on All Plans</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-gray-900">
                  Melodica
                  <span className="block text-teal-600 mt-2">Your Mental Wellness Companion</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-lg md:text-xl text-gray-600 leading-relaxed">
                  AI driven therapy app that helps you manage your mood through personalized music recommendations, personalized activity recommendations, mood tracking, and many more mental health insights.
                </p>
              </div>
              {isMounted && (
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {isAuthenticated ? (
                    <>
                      <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 text-lg" asChild>
                        <Link href="/dashboard">Go to dashboard<ArrowRight className="ml-2 h-5 w-5" /></Link>
                      </Button>
                      <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2" onClick={handleHeroViewPricingClick}>View Plans</Button>
                    </>
                  ) : (
                    <>
                      <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 text-lg" onClick={handleHeroStartFreeClick}>
                        Start Free Trial<ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                      <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2" onClick={handleHeroViewPricingClick}>View Plans</Button>
                    </>
                  )}
                </div>
              )}

              <div className="pt-6">
                <p className="text-sm text-gray-500 mb-4">Now Available on iOS</p>
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <Button variant="outline" size="lg" className="border-2 border-gray-300 hover:border-gray-400 bg-white px-6 py-4" disabled>
                    <Apple className="h-6 w-6 mr-2" />
                    <div className="text-left"><div className="text-xs text-gray-500">Download on the</div><div className="text-sm font-semibold">App Store</div></div>
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-2">Available on iPhone and iPad</p>
              </div>

              <div className="mt-10 pt-10 border-t border-gray-200 w-full max-w-2xl">
                <div className="flex items-center gap-2 justify-center mb-4">
                  <Smartphone className="h-5 w-5 text-teal-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Use Melodica Like an App</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6 text-center">Add this website to your home screen for quick access — it works like a native app.</p>
                <div className="grid gap-4 sm:grid-cols-3 text-left">
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2"><Apple className="h-5 w-5 text-gray-700" /><span className="font-medium text-gray-900">iPhone / iPad</span></div>
                    <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                      <li>Open in <strong>Safari</strong></li>
                      <li>Tap the Share button (square with arrow)</li>
                      <li>Scroll and tap <strong>Add to Home Screen</strong></li>
                      <li>Tap <strong>Add</strong></li>
                    </ol>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2"><Smartphone className="h-5 w-5 text-gray-700" /><span className="font-medium text-gray-900">Android / Other</span></div>
                    <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                      <li>Open in <strong>Chrome</strong></li>
                      <li>Tap the <strong>⋮</strong> menu (top right)</li>
                      <li>Tap <strong>Add to Home screen</strong></li>
                      <li>Confirm with <strong>Add</strong></li>
                    </ol>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2"><Smartphone className="h-5 w-5 text-gray-700" /><span className="font-medium text-gray-900">Desktop</span></div>
                    <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                      <li>Open in <strong>Chrome</strong> or <strong>Edge</strong></li>
                      <li>Click the install icon in the address bar</li>
                      <li>Or: Menu → <strong>Install Melodica</strong></li>
                      <li>Click <strong>Install</strong></li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Choose Your Plan */}
        <section className="w-full py-16 bg-gray-50">
          <div className="container px-4 md:px-6 mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Start with a 2-week free trial. Our AI tailors music, activities, and insights to your preferences, gender, and wellness goals.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Link href="/register?plan=premium&interval=monthly" className="block">
                <Card className="h-full border-2 hover:border-teal-500 transition-colors">
                  <CardHeader className="pb-2"><CardTitle className="text-lg">Premium Monthly</CardTitle><CardDescription>$2.99/mo</CardDescription></CardHeader>
                  <CardContent><p className="text-sm text-gray-600 mb-4">2-week free trial</p><Button className="w-full bg-teal-600 hover:bg-teal-700">Get Started</Button></CardContent>
                </Card>
              </Link>
              <Link href="/register?plan=premium&interval=yearly" className="block">
                <Card className="h-full border-2 hover:border-teal-500 transition-colors">
                  <CardHeader className="pb-2"><CardTitle className="text-lg">Premium Yearly</CardTitle><CardDescription>$29.99/yr</CardDescription></CardHeader>
                  <CardContent><p className="text-sm text-gray-600 mb-4">Save with annual billing</p><Button className="w-full bg-teal-600 hover:bg-teal-700">Get Started</Button></CardContent>
                </Card>
              </Link>
              <Link href="/register?plan=ultimate&interval=monthly" className="block">
                <Card className="h-full border-2 hover:border-teal-500 transition-colors">
                  <CardHeader className="pb-2"><CardTitle className="text-lg">Ultimate Monthly</CardTitle><CardDescription>$4.99/mo</CardDescription></CardHeader>
                  <CardContent><p className="text-sm text-gray-600 mb-4">Period tracking for female users</p><Button className="w-full bg-teal-600 hover:bg-teal-700">Get Started</Button></CardContent>
                </Card>
              </Link>
              <Link href="/register?plan=ultimate&interval=yearly" className="block">
                <Card className="h-full border-2 hover:border-teal-500 transition-colors">
                  <CardHeader className="pb-2"><CardTitle className="text-lg">Ultimate Yearly</CardTitle><CardDescription>$49.99/yr</CardDescription></CardHeader>
                  <CardContent><p className="text-sm text-gray-600 mb-4">Save with annual billing</p><Button className="w-full bg-teal-600 hover:bg-teal-700">Get Started</Button></CardContent>
                </Card>
              </Link>
              <Link href="/register?plan=ultimate&interval=lifetime" className="block">
                <Card className="h-full border-2 border-teal-400 hover:border-teal-500 transition-colors">
                  <CardHeader className="pb-2"><CardTitle className="text-lg">Lifetime</CardTitle><CardDescription>$199.99 once</CardDescription></CardHeader>
                  <CardContent><p className="text-sm text-gray-600 mb-4">One-time payment</p><Button className="w-full bg-teal-600 hover:bg-teal-700">Get Started</Button></CardContent>
                </Card>
              </Link>
            </div>
            <p className="text-center mt-6 text-sm text-gray-500">
              <Link href="/pricing" className="text-teal-600 hover:underline">Compare all plans</Link>
            </p>
          </div>
        </section>

        {/* App Screenshots */}
        <section className="w-full py-16 bg-white">
          <div className="container px-4 md:px-6 mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">See Melodica in Action</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Experience how AI-powered music therapy helps you track moods and discover personalized recommendations.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="relative">
                <div className="aspect-[9/16] bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-lg border-4 border-gray-200 overflow-hidden">
                  <div className="h-full p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2"><BarChart3 className="h-6 w-6 text-purple-600" /><span className="text-sm font-bold text-gray-900">Mood Analytics</span></div>
                    </div>
                    <div className="flex-1 bg-white rounded-lg p-4 flex flex-col gap-2">
                      <div className="h-32 flex items-end justify-between gap-1">
                        {[60, 75, 65, 85, 70, 90, 80].map((height, idx) => (
                          <div key={idx} className="bg-gradient-to-t from-purple-500 to-purple-300 rounded-t flex-1" style={{ height: `${height}%` }} />
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-2 flex justify-between">
                        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => <span key={d}>{d}</span>)}
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div><span className="text-xs text-gray-600">Average: 7.2/10</span></div>
                        <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full"></div><span className="text-xs text-gray-600">Trend: +15%</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-[9/16] bg-gradient-to-br from-teal-50 to-green-50 rounded-2xl shadow-lg border-4 border-gray-200 overflow-hidden">
                  <div className="h-full p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2"><ListMusic className="h-6 w-6 text-teal-600" /><span className="text-sm font-bold text-gray-900">Your Playlist</span></div>
                    </div>
                    <div className="flex-1 bg-white rounded-lg p-4 space-y-3">
                      {[
                        { title: "Morning Vibes", artist: "Curated for You", mood: "😊 Happy" },
                        { title: "Relax & Focus", artist: "Melodica AI", mood: "😌 Calm" },
                        { title: "Energy Boost", artist: "Your Style", mood: "⚡ Energetic" },
                      ].map((track, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
                          <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
                            <Music className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{track.title}</p>
                            <p className="text-xs text-gray-500">{track.artist}</p>
                          </div>
                          <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded-full">{track.mood}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-gray-200"><p className="text-xs text-center text-gray-500">+ More tracks</p></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-[9/16] bg-gradient-to-br from-pink-50 to-orange-50 rounded-2xl shadow-lg border-4 border-gray-200 overflow-hidden">
                  <div className="h-full p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2"><Heart className="h-6 w-6 text-pink-600" /><span className="text-sm font-bold text-gray-900">How Are You?</span></div>
                    </div>
                    <div className="flex-1 bg-white rounded-lg p-6 flex flex-col items-center justify-center">
                      <div className="text-5xl mb-4">😊</div>
                      <p className="text-sm font-semibold text-gray-900 mb-2">Feeling Great!</p>
                      <div className="flex items-center gap-2 mb-6">
                        {[...Array(5)].map((_, idx) => (
                          <div key={idx} className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl cursor-pointer hover:scale-110 transition">{idx + 1}</div>
                        ))}
                      </div>
                      <div className="w-full space-y-2 text-xs text-gray-600 text-center">
                        <div className="flex justify-between"><span>😢</span><span className="flex-1 border-b border-dashed mx-2"></span><span>😊</span></div>
                        <p className="text-xs text-center text-gray-500 pt-2">Track your mood daily</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Melodica */}
        <section className="w-full py-16 bg-gray-50">
          <div className="container px-4 md:px-6 mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Melodica?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">The first mental wellness app that combines <strong>music therapy</strong>, <strong>AI-powered mood tracking</strong>, and <strong>personalized recommendations</strong> in one beautiful platform.</p>
            </div>
            <div className="grid gap-8 lg:grid-cols-3">
              <Card className="border-gray-200 shadow-md bg-white">
                <CardHeader>
                  <div className="h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4"><Music className="h-6 w-6 text-teal-600" /></div>
                  <CardTitle className="text-gray-900">AI Music Therapy</CardTitle>
                </CardHeader>
                <CardContent><CardDescription className="text-base text-gray-600">Get personalized music recommendations based on your mood patterns, preferences, and wellness goals. Our AI understands what you need.</CardDescription></CardContent>
              </Card>
              <Card className="border-gray-200 shadow-md bg-white">
                <CardHeader>
                  <div className="h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4"><TrendingUp className="h-6 w-6 text-teal-600" /></div>
                  <CardTitle className="text-gray-900">Mood Tracking & Analytics</CardTitle>
                </CardHeader>
                <CardContent><CardDescription className="text-base text-gray-600">Track your daily moods, discover patterns, and understand how weather, activities, and music affect your mental wellbeing.</CardDescription></CardContent>
              </Card>
              <Card className="border-gray-200 shadow-md bg-white">
                <CardHeader>
                  <div className="h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4"><Sparkles className="h-6 w-6 text-teal-600" /></div>
                  <CardTitle className="text-gray-900">Complete Wellness Solution</CardTitle>
                </CardHeader>
                <CardContent><CardDescription className="text-base text-gray-600">Journal entries, period tracking, therapist finder, guided sessions, and more — all designed to support your mental health journey.</CardDescription></CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Preview */}
        <section className="w-full py-16 bg-white">
          <div className="container px-4 md:px-6 mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
              <p className="text-lg text-gray-600 mb-2">Start with a <strong className="text-teal-600">2-week free trial</strong> on all plans</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-2 border-teal-600 bg-teal-50 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-teal-600 text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
                </div>
                <CardHeader>
                  <CardTitle className="text-gray-900">Premium</CardTitle>
                  <div className="text-3xl font-bold text-gray-900 mt-2">$2.99<span className="text-lg font-normal text-gray-600">/month</span></div>
                  <p className="text-sm text-teal-700 font-medium mt-1">2-week free trial</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" /><span className="text-sm text-gray-900 font-medium">Advanced mood tracking</span></li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" /><span className="text-sm text-gray-600">Personalized playlists</span></li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" /><span className="text-sm text-gray-600">Advanced analytics</span></li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" /><span className="text-sm text-gray-600">Ad-free experience</span></li>
                  </ul>
                  {isMounted && <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white" onClick={handlePricingPremiumClick}>Start Free Trial</Button>}
                </CardContent>
              </Card>
              <Card className="border-2 border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-gray-900">Ultimate</CardTitle>
                  <div className="text-3xl font-bold text-gray-900 mt-2">$4.99<span className="text-lg font-normal text-gray-600">/month</span></div>
                  <p className="text-sm text-teal-700 font-medium mt-1">2-week free trial</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" /><span className="text-sm text-gray-900 font-medium">Everything in Premium</span></li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" /><span className="text-sm text-gray-600">Full Spotify integration</span></li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" /><span className="text-sm text-gray-600">Period tracking</span></li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" /><span className="text-sm text-gray-600">Priority support</span></li>
                  </ul>
                  {isMounted && <Button variant="outline" className="w-full" onClick={handlePricingUltimateClick}>Start Free Trial</Button>}
                </CardContent>
              </Card>
            </div>
            <div className="text-center mt-8">
              <Link href="/pricing" className="text-teal-600 hover:text-teal-700 font-medium">View all plans including yearly & lifetime options →</Link>
            </div>
          </div>
        </section>

        {/* Email Signup */}
        <section className="w-full py-16 bg-gradient-to-br from-teal-50 to-blue-50">
          <div className="container px-4 md:px-6 mx-auto max-w-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Join the Beta Waitlist</h2>
              <p className="text-lg text-gray-600">Be the first to know about new Melodica features and updates. Get exclusive early access and special pricing.</p>
            </div>
            <Card className="border-gray-200 shadow-lg bg-white">
              <CardContent className="pt-6">
                <form onSubmit={handleEmailSignup} className="flex flex-col sm:flex-row gap-3">
                  <Input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1" required />
                  <Button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700 text-white">{loading ? "Joining..." : "Get Notified"}</Button>
                </form>
                <p className="text-xs text-gray-500 mt-3 text-center">We'll never spam you. Unsubscribe anytime.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full py-16 bg-white">
          <div className="container px-4 md:px-6 mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Your Mental Wellness Journey?</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">Join thousands of users who are taking control of their mental health with AI-powered music therapy.</p>
            {isMounted && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 text-lg" onClick={handleFinalCTASignupClick}>
                  Start Your Free Trial<ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2" onClick={handleFinalCTAPricingClick}>Compare Plans</Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-4 sm:flex-row py-8 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-600">© 2025 Melodica. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4 text-gray-600 hover:text-teal-600" href="/terms">Terms of Service</Link>
          <Link className="text-xs hover:underline underline-offset-4 text-gray-600 hover:text-teal-600" href="/privacy">Privacy Policy</Link>
        </nav>
      </footer>
    </div>
  )
}
