# Option 1: Payment-First Flow - Setup Guide

This app now uses a **payment-first** flow: users choose a plan and pay before creating an account.

## Flow

1. User visits **Pricing** → clicks Subscribe on a plan → **Register** page (with plan preselected)
2. User fills in name, email, password → creates account → redirects to **Stripe Checkout**
3. After payment → redirect to **Subscription Success** page
4. User is logged in automatically and redirected to dashboard

## Netlify Functions

Stripe API routes are deployed as **Netlify Functions** in `netlify/functions/`:

- `stripe-checkout.ts` - Creates Stripe Checkout session
- `stripe-verify-session.ts` - Verifies payment and returns session data
- `stripe-webhook.ts` - Handles Stripe webhook events

Redirects in `netlify.toml` route `/api/stripe/*` to these functions.

## Environment Variables (Netlify)

Add these in **Site settings → Environment variables**:

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Your Stripe secret key (sk_live_... or sk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (whsec_...) |

## Stripe Webhook

1. In [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks), add endpoint:
   - **URL:** `https://YOUR-SITE.netlify.app/.netlify/functions/stripe-webhook`
   - **Events:** `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
2. Copy the **Signing secret** and set as `STRIPE_WEBHOOK_SECRET`

## Local Development

For local testing with Stripe:

```bash
npm run build
netlify dev
```

This runs the static site + Netlify Functions locally. The functions will be at `http://localhost:8888/.netlify/functions/...` and redirects will proxy `/api/stripe/*` to them.

## Changes Made

- **Register page:** Form at `/register?plan=X&interval=Y` — user creates account, then proceeds to Stripe Checkout
- **Home page:** All "Sign Up" / "Get Started" CTAs go to `/pricing`
- **Subscription success:** Create-account form when user doesn't exist
- **Login, Privacy, Terms:** "Register" links updated to "Get Started" → `/pricing`
