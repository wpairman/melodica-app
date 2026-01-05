import { NextResponse } from 'next/server'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore'

// Initialize Firebase for server-side use
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let app: any = null
let db: any = null

function initFirebase() {
  if (!app && firebaseConfig.apiKey) {
    try {
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig)
      } else {
        app = getApps()[0]
      }
      db = getFirestore(app)
    } catch (error) {
      console.error('Firebase initialization error:', error)
    }
  }
  return { app, db }
}

export async function GET() {
  try {
    const { db } = initFirebase()
    
    if (!db) {
      return NextResponse.json(
        { error: 'Firebase not configured' },
        { status: 500 }
      )
    }

    const usersRef = collection(db, 'users')
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
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      })
    })
    
    return NextResponse.json({
      success: true,
      count: users.length,
      users: users,
      emails: users.map(u => u.email),
    })
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

