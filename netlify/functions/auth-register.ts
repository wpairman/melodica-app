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
    const {
      name, email, password, gender,
      favoriteArtists, favoriteActivities,
      musicGenres, mentalIllnesses, medication, selectedPlan
    } = body

    if (!email || !password || !name) {
      return {
        statusCode: 400,
        headers: CORS,
        body: JSON.stringify({ error: "Name, email, and password are required" }),
      }
    }

    if (password.length < 6) {
      return {
        statusCode: 400,
        headers: CORS,
        body: JSON.stringify({ error: "Password must be at least 6 characters" }),
      }
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email: normalizedEmail,
      password,
      displayName: name,
    })

    // Save profile to Firestore using Admin SDK (bypasses security rules)
    await adminDb.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      name,
      email: normalizedEmail,
      gender: gender || "",
      favoriteArtists: favoriteArtists || "",
      favoriteActivities: favoriteActivities || "",
      musicGenres: musicGenres || "",
      mentalIllnesses: mentalIllnesses || "No",
      medication: medication || "No",
      selectedPlan: selectedPlan || "",
      emailVerified: false,
      subscription: { plan: "none", status: "inactive" },
      createdAt: new Date().toISOString(),
    })

    // Create a custom token so the client can sign in immediately
    const customToken = await adminAuth.createCustomToken(userRecord.uid)

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        success: true,
        customToken,
        user: {
          uid: userRecord.uid,
          name,
          email: normalizedEmail,
        },
      }),
    }
  } catch (error: any) {
    console.error("Registration error:", error)

    if (error.code === "auth/email-already-exists") {
      return {
        statusCode: 409,
        headers: CORS,
        body: JSON.stringify({ error: "An account with this email already exists" }),
      }
    }

    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: error.message || "Registration failed" }),
    }
  }
}
