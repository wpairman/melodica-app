"use client"

// Force dynamic rendering to avoid SSR issues with event handlers
export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Heart, Music, TrendingUp, Sparkles, Download, Apple, Smartphone, CheckCircle2, ArrowRight, Play } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [showSplash, setShowSplash] = useState(true)

  // Brief splash screen (1 second max)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    
    // Track signup event (analytics)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'email_signup', {
        event_category: 'engagement',
        event_label: 'beta_notification'
      })
    }

    // Store email in localStorage for now (replace with API call later)
    try {
      const existing = localStorage.getItem("beta_signups") || "[]"
      const signups = JSON.parse(existing)
      signups.push({ email, date: new Date().toISOString() })
      localStorage.setItem("beta_signups", JSON.stringify(signups))
      
      toast({
        title: "Thanks for signing up!",
        description: "We'll notify you when Melodica launches on the App Store and Google Play.",
      })
      setEmail("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Track page view
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_title: 'Home',
        page_location: window.location.href
      })
    }
  }, [])

  // Track CTA clicks
  const trackCTAClick = (ctaName: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'cta_click', {
        event_category: 'engagement',
        event_label: ctaName
      })
    }
  }

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
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:underline underline-offset-4 text-gray-700 hover:text-teal-600" href="/pricing">
            Pricing
          </Link>
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4 text-gray-700 hover:text-teal-600">
            Login
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => trackCTAClick('header_signup')}>
              Sign Up
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
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
                  <span className="block text-teal-600 mt-2">Music for Your Mood</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-lg md:text-xl text-gray-600 leading-relaxed">
                  AI-driven music therapy app that helps you manage your mood through personalized music recommendations, mood tracking, and mental health insights.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Link href="/register" onClick={() => trackCTAClick('hero_start_free')}>
                  <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 text-lg">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/pricing" onClick={() => trackCTAClick('hero_view_pricing')}>
                  <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2">
                    View Plans
                  </Button>
                </Link>
              </div>

              {/* App Store Download Buttons */}
              <div className="pt-6">
                <p className="text-sm text-gray-500 mb-4">Download Coming Soon</p>
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-2 border-gray-300 hover:border-gray-400 bg-white px-6 py-4"
                    disabled
                  >
                    <Apple className="h-6 w-6 mr-2" />
                    <div className="text-left">
                      <div className="text-xs text-gray-500">Download on the</div>
                      <div className="text-sm font-semibold">App Store</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-2 border-gray-300 hover:border-gray-400 bg-white px-6 py-4"
                    disabled
                  >
                    <Play className="h-6 w-6 mr-2" />
                    <div className="text-left">
                      <div className="text-xs text-gray-500">Get it on</div>
                      <div className="text-sm font-semibold">Google Play</div>
                    </div>
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-2">Available soon on iOS and Android</p>
              </div>
            </div>
          </div>
        </section>

        {/* App Screenshots Section - Placeholder */}
        <section className="w-full py-16 bg-white">
          <div className="container px-4 md:px-6 mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">See Melodica in Action</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Experience how AI-powered music therapy helps you track moods and discover personalized recommendations.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Screenshot Placeholders */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="relative">
                  <div className="aspect-[9/16] bg-gradient-to-br from-teal-100 to-blue-100 rounded-2xl shadow-lg border-4 border-gray-200 flex items-center justify-center">
                    <div className="text-center p-8">
                      <Smartphone className="h-16 w-16 text-teal-600 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 font-medium">App Screenshot {i}</p>
                      <p className="text-xs text-gray-500 mt-2">Coming Soon</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Value Proposition Section */}
        <section className="w-full py-16 bg-gray-50">
          <div className="container px-4 md:px-6 mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Melodica?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                The first mental wellness app that combines <strong>music therapy</strong>, <strong>AI-powered mood tracking</strong>, and <strong>personalized recommendations</strong> in one beautiful platform.
              </p>
            </div>
            <div className="grid gap-8 lg:grid-cols-3">
              <Card className="border-gray-200 shadow-md bg-white">
                <CardHeader>
                  <div className="h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                    <Music className="h-6 w-6 text-teal-600" />
                  </div>
                  <CardTitle className="text-gray-900">AI Music Therapy</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-gray-600">
                    Get personalized music recommendations based on your mood patterns, preferences, and wellness goals. Our AI understands what you need.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-md bg-white">
                <CardHeader>
                  <div className="h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-teal-600" />
                  </div>
                  <CardTitle className="text-gray-900">Mood Tracking & Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-gray-600">
                    Track your daily moods, discover patterns, and understand how weather, activities, and music affect your mental wellbeing.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-md bg-white">
                <CardHeader>
                  <div className="h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 text-teal-600" />
                  </div>
                  <CardTitle className="text-gray-900">Complete Wellness Solution</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-gray-600">
                    Journal entries, period tracking, therapist finder, guided sessions, and more — all designed to support your mental health journey.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Preview Section */}
        <section className="w-full py-16 bg-white">
          <div className="container px-4 md:px-6 mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
              <p className="text-lg text-gray-600 mb-2">Start with a <strong className="text-teal-600">2-week free trial</strong> — no credit card required</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-2 border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-gray-900">Free</CardTitle>
                  <div className="text-3xl font-bold text-gray-900 mt-2">$0<span className="text-lg font-normal text-gray-600">/month</span></div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">Basic mood tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">Limited recommendations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">Ad-supported</span>
                    </li>
                  </ul>
                  <Link href="/register" onClick={() => trackCTAClick('pricing_free')}>
                    <Button variant="outline" className="w-full">Get Started</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-2 border-teal-600 bg-teal-50 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-teal-600 text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
                </div>
                <CardHeader>
                  <CardTitle className="text-gray-900">Premium</CardTitle>
                  <div className="text-3xl font-bold text-gray-900 mt-2">$1.99<span className="text-lg font-normal text-gray-600">/month</span></div>
                  <p className="text-sm text-teal-700 font-medium mt-1">2-week free trial</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-900 font-medium">Everything in Free</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">Personalized playlists</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">Advanced analytics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">Ad-free experience</span>
                    </li>
                  </ul>
                  <Link href="/pricing" onClick={() => trackCTAClick('pricing_premium')}>
                    <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">Start Free Trial</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-gray-900">Ultimate</CardTitle>
                  <div className="text-3xl font-bold text-gray-900 mt-2">$2.99<span className="text-lg font-normal text-gray-600">/month</span></div>
                  <p className="text-sm text-teal-700 font-medium mt-1">2-week free trial</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-900 font-medium">Everything in Premium</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">Full Spotify integration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">Period tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">Priority support</span>
                    </li>
                  </ul>
                  <Link href="/pricing" onClick={() => trackCTAClick('pricing_ultimate')}>
                    <Button variant="outline" className="w-full">Start Free Trial</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
            <div className="text-center mt-8">
              <Link href="/pricing" className="text-teal-600 hover:text-teal-700 font-medium">
                View all plans including yearly & lifetime options →
              </Link>
            </div>
          </div>
        </section>

        {/* Email Signup Section */}
        <section className="w-full py-16 bg-gradient-to-br from-teal-50 to-blue-50">
          <div className="container px-4 md:px-6 mx-auto max-w-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Join the Beta Waitlist</h2>
              <p className="text-lg text-gray-600">
                Be the first to know when Melodica launches on the App Store and Google Play. Get exclusive early access and special launch pricing.
              </p>
            </div>
            <Card className="border-gray-200 shadow-lg bg-white">
              <CardContent className="pt-6">
                <form onSubmit={handleEmailSignup} className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                    required
                  />
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                    onClick={() => trackCTAClick('email_signup')}
                  >
                    {loading ? "Joining..." : "Get Notified"}
                  </Button>
                </form>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  We'll never spam you. Unsubscribe anytime.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="w-full py-16 bg-white">
          <div className="container px-4 md:px-6 mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Your Mental Wellness Journey?</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are taking control of their mental health with AI-powered music therapy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" onClick={() => trackCTAClick('final_cta_signup')}>
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 text-lg">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing" onClick={() => trackCTAClick('final_cta_pricing')}>
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2">
                  Compare Plans
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-4 sm:flex-row py-8 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-600">© 2025 Melodica. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4 text-gray-600 hover:text-teal-600" href="/terms">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4 text-gray-600 hover:text-teal-600" href="/privacy">
            Privacy Policy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
