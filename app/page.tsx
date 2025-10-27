"use client"

// Force dynamic rendering to avoid SSR issues with event handlers
export const dynamic = 'force-dynamic'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Brain, Calendar, Users, Shield, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Header */}
      <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-gray-900/80 backdrop-blur-sm border-gray-700">
        <Link className="flex items-center justify-center" href="/">
          <Heart className="h-6 w-6 text-rose-500 mr-2" />
          <span className="font-bold text-xl text-white">Melodica</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:underline underline-offset-4 text-white" href="/pricing">
            Pricing
          </Link>
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4 text-white">
            Login
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
              Sign Up
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Your Mental Wellness Companion
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Track your mood, discover personalized recommendations, and take care of your mental wellbeing with
                  AI-powered insights.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/register">
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-lg">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" className="px-8 py-3 text-lg">
                    View Plans
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-900">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <Card className="border-gray-700 shadow-lg bg-gray-800">
                <CardHeader>
                  <Brain className="h-10 w-10 text-teal-600 mb-2" />
                  <CardTitle className="text-white">AI-Powered Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-gray-300">
                    Get personalized recommendations based on your mood patterns, weather, and daily activities.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-gray-700 shadow-lg bg-gray-800">
                <CardHeader>
                  <Calendar className="h-10 w-10 text-teal-600 mb-2" />
                  <CardTitle className="text-white">Smart Calendar Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-gray-300">
                    Sync your calendar and get AI-generated readiness kits for upcoming events, tests, and meetings.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-gray-700 shadow-lg bg-gray-800">
                <CardHeader>
                  <Users className="h-10 w-10 text-teal-600 mb-2" />
                  <CardTitle className="text-white">Find Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-gray-300">
                    Connect with therapists in your area and access crisis support when you need it most.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-gray-700 shadow-lg bg-gray-800">
                <CardHeader>
                  <Heart className="h-10 w-10 text-teal-600 mb-2" />
                  <CardTitle className="text-white">Comprehensive Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-gray-300">
                    Track mood, period cycles, weather impacts, and build your virtual emotional garden.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-gray-700 shadow-lg bg-gray-800">
                <CardHeader>
                  <Shield className="h-10 w-10 text-teal-600 mb-2" />
                  <CardTitle className="text-white">Privacy First</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-gray-300">
                    Your data is encrypted and secure. You control what you share and with whom.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-gray-700 shadow-lg bg-gray-800">
                <CardHeader>
                  <Sparkles className="h-10 w-10 text-teal-600 mb-2" />
                  <CardTitle className="text-white">Personalized Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-gray-300">
                    Customize themes, colors, and features to make Melodica truly yours.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-gray-900 dark:text-white">Start Your Wellness Journey Today</h2>
                <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  Join thousands of users who are taking control of their mental health with Melodica.
                </p>
              </div>
              <Link href="/register">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-lg">Get Started Free</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-700 bg-gray-900">
        <p className="text-xs text-gray-400">© 2024 Melodica. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4 text-gray-400 hover:text-white" href="/terms">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4 text-gray-400 hover:text-white" href="/terms">
            Privacy Policy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
