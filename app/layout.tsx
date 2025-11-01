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
import { LocationPermissionDialog } from "@/components/location-permission-dialog"
import { NotificationPermissionDialog } from "@/components/notification-permission-dialog"

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Melodica – AI Music Therapy App for Mood Tracking & Recommendations",
  description: "AI-driven music therapy app that helps you manage your mood through personalized music recommendations, mood tracking, and mental health insights. Start your 2-week free trial today.",
  keywords: ["music therapy", "mood tracking", "AI recommendations", "mental health app", "wellness app", "music for mood", "mental wellness", "mood analyzer", "AI music", "therapy app"],
  authors: [{ name: "Melodica" }],
  creator: "Melodica",
  publisher: "Melodica",
  manifest: "/manifest.json",
  generator: 'Next.js',
  applicationName: "Melodica",
  referrer: "origin-when-cross-origin",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://melodica.app",
    siteName: "Melodica",
    title: "Melodica – Music for Your Mood | AI Music Therapy App",
    description: "AI-driven music therapy app that helps you manage your mood through personalized music recommendations, mood tracking, and mental health insights.",
    images: [
      {
        url: "/og-image.png", // You'll need to create this
        width: 1200,
        height: 630,
        alt: "Melodica - Music for Your Mood",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Melodica – Music for Your Mood | AI Music Therapy App",
    description: "AI-driven music therapy app for mood tracking & personalized recommendations. Start your 2-week free trial today.",
    images: ["/og-image.png"],
    creator: "@melodica",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here when you set up search console
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
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
                  <LocationPermissionDialog />
                  <NotificationPermissionDialog />
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
