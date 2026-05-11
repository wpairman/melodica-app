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
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" }
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) }
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {}
    const { idToken } = body as { idToken?: string }

    if (!idToken) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "ID token required" }) }
    }

    // Verify the token and get the uid
    const decoded = await adminAuth.verifyIdToken(idToken)
    const uid = decoded.uid

    // 1. Delete all Firestore data for the user
    const userDocRef = adminDb.collection("users").doc(uid)

    // Delete known subcollections first
    const subcollections = ["moods", "journal", "playlists", "notifications", "activities"]
    for (const sub of subcollections) {
      const snapshot = await userDocRef.collection(sub).get()
      const batch = adminDb.batch()
      snapshot.docs.forEach((doc) => batch.delete(doc.ref))
      if (!snapshot.empty) await batch.commit()
    }

    // Delete the main user document
    await userDocRef.delete()

    // 2. Delete the Firebase Auth account — permanent, cannot be undone
    await adminAuth.deleteUser(uid)

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ success: true }),
    }
  } catch (error: any) {
    console.error("Delete account error:", error)
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: error.message || "Failed to delete account" }),
    }
  }
}
