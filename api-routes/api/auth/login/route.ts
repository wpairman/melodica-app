import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, isOldHashFormat } from '@/lib/password-utils'
import { getUserByEmailFromFirebase } from '@/lib/firebase-users'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    const firebaseUser = await getUserByEmailFromFirebase(normalizedEmail)

    if (!firebaseUser || !firebaseUser.password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const storedPassword = firebaseUser.password

    let isValid = false
    if (isOldHashFormat(storedPassword)) {
      isValid = storedPassword === password
    } else {
      isValid = await verifyPassword(password, storedPassword)
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const userPayload = {
      name: firebaseUser.name,
      email: firebaseUser.email,
      gender: firebaseUser.gender || '',
      favoriteArtists: firebaseUser.favoriteArtists || '',
      favoriteActivities: firebaseUser.favoriteActivities || '',
      musicGenres: firebaseUser.musicGenres || '',
      subscription: firebaseUser.subscription || null,
    }

    return NextResponse.json({
      success: true,
      user: userPayload,
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    )
  }
}

