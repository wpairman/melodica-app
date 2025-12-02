import { Resend } from 'resend'

// Initialize Resend - use environment variable for API key
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder_key')

/**
 * Generate a secure verification token
 */
export function generateVerificationToken(): string {
  // Generate a random token using crypto
  const array = new Uint8Array(32)
  if (typeof window !== 'undefined') {
    // Browser environment
    crypto.getRandomValues(array)
  } else {
    // Node.js environment
    const nodeCrypto = require('crypto')
    nodeCrypto.randomFillSync(array)
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Send verification email to user
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the base URL from environment or use default
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_VERCEL_URL 
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
      : 'http://localhost:3000'
    
    const verificationUrl = `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Melodica <onboarding@resend.dev>',
      to: email,
      subject: 'Verify your Melodica account',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎵 Melodica</h1>
            </div>
            <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">Welcome, ${name}!</h2>
              <p style="color: #666; font-size: 16px;">
                Thank you for signing up for Melodica. To complete your registration and start using all features, please verify your email address by clicking the button below:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Verify Email Address
                </a>
              </div>
              <p style="color: #999; font-size: 14px; margin-top: 30px;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="color: #667eea; font-size: 12px; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">
                ${verificationUrl}
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                This verification link will expire in 24 hours. If you didn't create an account with Melodica, please ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
      text: `
Welcome to Melodica, ${name}!

Please verify your email address by clicking the link below:
${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account with Melodica, please ignore this email.
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error sending verification email:', error)
    return { success: false, error: error.message || 'Failed to send email' }
  }
}

/**
 * Send resend verification email
 */
export async function resendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  return sendVerificationEmail(email, name, token)
}

