/**
 * Migration Script: Migrate users from localStorage to Firebase
 * 
 * This script migrates all users stored in localStorage to Firebase Firestore.
 * Run this once to sync all existing users to Firebase.
 * 
 * Usage:
 * 1. Import this function in a page or run in browser console
 * 2. Call migrateUsersToFirebase()
 */

import { saveUserToFirebase, getAllUsersFromFirebase } from "./firebase-users"

export interface LocalStorageUser {
  email: string
  name: string
  password?: string
  emailVerified?: boolean
  verificationToken?: string
  verificationTokenExpiry?: string
  gender?: string
  favoriteArtists?: string
  favoriteActivities?: string
  selectedPlan?: string
  subscription?: {
    plan: string
    status: string
    currentPeriodEnd?: string | null
    isLifetime?: boolean
  }
  createdAt?: string
  [key: string]: any
}

/**
 * Migrate all users from localStorage to Firebase
 * Returns the number of users successfully migrated
 */
export async function migrateUsersToFirebase(): Promise<{
  success: number
  failed: number
  errors: Array<{ email: string; error: string }>
}> {
  if (typeof window === 'undefined') {
    console.error("❌ This function must be run in the browser")
    return { success: 0, failed: 0, errors: [] }
  }

  console.log("🔄 Starting migration of users from localStorage to Firebase...")

  // Get all users from localStorage
  const allUsersStr = localStorage.getItem("allUsers")
  if (!allUsersStr) {
    console.log("ℹ️ No users found in localStorage")
    return { success: 0, failed: 0, errors: [] }
  }

  let allUsers: LocalStorageUser[] = []
  try {
    allUsers = JSON.parse(allUsersStr)
  } catch (error) {
    console.error("❌ Error parsing allUsers from localStorage:", error)
    return { success: 0, failed: 0, errors: [{ email: "unknown", error: "Failed to parse localStorage data" }] }
  }

  if (!Array.isArray(allUsers) || allUsers.length === 0) {
    console.log("ℹ️ No users found in localStorage array")
    return { success: 0, failed: 0, errors: [] }
  }

  console.log(`📦 Found ${allUsers.length} users in localStorage`)

  const results = {
    success: 0,
    failed: 0,
    errors: [] as Array<{ email: string; error: string }>
  }

  // Migrate each user
  for (const user of allUsers) {
    if (!user.email) {
      console.warn("⚠️ Skipping user without email:", user)
      results.failed++
      results.errors.push({ email: "unknown", error: "Missing email" })
      continue
    }

    try {
      console.log(`🔄 Migrating user: ${user.email}`)

      const firebaseUser = {
        name: user.name || "Unknown",
        email: user.email,
        password: user.password, // Already hashed
        emailVerified: user.emailVerified || false,
        verificationToken: user.verificationToken,
        gender: user.gender,
        favoriteArtists: user.favoriteArtists,
        favoriteActivities: user.favoriteActivities,
        selectedPlan: user.selectedPlan || "free",
        subscription: user.subscription || {
          plan: user.selectedPlan === "free" ? "Free" : (user.selectedPlan?.charAt(0).toUpperCase() + user.selectedPlan?.slice(1) || "Free"),
          status: "active",
          currentPeriodEnd: null,
          isLifetime: false,
        },
      }

      const firebaseUserId = await saveUserToFirebase(firebaseUser)

      if (firebaseUserId) {
        console.log(`✅ Successfully migrated: ${user.email} (ID: ${firebaseUserId})`)
        results.success++
      } else {
        console.error(`❌ Failed to migrate: ${user.email} (saveUserToFirebase returned null)`)
        results.failed++
        results.errors.push({ email: user.email, error: "saveUserToFirebase returned null" })
      }
    } catch (error: any) {
      console.error(`❌ Error migrating user ${user.email}:`, error)
      results.failed++
      results.errors.push({
        email: user.email,
        error: error?.message || "Unknown error"
      })
    }

    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log("\n📊 Migration Summary:")
  console.log(`✅ Successfully migrated: ${results.success} users`)
  console.log(`❌ Failed: ${results.failed} users`)
  if (results.errors.length > 0) {
    console.log("\n❌ Errors:")
    results.errors.forEach(err => {
      console.log(`  - ${err.email}: ${err.error}`)
    })
  }

  return results
}

/**
 * Check how many users are in localStorage vs Firebase
 */
export async function compareUserCounts(): Promise<{
  localStorage: number
  firebase: number
  difference: number
}> {
  if (typeof window === 'undefined') {
    return { localStorage: 0, firebase: 0, difference: 0 }
  }

  // Count localStorage users
  const allUsersStr = localStorage.getItem("allUsers")
  let localStorageCount = 0
  if (allUsersStr) {
    try {
      const allUsers = JSON.parse(allUsersStr)
      localStorageCount = Array.isArray(allUsers) ? allUsers.length : 0
    } catch (error) {
      console.error("Error parsing localStorage:", error)
    }
  }

  // Count Firebase users
  let firebaseCount = 0
  try {
    const firebaseUsers = await getAllUsersFromFirebase()
    firebaseCount = firebaseUsers.length
  } catch (error) {
    console.error("Error getting Firebase users:", error)
  }

  const difference = localStorageCount - firebaseCount

  console.log("\n📊 User Count Comparison:")
  console.log(`localStorage: ${localStorageCount} users`)
  console.log(`Firebase: ${firebaseCount} users`)
  console.log(`Difference: ${difference} users`)

  return {
    localStorage: localStorageCount,
    firebase: firebaseCount,
    difference
  }
}

