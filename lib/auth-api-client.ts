/**
 * Calls Netlify functions via /api/auth/* (see netlify.toml redirects).
 * Uses Firebase Admin on the server so Firestore security rules can stay strict.
 */

import type { FirebaseUser } from "@/lib/firebase-users"

export type AuthApiPublicUser = {
  id: string
  name: string
  email: string
  gender: string
  favoriteArtists: string
  favoriteActivities: string
  musicGenres: string
  mentalIllnesses: string
  medication: string
  selectedPlan: string
  emailVerified: boolean
  subscription: FirebaseUser["subscription"] | null
}

function apiOrigin(): string {
  if (typeof window === "undefined") return ""
  const override = process.env.NEXT_PUBLIC_AUTH_API_ORIGIN
  if (override && /^https?:\/\//i.test(override)) {
    return override.replace(/\/$/, "")
  }
  return window.location.origin
}

export async function postEmailPasswordLogin(
  email: string,
  password: string
): Promise<{ success: true; user: AuthApiPublicUser } | { success: false; error: string }> {
  const origin = apiOrigin()
  if (!origin) {
    return { success: false, error: "Login API is only available in the browser." }
  }

  try {
    const res = await fetch(`${origin}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = (await res.json().catch(() => ({}))) as {
      success?: boolean
      user?: AuthApiPublicUser
      error?: string
    }

    if (!res.ok || !data.success || !data.user) {
      return {
        success: false,
        error: data.error || "Invalid email or password",
      }
    }

    return { success: true, user: data.user }
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Could not reach login service. If you use `next dev` locally, run `netlify dev` or test on your deployed site."
    return { success: false, error: message }
  }
}

export async function postProfileByIdToken(
  idToken: string
): Promise<{ success: true; user: AuthApiPublicUser } | { success: false; error: string }> {
  const origin = apiOrigin()
  if (!origin) {
    return { success: false, error: "Profile API is only available in the browser." }
  }

  try {
    const res = await fetch(`${origin}/api/auth/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    })

    const data = (await res.json().catch(() => ({}))) as {
      success?: boolean
      user?: AuthApiPublicUser
      error?: string
    }

    if (!res.ok || !data.success || !data.user) {
      return {
        success: false,
        error: data.error || "Could not load your profile",
      }
    }

    return { success: true, user: data.user }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Network error"
    return { success: false, error: message }
  }
}
