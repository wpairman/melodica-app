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

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
}

export const handler: Handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" }
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: CORS,
      body: JSON.stringify({ error: "Method not allowed" }),
    }
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {}
    const { idToken } = body as { idToken?: string }

    if (!idToken) {
      return {
        statusCode: 400,
        headers: CORS,
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
        headers: CORS,
        body: JSON.stringify({ error: "User profile not found" }),
      }
    }

    const data = docSnap.data()!

    return {
      statusCode: 200,
      headers: CORS,
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
      headers: CORS,
      body: JSON.stringify({ error: "Invalid or expired token" }),
    }
  }
}
