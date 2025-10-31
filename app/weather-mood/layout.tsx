import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Weather & Mood | Melodica - Mental Wellness Companion",
  description: "Understand how weather affects your mood and get personalized recommendations based on current conditions.",
  robots: "noindex, nofollow",
}

export default function WeatherMoodLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

