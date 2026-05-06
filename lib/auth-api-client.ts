/**
 * Calls Netlify functions directly via /.netlify/functions/*.
 * Email/password login signs in with the client SDK first, then the function
 * verifies the ID token and returns the Firestore profile (Admin SDK).
 */

import { signInWithEmailAndPassword, signOut } from "firebase/auth"
import { auth } from "@/lib/firebase-config"
import type { FirebaseUser } from "@/lib/firebase-users"

/**
 * On native iOS (Capacitor with iosScheme:'https'), the app is served from
 * https://localhost with no port. Relative URLs like /.netlify/functions/…
 * would resolve to https://localhost/… which doesn't exist.
 * Use the absolute production URL instead.
 */
function getApiBase(): string {
  if (typeof window === "undefined") return ""
  const { hostname, port } = window.location
  // Native iOS: hostname is localhost with no port (or port 443)
  if (hostname === "localhost" && (port === "" || port === "443")) {
    return "https://melodicaapp.com"
  }
  return ""
}

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
  const authMessages: Record<string, string> = {
    "auth/invalid-credential": "Incorrect email or password",
    "auth/user-not-found": "No account found with this email",
    "auth/wrong-password": "Incorrect password",
    "auth/too-many-requests": "Too many attempts. Please try again later",
  }

  if (!auth) {
    return { success: false, error: "Authentication is not available in this environment." }
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const idToken = await cred.user.getIdToken()

    const res = await fetch(`${getApiBase()}/.netlify/functions/auth-login`, {
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
      await signOut(auth).catch(() => {})
      return {
        success: false,
        error: data.error || "Invalid email or password",
      }
    }

    return { success: true, user: data.user }
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string }
    if (err.code && authMessages[err.code]) {
      return { success: false, error: authMessages[err.code] }
    }
    const message =
      e instanceof Error ? e.message : "Could not reach login service."
    return { success: false, error: message }
  }
}

export async function postProfileByIdToken(
  idToken: string
): Promise<{ success: true; user: AuthApiPublicUser } | { success: false; error: string }> {
  try {
    const res = await fetch(`${getApiBase()}/.netlify/functions/auth-profile`, {
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
