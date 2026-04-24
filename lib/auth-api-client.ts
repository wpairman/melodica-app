/**
 * Calls Netlify functions directly via /.netlify/functions/*.
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

export async function postEmailPasswordLogin(
  email: string,
  password: string
): Promise<{ success: true; user: AuthApiPublicUser } | { success: false; error: string }> {
  try {
    const res = await fetch("/.netlify/functions/auth-login", {
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
      e instanceof Error ? e.message : "Could not reach login service."
    return { success: false, error: message }
  }
}

export async function postProfileByIdToken(
  idToken: string
): Promise<{ success: true; user: AuthApiPublicUser } | { success: false; error: string }> {
  try {
    const res = await fetch("/.netlify/functions/auth-profile", {
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
