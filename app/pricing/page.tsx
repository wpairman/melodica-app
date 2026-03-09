import Link from "next/link"
import { Heart } from "lucide-react"
import PricingHeader from "@/components/pricing/pricing-header"
import PricingTabs from "@/components/pricing/pricing-tabs"

export default function PricingPage() {
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
          <Link href="/pricing" className="text-sm font-medium hover:underline underline-offset-4 text-black">
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
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full border-t items-center px-4 md:px-6 border-t">
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
