import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      password,
      gender,
      favoriteArtists,
      favoriteActivities,
      musicGenres,
      mentalIllnesses,
      medication,
      selectedPlan,
    } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    const userRecord = await adminAuth.createUser({
      email: normalizedEmail,
      password,
      displayName: name,
    })

    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      name,
      email: normalizedEmail,
      gender: gender || '',
      favoriteArtists: favoriteArtists || '',
      favoriteActivities: favoriteActivities || '',
      musicGenres: musicGenres || '',
      mentalIllnesses: mentalIllnesses || 'No',
      medication: medication || 'No',
      selectedPlan: selectedPlan || '',
      emailVerified: false,
      subscription: { plan: 'none', status: 'inactive' },
      createdAt: new Date().toISOString(),
    })

    const customToken = await adminAuth.createCustomToken(userRecord.uid)

    return NextResponse.json({
      success: true,
      customToken,
      user: {
        uid: userRecord.uid,
        name,
        email: normalizedEmail,
      },
    })
  } catch (error: any) {
    console.error('Registration error:', error)

    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    )
  }
}
