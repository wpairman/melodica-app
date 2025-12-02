import { NextRequest, NextResponse } from 'next/server'
import { sendVerificationEmail } from '@/lib/email-utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, token } = body

    if (!email || !name || !token) {
      return NextResponse.json(
        { error: 'Email, name, and token are required' },
        { status: 400 }
      )
    }

    const result = await sendVerificationEmail(email, name, token)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send verification email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in send-verification-email route:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

