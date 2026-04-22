/**
 * Shared auth logic for Netlify Functions and Next.js Route Handlers (local `next dev`).
 * Uses Firebase Admin — not subject to Firestore client security rules.
 */

import type { DocumentData } from "firebase-admin/firestore"
import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { verifyPassword, isOldHashFormat } from "@/lib/password-utils"
import type { AuthApiPublicUser } from "@/lib/auth-api-client"

function ensureAdminApp() {
  if (!getApps().length) {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n")
    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        "Missing FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, or FIREBASE_ADMIN_PRIVATE_KEY"
      )
    }
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    })
  }
}

export function buildPublicUserPayload(id: string, data: DocumentData): AuthApiPublicUser {
  return {
    id,
    name: data.name as string,
    email: data.email as string,
    gender: (data.gender as string) || "",
    favoriteArtists: (data.favoriteArtists as string) || "",
    favoriteActivities: (data.favoriteActivities as string) || "",
    musicGenres: (data.musicGenres as string) || "",
    mentalIllnesses: (data.mentalIllnesses as string) || "",
    medication: (data.medication as string) || "",
    selectedPlan: (data.selectedPlan as string) || "",
    emailVerified: Boolean(data.emailVerified),
    subscription: data.subscription ?? null,
  }
}

export type EmailPasswordFailure = { success: false; status: number; error: string }
export type EmailPasswordSuccess = { success: true; user: AuthApiPublicUser }
export type EmailPasswordResult = EmailPasswordSuccess | EmailPasswordFailure

export async function loginWithEmailPassword(
  rawEmail: string,
  rawPassword: string
): Promise<EmailPasswordResult> {
  ensureAdminApp()
  const adminDb = getFirestore()

  const email = rawEmail.trim().toLowerCase()
  const password = rawPassword

  if (!email || !password) {
    return { success: false, status: 400, error: "Email and password are required" }
  }

  const snap = await adminDb.collection("users").where("email", "==", email).limit(1).get()
  console.log("snap==", snap.docs.length)
  if (snap.empty) {
    return { success: false, status: 401, error: "Invalid email or password" }
  }

  const doc = snap.docs[0]
  const data = doc.data()
  const storedPassword = data.password as string | undefined

  if (!storedPassword) {
    return { success: false, status: 401, error: "Invalid email or password" }
  }

  let isValid = false
  if (isOldHashFormat(storedPassword)) {
    isValid = storedPassword === password
  } else {
    isValid = await verifyPassword(password, storedPassword)
  }

  if (!isValid) {
    return { success: false, status: 401, error: "Invalid email or password" }
  }

  return { success: true, user: buildPublicUserPayload(doc.id, data) }
}

export type IdTokenProfileFailure = { success: false; status: number; error: string }
export type IdTokenProfileSuccess = { success: true; user: AuthApiPublicUser }
export type IdTokenProfileResult = IdTokenProfileSuccess | IdTokenProfileFailure

export async function loadProfileByIdToken(idToken: string): Promise<IdTokenProfileResult> {
  ensureAdminApp()
  const adminAuth = getAuth()
  const adminDb = getFirestore()

  if (!idToken) {
    return { success: false, status: 400, error: "idToken is required" }
  }

  let decoded: { email?: string }
  try {
    decoded = await adminAuth.verifyIdToken(idToken)
  } catch {
    return { success: false, status: 401, error: "Invalid or expired token" }
  }

  const email = decoded.email?.toLowerCase().trim()
  if (!email) {
    return { success: false, status: 400, error: "Token has no email" }
  }

  const snap = await adminDb.collection("users").where("email", "==", email).limit(1).get()

  if (snap.empty) {
    return {
      success: false,
      status: 404,
      error: "No Melodica account for this email. Please register with the same email first.",
    }
  }

  const doc = snap.docs[0]
  return { success: true, user: buildPublicUserPayload(doc.id, doc.data()) }
}
