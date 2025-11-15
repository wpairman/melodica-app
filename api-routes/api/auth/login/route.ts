import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword } from '@/lib/password-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase()

    // In a real app, you would:
    // 1. Find user in database by email
    // 2. Verify password hash
    // 3. Return user data if valid

    // For now, we'll check localStorage on the server side is not possible
    // So we need to use a different approach:
    // Option 1: Use a database (recommended)
    // Option 2: Use a cloud storage service
    // Option 3: For now, return instructions to sync accounts

    // TODO: Replace with database query
    // const user = await db.users.findByEmail(normalizedEmail)
    // if (!user) {
    //   return NextResponse.json(
    //     { error: 'Invalid email or password' },
    //     { status: 401 }
    //   )
    // }
    // const isValid = await verifyPassword(password, user.password)
    // if (!isValid) {
    //   return NextResponse.json(
    //     { error: 'Invalid email or password' },
    //     { status: 401 }
    //   )
    // }

    // For now, return a message indicating the account needs to be synced
    // This is a temporary solution until database is set up
    return NextResponse.json({
      error: 'Account not found. Please register on this device first, or set up a database for multi-device support.',
      requiresDatabase: true,
    }, { status: 404 })

    // Once database is set up, uncomment this:
    // return NextResponse.json({
    //   success: true,
    //   user: {
    //     name: user.name,
    //     email: user.email,
    //     gender: user.gender,
    //     favoriteArtists: user.favoriteArtists,
    //     favoriteActivities: user.favoriteActivities,
    //   },
    // })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    )
  }
}

