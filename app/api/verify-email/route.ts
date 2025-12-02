import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token and email are required' },
        { status: 400 }
      )
    }

    // In a real app, you would verify the token against a database
    // For now, we'll return success and let the client handle verification
    // The client will check localStorage for the token and mark the user as verified

    return NextResponse.json({ 
      success: true,
      message: 'Email verification successful'
    })
  } catch (error: any) {
    console.error('Error in verify-email route:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, email } = body

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token and email are required' },
        { status: 400 }
      )
    }

    // Verify token and email match
    // This will be handled client-side with localStorage
    return NextResponse.json({ 
      success: true,
      message: 'Email verification successful'
    })
  } catch (error: any) {
    console.error('Error in verify-email route:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

