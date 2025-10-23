"use client"

import { useAuth } from "@/contexts/auth-context"
import GroundMe from "./ground-me"

export function ConditionalGroundMe() {
  const { isAuthenticated } = useAuth()

  // Only show ground me button if user is authenticated
  if (!isAuthenticated) {
    return null
  }

  return <GroundMe />
}
