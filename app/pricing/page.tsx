"use client"

import Link from "next/link"
import { Heart, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import PricingHeader from "@/components/pricing/pricing-header"
import PricingTabs from "@/components/pricing/pricing-tabs"
import { useIsNative } from "@/hooks/use-is-native"

export default function PricingPage() {
  const { isNative } = useIsNative()

  // On native iOS: show NO pricing details — just a button to open the website.
  // Showing prices or plan details inside a native app violates guideline 3.1.1.
  if (isNative) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 p-8">
        <Heart className="h-14 w-14 text-rose-500 mb-6" />
        <h1 className="text-2xl font-bold text-white mb-3 text-center">Subscribe to Melodica</h1>
        <p className="text-gray-300 text-center mb-8 max-w-xs">
          To view plans and subscribe, visit our website on your browser.
        </p>
        <Button
          className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 text-lg flex items-center gap-2"
          onClick={() => window.open("https://melodicaapp.com", "_system")}
        >
          <ExternalLink className="h-5 w-5" />
          Visit melodicaapp.com
        </Button>
        <p className="text-gray-500 text-sm mt-6 text-center">
          Already subscribed?{" "}
          <Link href="/login" className="text-teal-400 underline">
            Log in here
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-green-50">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Heart className="h-6 w-6 text-rose-500" />
          <span className="text-black">Melodica</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4 text-black">
            Login
          </Link>
          <Link href="/register" className="text-sm font-medium hover:underline underline-offset-4 text-black">
            Register
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <div className="container px-4 md:px-6 py-8 md:py-12 lg:py-16 max-w-5xl mx-auto">
          <PricingHeader />
          <PricingTabs />
        </div>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full border-t items-center px-4 md:px-6">
        <p className="text-xs text-black">© 2025 Melodica. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="/terms" className="text-xs hover:underline underline-offset-4 text-black">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-xs hover:underline underline-offset-4 text-black">
            Privacy Policy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
