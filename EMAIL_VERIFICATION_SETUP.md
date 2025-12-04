# Email Verification Setup Guide

This app now requires email verification for all new user registrations. Users must verify their email address before they can log in and access the dashboard.

## Setup Instructions

### 1. Get a Resend API Key

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day free)
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key (starts with `re_`)

### 2. Configure Environment Variables

Add these environment variables to your `.env.local` file (for local development) or your deployment platform (Vercel, etc.):

```env
# Resend API Key for sending verification emails
RESEND_API_KEY=re_your_api_key_here

# Email address to send from (must be verified in Resend)
# Format: "Display Name <email@domain.com>" or just "email@domain.com"
RESEND_FROM_EMAIL=Melodica <noreply@yourdomain.com>

# App URL (optional - will use Vercel URL if deployed, or localhost for development)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Verify Your Domain in Resend (Optional but Recommended)

For production, you should verify your domain in Resend:
1. Go to Resend Dashboard → Domains
2. Add your domain (e.g., `yourdomain.com`)
3. Add the DNS records provided by Resend
4. Wait for verification (usually takes a few minutes)
5. Update `RESEND_FROM_EMAIL` to use your verified domain

**📖 Detailed DNS Setup Instructions:** See [RESEND_DNS_SETUP.md](./RESEND_DNS_SETUP.md) for step-by-step instructions on configuring DKIM, SPF, and MX records for your domain provider.

For development/testing, you can use Resend's default domain (`onboarding@resend.dev`).

## How It Works

1. **Registration**: When a user signs up, a verification token is generated and stored
2. **Email Sent**: A verification email is automatically sent to the user's email address
3. **Verification**: User clicks the link in the email, which verifies their account
4. **Login**: Users cannot log in until their email is verified

## Features

- ✅ Automatic verification email on signup
- ✅ Token expiration (24 hours)
- ✅ Resend verification email functionality
- ✅ Email verification check on login
- ✅ Beautiful HTML email templates

## Troubleshooting

### Emails not sending?

1. Check that `RESEND_API_KEY` is set correctly
2. Verify your API key is active in Resend dashboard
3. Check Resend dashboard for error logs
4. Ensure `RESEND_FROM_EMAIL` is properly formatted

### Verification link not working?

1. Check that tokens haven't expired (24 hour limit)
2. Ensure the email matches exactly (case-insensitive)
3. Try requesting a new verification email

### Users can't log in?

- Users must verify their email before logging in
- If they didn't receive the email, they can request a new one from the verify-email page
- Check spam folder

## API Routes

- `POST /api/send-verification-email` - Sends verification email
- `GET /api/verify-email?token=...&email=...` - Verifies email token

## User Data Structure

Users now have these additional fields:
- `emailVerified`: boolean - Whether email is verified
- `verificationToken`: string - Current verification token
- `verificationTokenExpiry`: string - ISO date string of token expiry

