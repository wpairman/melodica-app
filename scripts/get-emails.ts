/**
 * Script to fetch and display all registered emails from Firebase
 * 
 * Usage:
 *   npx tsx scripts/get-emails.ts
 * 
 * Or compile and run:
 *   npx tsc scripts/get-emails.ts --module esnext --target es2020 --moduleResolution node
 *   node scripts/get-emails.js
 */

import { initializeApp } from "firebase/app"
import { getFirestore, collection, getDocs } from "firebase/firestore"

// Load environment variables
require("dotenv").config({ path: ".env.local" })

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

async function getEmails() {
  try {
    console.log("🔥 Connecting to Firebase...")
    
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.error("❌ Firebase configuration missing!")
      console.error("Make sure .env.local exists with NEXT_PUBLIC_FIREBASE_* variables")
      process.exit(1)
    }

    const app = initializeApp(firebaseConfig)
    const db = getFirestore(app)
    
    console.log("📧 Fetching users from Firestore...")
    const usersRef = collection(db, "users")
    const snapshot = await getDocs(usersRef)
    
    const users: Array<{
      email: string
      name?: string
      emailVerified?: boolean
      createdAt?: any
    }> = []
    
    snapshot.forEach((doc) => {
      const data = doc.data()
      users.push({
        email: data.email,
        name: data.name,
        emailVerified: data.emailVerified || false,
        createdAt: data.createdAt,
      })
    })
    
    console.log(`\n✅ Found ${users.length} registered user(s)\n`)
    console.log("=" .repeat(60))
    
    if (users.length === 0) {
      console.log("No users found in Firebase.")
      return
    }
    
    // Display emails
    console.log("\n📧 Registered Emails:\n")
    users.forEach((user, index) => {
      const verified = user.emailVerified ? "✅ Verified" : "⏳ Unverified"
      const name = user.name ? ` (${user.name})` : ""
      console.log(`${index + 1}. ${user.email}${name} - ${verified}`)
    })
    
    // Summary
    const verifiedCount = users.filter(u => u.emailVerified).length
    const unverifiedCount = users.length - verifiedCount
    
    console.log("\n" + "=".repeat(60))
    console.log("\n📊 Summary:")
    console.log(`   Total: ${users.length}`)
    console.log(`   Verified: ${verifiedCount}`)
    console.log(`   Unverified: ${unverifiedCount}`)
    
    // Export options
    console.log("\n💾 To export emails:")
    console.log("   1. Visit: http://localhost:3000/dashboard/admin/users")
    console.log("   2. Or use the CSV export button on that page")
    
    // List emails only
    console.log("\n📋 Email addresses only:")
    users.forEach(user => console.log(user.email))
    
  } catch (error: any) {
    console.error("❌ Error fetching emails:", error.message)
    console.error("\nTroubleshooting:")
    console.error("1. Make sure Firebase is configured in .env.local")
    console.error("2. Make sure you have internet connection")
    console.error("3. Check Firebase Console to verify users exist")
    process.exit(1)
  }
}

getEmails()

