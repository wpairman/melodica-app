import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Journal | Melodica - Mental Wellness Companion",
  description: "Reflect on your thoughts and feelings with AI-powered journal insights.",
  robots: "noindex, nofollow",
}

export default function JournalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

