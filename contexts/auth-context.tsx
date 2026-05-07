"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User as FirebaseAuthUser,
} from "firebase/auth"
import { auth } from "@/lib/firebase-config"
import type { FirebaseUser } from "@/lib/firebase-users"
import {
  postEmailPasswordLogin,
  postProfileByIdToken,
  type AuthApiPublicUser,
} from "@/lib/auth-api-client"

const GOOGLE_NOT_CONFIGURED_MSG =
  "Google sign-in is not enabled for this Firebase project. In Firebase Console: Authentication → Sign-in method → turn on Google, support email, and save. Under Authentication → Settings → Authorized domains, add localhost (for dev) and your production domain."

export type LoginResult = { success: true } | { success: false; error: string }

/** Session user: dashboard and profile read from `userData` / context */
export interface User {
  name: string
  email: string
  gender?: string
  favoriteArtists?: string
  favoriteActivities?: string
  musicGenres?: string
  id?: string
  emailVerified?: boolean
  subscription?: FirebaseUser["subscription"]
  password?: string
  mentalIllnesses?: string
  medication?: string
  selectedPlan?: string
}

type LoginWithCredentials = (
  email: string,
  password: string,
  options?: { rememberMe?: boolean }
) => Promise<LoginResult>

type LoginWithUser = (userData: User) => void

interface AuthContextType {
  user: User | null
  login: LoginWithCredentials & LoginWithUser
  loginWithGoogle: () => Promise<LoginResult>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function apiPublicUserToUser(u: AuthApiPublicUser): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    gender: u.gender,
    favoriteArtists: u.favoriteArtists,
    favoriteActivities: u.favoriteActivities,
    musicGenres: u.musicGenres,
    mentalIllnesses: u.mentalIllnesses,
    medication: u.medication,
    selectedPlan: u.selectedPlan,
    emailVerified: u.emailVerified,
    subscription: u.subscription ?? undefined,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  const persistSession = useCallback((sessionUser: User) => {
    if (typeof window === "undefined") return
    localStorage.setItem("currentUser", JSON.stringify(sessionUser))
    localStorage.setItem("userData", JSON.stringify(sessionUser))
    localStorage.setItem("isLoggedIn", "true")
    localStorage.removeItem("explicitlyLoggedOut")
  }, [])

  const applySession = useCallback(
    (sessionUser: User) => {
      setUser(sessionUser)
      setIsAuthenticated(true)
      persistSession(sessionUser)
    },
    [persistSession]
  )

  const tryAutoLoginFromSavedCredentials = useCallback(async () => {
    const savedCredentials = localStorage.getItem("savedCredentials")
    if (!savedCredentials) return

    try {
      const credentials = JSON.parse(savedCredentials) as { email?: string; password?: string }
      if (!credentials.email || !credentials.password) return

      const res = await postEmailPasswordLogin(
        credentials.email.toLowerCase().trim(),
        credentials.password
      )
      if (res.success) {
        applySession(apiPublicUserToUser(res.user))
      }
    } catch (e) {
      console.error("Auto-login from saved credentials failed:", e)
    }
  }, [applySession])

  const restoreLocalSession = useCallback(async () => {
    const explicitlyLoggedOut = localStorage.getItem("explicitlyLoggedOut")
    if (explicitlyLoggedOut === "true") {
      localStorage.removeItem("explicitlyLoggedOut")
      setUser(null)
      setIsAuthenticated(false)
      return
    }

    const storedUser = localStorage.getItem("currentUser")
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (storedUser && isLoggedIn === "true") {
      try {
        const userData = JSON.parse(storedUser) as User
        setUser(userData)
        setIsAuthenticated(true)
        localStorage.setItem("userData", JSON.stringify(userData))
        return
      } catch (error) {
        console.error("Error parsing stored user data:", error)
        localStorage.removeItem("currentUser")
        localStorage.removeItem("isLoggedIn")
      }
    }

    await tryAutoLoginFromSavedCredentials()
  }, [tryAutoLoginFromSavedCredentials])

