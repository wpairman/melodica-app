/**
 * Firebase Users Service
 * Handles saving and retrieving users from Firestore
 */

import { db } from "./firebase-config"
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  doc,
  serverTimestamp,
  Timestamp
} from "firebase/firestore"

export interface FirebaseUser {
  id?: string
  name: string
  email: string
  password?: string // Hashed password
  emailVerified?: boolean
  verificationToken?: string
  gender?: string
  age?: number
  favoriteArtists?: string
  favoriteActivities?: string
  musicGenres?: string
  mentalIllnesses?: string
  medication?: string
  subscription?: {
    plan: string
    status: string
    currentPeriodEnd?: string | null
    isLifetime?: boolean
  }
  selectedPlan?: string
  createdAt?: Date | Timestamp
  updatedAt?: Date | Timestamp
}

const USERS_COLLECTION = "users"

/**
 * Save a new user to Firebase
 */
export async function saveUserToFirebase(userData: FirebaseUser): Promise<string | null> {
  if (process.env.NODE_ENV === 'development') {
    console.log("🔥 saveUserToFirebase called with:", { email: userData.email, name: userData.name })
  }
  
  if (!db) {
    console.error("❌ Firebase db is not initialized!")
    if (process.env.NODE_ENV === 'development') {
      console.error("Check your .env.local file and Firebase config.")
    }
    return null
  }

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log("✅ Firebase db is initialized, checking for existing user...")
    }
    // Check if user already exists
    const q = query(collection(db, USERS_COLLECTION), where("email", "==", userData.email))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      // User exists, update instead
      if (process.env.NODE_ENV === 'development') {
        console.log("⚠️ User already exists, updating...")
      }
      const existingUser = querySnapshot.docs[0]
      await updateDoc(doc(db, USERS_COLLECTION, existingUser.id), {
        ...userData,
        updatedAt: serverTimestamp(),
      })
      if (process.env.NODE_ENV === 'development') {
        console.log("✅ User updated in Firebase:", existingUser.id)
      }
      return existingUser.id
    } else {
      // New user, add to collection
      if (process.env.NODE_ENV === 'development') {
        console.log("➕ Adding new user to Firebase...")
      }
      const docRef = await addDoc(collection(db, USERS_COLLECTION), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      if (process.env.NODE_ENV === 'development') {
        console.log("✅ User saved to Firebase successfully! ID:", docRef.id)
      }
      return docRef.id
    }
  } catch (error: any) {
    console.error("❌ Error saving user to Firebase:", error)
    if (process.env.NODE_ENV === 'development') {
      console.error("Error details:", {
        code: error?.code,
        message: error?.message,
      })
    }
    return null
  }
}

/**
 * Get all users from Firebase
 */
export async function getAllUsersFromFirebase(): Promise<FirebaseUser[]> {
  if (!db) {
    console.warn("Firebase not initialized. Returning empty array.")
    return []
  }

  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION))
    const users: FirebaseUser[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      users.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      } as FirebaseUser)
    })
    
    return users
  } catch (error) {
    console.error("Error getting users from Firebase:", error)
    return []
  }
}

/**
 * Get a user by email from Firebase
 */
export async function getUserByEmailFromFirebase(email: string): Promise<FirebaseUser | null> {
  if (!db) {
    console.warn("Firebase not initialized.")
    return null
  }

  try {
    const q = query(collection(db, USERS_COLLECTION), where("email", "==", email))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      } as FirebaseUser
    }
    
    return null
  } catch (error) {
    console.error("Error getting user from Firebase:", error)
    return null
  }
}

/**
 * Update user subscription in Firebase
 */
export async function updateUserSubscriptionInFirebase(
  email: string, 
  subscription: FirebaseUser["subscription"]
): Promise<boolean> {
  if (!db) {
    console.warn("Firebase not initialized.")
    return false
  }

  try {
    const q = query(collection(db, USERS_COLLECTION), where("email", "==", email))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0]
      await updateDoc(doc(db, USERS_COLLECTION, userDoc.id), {
        subscription,
        updatedAt: serverTimestamp(),
      })
      return true
    }
    
    return false
  } catch (error) {
    console.error("Error updating user subscription in Firebase:", error)
    return false
  }
}

/**
 * Update user email verification status in Firebase
 */
export async function updateUserEmailVerificationInFirebase(
  email: string,
  emailVerified: boolean
): Promise<boolean> {
  if (!db) {
    console.warn("Firebase not initialized.")
    return false
  }

  try {
    const q = query(collection(db, USERS_COLLECTION), where("email", "==", email))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0]
      await updateDoc(doc(db, USERS_COLLECTION, userDoc.id), {
        emailVerified,
        updatedAt: serverTimestamp(),
      })
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Updated email verification status in Firebase for ${email}: ${emailVerified}`)
      }
      return true
    }
    
    return false
  } catch (error) {
    console.error("Error updating email verification in Firebase:", error)
    return false
  }
}