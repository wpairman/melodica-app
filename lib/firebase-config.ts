/**
 * Firebase Configuration
 * 
 * To set up Firebase:
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a new project (or use existing)
 * 3. Enable Firestore Database
 * 4. Go to Project Settings → General → Your apps → Web app
 * 5. Copy your Firebase config and add it to .env.local
 * 
 * Add these to your .env.local file:
 * NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
 * NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
 * NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
 * NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
 * NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
 * NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
 */

import { initializeApp, getApps, FirebaseApp } from "firebase/app"
import { getFirestore, Firestore } from "firebase/firestore"
import { getAuth, Auth } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase for both client and server environments
let app: FirebaseApp | undefined
let db: Firestore | undefined
let auth: Auth | undefined

// Only log detailed config info in the browser during development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("🔍 Firebase Config Check:", {
    hasApiKey: !!firebaseConfig.apiKey,
    hasProjectId: !!firebaseConfig.projectId,
    projectId: firebaseConfig.projectId || "MISSING",
  })
}

if (firebaseConfig.apiKey) {
  try {
    if (getApps().length === 0) {
      if (process.env.NODE_ENV === "development") {
        console.log("🔥 Initializing Firebase app...")
      }
      app = initializeApp(firebaseConfig)
      if (process.env.NODE_ENV === "development") {
        console.log("✅ Firebase app initialized:", app.name)
      }
    } else {
      app = getApps()[0]
      if (process.env.NODE_ENV === "development") {
        console.log("✅ Using existing Firebase app:", app.name)
      }
    }

    // Firestore works in both server and client environments
    db = getFirestore(app)

    // Auth only on client to avoid Node warnings
    if (typeof window !== "undefined") {
      auth = getAuth(app)
      if (process.env.NODE_ENV === "development") {
        console.log("✅ Firebase Firestore initialized:", db ? "YES" : "NO")
        console.log("✅ Firebase Auth initialized:", auth ? "YES" : "NO")
      }
    }
  } catch (error: any) {
    console.error("❌ Firebase initialization error:", error)
  }
} else {
  console.error("❌ Firebase API key is missing!")
  if (process.env.NODE_ENV === "development") {
    console.error("Make sure .env.local has NEXT_PUBLIC_FIREBASE_API_KEY")
  }
}

export { app, db, auth }
export default app

