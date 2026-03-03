import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing | Melodica - Mental Wellness Companion",
  description: "Choose the perfect plan for your mental wellness journey. Premium and Ultimate plans available.",
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

