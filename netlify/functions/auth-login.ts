import type { Handler } from "@netlify/functions"
import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  })
}

const adminAuth = getAuth()
const adminDb = getFirestore()

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" }),
    }
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {}
    const { idToken } = body as { idToken?: string }

    if (!idToken) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "ID token is required" }),
      }
    }

    // Verify the ID token
    const decoded = await adminAuth.verifyIdToken(idToken)

    // Fetch user profile from Firestore using uid as document ID
    const docRef = adminDb.collection("users").doc(decoded.uid)
    const docSnap = await docRef.get()

    if (!docSnap.exists) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "User profile not found" }),
      }
    }

    const data = docSnap.data()!

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        user: {
          id: decoded.uid,
          name: data.name || "",
          email: data.email || decoded.email || "",
          gender: data.gender || "",
          favoriteArtists: data.favoriteArtists || "",
          favoriteActivities: data.favoriteActivities || "",
          musicGenres: data.musicGenres || "",
          mentalIllnesses: data.mentalIllnesses || "",
          medication: data.medication || "",
          selectedPlan: data.selectedPlan || "",
          emailVerified: data.emailVerified || false,
          subscription: data.subscription || null,
        },
      }),
    }
  } catch (error: any) {
    console.error("Auth login error:", error)
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid or expired token" }),
    }
  }
}
