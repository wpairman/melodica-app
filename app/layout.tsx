import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../styles/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import { ColorCustomizationProvider } from "@/contexts/color-customization-context"
import MoodTrendNotifications from "@/components/mood-trend-notifications"
import { ConditionalGroundMe } from "@/components/conditional-emergency-support"
import AppErrorBoundary from "@/components/app-error-boundary"
import { ToastProvider } from "@/components/toast-provider"
import { OfflineIndicator } from "@/components/offline-indicator"
import { PWALifecycle } from "@/app/pwa"

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Melodica - Mental Wellness Companion",
  description: "Track your mood, discover personalized recommendations, and take care of your mental wellbeing.",
  manifest: "/manifest.json",
  generator: 'v0.dev',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <AppErrorBoundary>
          <AuthProvider>
            <ColorCustomizationProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                <ToastProvider>
                  {children}
                  <PWALifecycle />
                  <ConditionalGroundMe />
                  <MoodTrendNotifications />
                  <OfflineIndicator />
                  <Toaster />
                </ToastProvider>
              </ThemeProvider>
            </ColorCustomizationProvider>
          </AuthProvider>
        </AppErrorBoundary>
      </body>
    </html>
  )
}
