import { NextRequest, NextResponse } from 'next/server'
import { hashPassword } from '@/lib/password-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, gender, favoriteArtists, favoriteActivities } = body

    // Validation
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

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase()

    // In a real app, you would:
    // 1. Check if user exists in database
    // 2. Hash the password
    // 3. Store user in database
    // 4. Return success

    // For now, we'll return the user data with hashed password
    // The client will store it in localStorage AND we can add database later
    const hashedPassword = await hashPassword(password)

    const userData = {
      name,
      email: normalizedEmail,
      password: hashedPassword, // Store hashed password
      gender: gender || '',
      favoriteArtists: favoriteArtists || '',
      favoriteActivities: favoriteActivities || '',
      createdAt: new Date().toISOString(),
    }

    // TODO: Store in database here
    // await db.users.create(userData)

    return NextResponse.json({
      success: true,
      user: {
        name: userData.name,
        email: userData.email,
        gender: userData.gender,
        favoriteArtists: userData.favoriteArtists,
        favoriteActivities: userData.favoriteActivities,
      },
      // Return hashed password so client can store it
      passwordHash: userData.password,
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    )
  }
}

