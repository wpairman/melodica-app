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

// Debug: Log config status (only in browser, and only show if keys are missing)
if (typeof window !== 'undefined') {
  const hasApiKey = !!firebaseConfig.apiKey
  const hasProjectId = !!firebaseConfig.projectId
  if (!hasApiKey || !hasProjectId) {
    console.error("❌ Firebase environment variables missing!")
    console.error("Missing variables:", {
      apiKey: !hasApiKey ? "❌ NEXT_PUBLIC_FIREBASE_API_KEY" : "✅",
      projectId: !hasProjectId ? "❌ NEXT_PUBLIC_FIREBASE_PROJECT_ID" : "✅",
      authDomain: !firebaseConfig.authDomain ? "❌ NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" : "✅",
      storageBucket: !firebaseConfig.storageBucket ? "❌ NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" : "✅",
      messagingSenderId: !firebaseConfig.messagingSenderId ? "❌ NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" : "✅",
      appId: !firebaseConfig.appId ? "❌ NEXT_PUBLIC_FIREBASE_APP_ID" : "✅",
    })
    console.error("💡 Make sure .env.local exists in the project root and restart the dev server!")
  }
}

// Initialize Firebase
let app: FirebaseApp | undefined
let db: Firestore | undefined
let auth: Auth | undefined

if (typeof window !== 'undefined') {
  // Debug: Log what we have
  console.log("🔍 Firebase Config Check:", {
    hasApiKey: !!firebaseConfig.apiKey,
    hasProjectId: !!firebaseConfig.projectId,
    apiKeyPreview: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : "MISSING",
    projectId: firebaseConfig.projectId || "MISSING",
  })
  
  if (firebaseConfig.apiKey) {
    // Only initialize if we have config and we're on the client side
    try {
      if (getApps().length === 0) {
        console.log("🔥 Initializing Firebase app...")
        app = initializeApp(firebaseConfig)
        console.log("✅ Firebase app initialized:", app.name)
      } else {
        app = getApps()[0]
        console.log("✅ Using existing Firebase app:", app.name)
      }
      db = getFirestore(app)
      auth = getAuth(app)
      console.log("✅ Firebase Firestore initialized:", db ? "YES" : "NO")
      console.log("✅ Firebase Auth initialized:", auth ? "YES" : "NO")
      
      // Test connection
      if (db) {
        console.log("🧪 Testing Firestore connection...")
        // Just log that db exists - actual test will happen on first write
      }
    } catch (error: any) {
      console.error("❌ Firebase initialization error:", error)
      console.error("Error details:", {
        code: error?.code,
        message: error?.message,
        stack: error?.stack,
      })
    }
  } else {
    console.error("❌ Firebase API key is missing!")
    console.error("Make sure .env.local has NEXT_PUBLIC_FIREBASE_API_KEY")
  }
} else {
  console.log("ℹ️ Server-side render - Firebase will initialize on client")
}

export { app, db, auth }
export default app