  useEffect(() => {
    if (typeof window === "undefined") return

    if (!auth) {
      void restoreLocalSession().finally(() => {
        setIsLoading(false)
        setIsInitialized(true)
      })
      return
    }

    const firebaseAuth = auth

    // Safety net: if Firebase doesn't respond within 8 seconds, show the app
    // anyway using any locally saved session. Prevents infinite loading screen.
    const safetyTimer = setTimeout(() => {
      setIsLoading(false)
      setIsInitialized(true)
    }, 8000)

    const unsub = onAuthStateChanged(firebaseAuth, async (firebaseUser: FirebaseAuthUser | null) => {
      try {
        if (firebaseUser) {
          const idToken = await firebaseUser.getIdToken()
          // Timeout the profile fetch after 6 seconds so the app never hangs
          const res = await Promise.race([
            postProfileByIdToken(idToken),
            new Promise<{ success: false; error: string }>((resolve) =>
              setTimeout(() => resolve({ success: false, error: "timeout" }), 6000)
            ),
          ])
          if (res.success) {
            applySession(apiPublicUserToUser(res.user))
          } else {
            await firebaseSignOut(firebaseAuth).catch(() => {})
            await restoreLocalSession()
          }
        } else {
          await restoreLocalSession()
        }
      } catch (e) {
        console.error("Auth state error:", e)
        await restoreLocalSession()
      } finally {
        clearTimeout(safetyTimer)
        setIsLoading(false)
        setIsInitialized(true)
      }
    })

    return () => {
      unsub()
      clearTimeout(safetyTimer)
    }
  }, [applySession, restoreLocalSession])

  const loginWithPassword = useCallback<LoginWithCredentials>(
    async (email, password, options) => {
      const normalizedEmail = email.trim().toLowerCase()
      const normalizedPassword = password.trim()

      try {
        const res = await postEmailPasswordLogin(normalizedEmail, normalizedPassword)
        if (!res.success) {
          return { success: false, error: res.error }
        }

        if (options?.rememberMe) {
          localStorage.setItem(
            "savedCredentials",
            JSON.stringify({ email: normalizedEmail, password: normalizedPassword })
          )
        } else {
          localStorage.removeItem("savedCredentials")
        }

        applySession(apiPublicUserToUser(res.user))
        return { success: true }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Login failed"
        console.error("Login error:", e)
        return { success: false, error: message }
      }
    },
    [applySession]
  )

  const loginWithUserObject = useCallback<LoginWithUser>(
    (userData) => {
      applySession(userData)
    },
    [applySession]
  )

  const login = useMemo((): LoginWithCredentials & LoginWithUser => {
    const fn = (
      emailOrUser: string | User,
      passwordArg?: string,
      options?: { rememberMe?: boolean }
    ): Promise<LoginResult> | void => {
      if (typeof emailOrUser === "string") {
        return loginWithPassword(emailOrUser, passwordArg ?? "", options)
      }
      loginWithUserObject(emailOrUser)
    }
    return fn as LoginWithCredentials & LoginWithUser
  }, [loginWithPassword, loginWithUserObject])

  const loginWithGoogle = useCallback(async (): Promise<LoginResult> => {
    if (!auth) {
      return { success: false, error: "Firebase Auth is not configured. Check your environment variables." }
    }

    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      const idToken = await result.user.getIdToken()
      const res = await postProfileByIdToken(idToken)
      if (!res.success) {
        await firebaseSignOut(auth)
        return {
          success: false,
          error: res.error,
        }
      }

      applySession(apiPublicUserToUser(res.user))
      return { success: true }
    } catch (e: unknown) {
      const code =
        typeof e === "object" && e !== null && "code" in e
          ? String((e as { code: string }).code)
          : ""
      const msg = e instanceof Error ? e.message : ""

      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        return { success: false, error: "Sign-in was cancelled." }
      }

      if (
        code === "auth/configuration-not-found" ||
        code === "auth/operation-not-allowed" ||
        msg.includes("CONFIGURATION_NOT_FOUND")
      ) {
        return { success: false, error: GOOGLE_NOT_CONFIGURED_MSG }
      }

      const message = e instanceof Error ? e.message : "Google sign-in failed"
      console.error("Google login error:", e)
      return { success: false, error: message }
    }
  }, [applySession])

  const logout = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)

    if (typeof window !== "undefined") {
      localStorage.removeItem("currentUser")
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("userData")
      localStorage.removeItem("savedCredentials")
      localStorage.setItem("explicitlyLoggedOut", "true")
    }

    if (auth) {
      void firebaseSignOut(auth).catch((err) => console.error("Firebase signOut:", err))
    }
  }, [])

  const contextValue = useMemo(
    () => ({ user, login, loginWithGoogle, logout, isAuthenticated, isLoading }),
    [user, login, loginWithGoogle, logout, isAuthenticated, isLoading]
  )

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
