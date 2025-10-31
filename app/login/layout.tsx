import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login | Melodica - Mental Wellness Companion",
  description: "Sign in to your Melodica account to continue your mental wellness journey.",
  robots: "noindex, nofollow",
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

