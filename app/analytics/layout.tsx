import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mood Analytics | Melodica - Mental Wellness Companion",
  description: "View detailed mood trends, patterns, and insights from your mental wellness journey.",
  robots: "noindex, nofollow",
}

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

