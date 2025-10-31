import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | Melodica - Mental Wellness Companion",
  description: "Track your mood, view analytics, and access personalized mental wellness recommendations.",
  robots: "noindex, nofollow", // Dashboard pages should not be indexed
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

