import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign Up | Melodica - Mental Wellness Companion",
  description: "Create your free Melodica account and start tracking your mental wellness journey today.",
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

