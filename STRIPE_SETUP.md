# 💳 Stripe Payment Integration Setup Guide

This guide will help you set up Stripe payments for Melodica.

## ⚠️ IMPORTANT: Security

**NEVER commit your Stripe keys to GitHub!** They must be kept secret and only added as environment variables.

## 📋 Required Stripe Keys

You'll need these three environment variables:

1. `STRIPE_SECRET_KEY` - Your Stripe secret key (server-side only)
2. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key (safe for client-side)
3. `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (for verifying webhook events)

## 🚀 Step-by-Step Setup

### Step 1: Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Sign up for a free account
3. Complete the onboarding process

### Step 2: Get Your API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Developers** → **API keys**
3. Copy your keys:
   - **Publishable key** (starts with `pk_test_` for test mode)
   - **Secret key** (starts with `sk_test_` for test mode) - Click "Reveal test key"

### Step 3: Create Products and Prices in Stripe

1. Go to **Products** in Stripe Dashboard
2. Create products for each plan:
   - **Premium** - $1.99/month
   - **Ultimate** - $2.99/month
   - **Lifetime** - $99.99 one-time

3. For each product, create prices:
   - **Monthly subscription** prices
   - **Yearly subscription** prices (optional)
   - **One-time payment** for Lifetime

4. **Copy the Price IDs** (they look like `price_1Rgy9yHc0HPmM6HNPf15gTLT`)

### Step 4: Update Price IDs in Code

Edit `app/api/stripe/checkout/route.ts` and update the `priceMap` with your actual Stripe Price IDs:

```typescript
const priceMap: Record<string, Record<string, string>> = {
  premium: {
    monthly: "price_YOUR_PREMIUM_MONTHLY_ID",
    yearly: "price_YOUR_PREMIUM_YEARLY_ID",
    lifetime: "price_YOUR_LIFETIME_ID",
  },
  ultimate: {
    monthly: "price_YOUR_ULTIMATE_MONTHLY_ID",
    yearly: "price_YOUR_ULTIMATE_YEARLY_ID",
    lifetime: "price_YOUR_LIFETIME_ID",
  },
};
```

### Step 5: Local Development Setup

1. Create a `.env.local` file in the project root:

```env
# Stripe Keys (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Optional: Weather API
NEXT_PUBLIC_WEATHER_API_KEY=your_weather_api_key
```

2. **Restart your development server** after adding environment variables:
   ```bash
   npm run dev
   ```

### Step 6: Set Up Stripe Webhook (For Production)

Webhooks allow Stripe to notify your app when payments are completed.

#### For Local Testing (Stripe CLI):

1. Install Stripe CLI:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. Copy the webhook signing secret (starts with `whsec_`) and add it to `.env.local`

#### For Production (Vercel/Netlify):

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL:
   - **Vercel**: `https://your-domain.vercel.app/api/stripe/webhook`
   - **Netlify**: `https://your-domain.netlify.app/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)

### Step 7: Configure Environment Variables in Production

#### For Vercel:

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Settings** → **Environment Variables**
3. Add these variables for **Production**, **Preview**, and **Development**:
   - `STRIPE_SECRET_KEY` = `sk_live_...` (for production) or `sk_test_...` (for testing)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_...` (production) or `pk_test_...` (testing)
   - `STRIPE_WEBHOOK_SECRET` = `whsec_...` (from webhook endpoint)
4. Click **Save** and **Redeploy** your application

#### For Netlify:

1. Go to your site in [Netlify Dashboard](https://app.netlify.com)
2. Click **Site settings** → **Environment variables**
3. Click **Add a variable** for each:
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
4. Click **Save** and trigger a new deployment

## 🔄 Test Mode vs Live Mode

### Test Mode (Development)
- Use keys starting with `pk_test_` and `sk_test_`
- No real charges are made
- Use test card numbers: `4242 4242 4242 4242`
- Any future expiry date and CVC

### Live Mode (Production)
- Switch to **Live mode** in Stripe Dashboard
- Use keys starting with `pk_live_` and `sk_live_`
- Real charges will be processed
- Must activate your Stripe account first

## ✅ Testing Your Integration

1. **Test Checkout Flow:**
   - Go to `/pricing` page
   - Click "Subscribe" on any plan
   - Use test card: `4242 4242 4242 4242`
   - Complete checkout

2. **Verify Payment:**
   - Check Stripe Dashboard → **Payments**
   - Check that subscription was created in **Subscriptions**
   - Verify webhook events in **Developers** → **Webhooks** → **Events**

3. **Check Success Page:**
   - After payment, you should be redirected to `/subscription/success`
   - Verify subscription details are displayed

## 🔍 Troubleshooting

### "Stripe key not found" Error
- ✅ Check that `.env.local` exists in project root
- ✅ Verify variable names are correct (case-sensitive)
- ✅ Restart development server after adding variables
- ✅ For production, check environment variables in deployment platform

### Webhook Not Working
- ✅ Verify webhook URL is correct
- ✅ Check that `STRIPE_WEBHOOK_SECRET` matches your endpoint secret
- ✅ Ensure webhook events are selected in Stripe Dashboard
- ✅ Check deployment platform logs for webhook errors

### Payment Succeeds but Subscription Not Activated
- ✅ Check webhook endpoint is receiving events
- ✅ Verify `checkout.session.completed` event is handled
- ✅ Check that `payment_status === "paid"` in webhook handler
- ✅ Review server logs for errors

### Test Cards Not Working
- ✅ Make sure you're using test mode keys
- ✅ Use Stripe test card numbers
- ✅ Check that card details are valid (any future date, any CVC)

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

## 🔒 Security Checklist

- ✅ Never commit `.env.local` to Git (it's in `.gitignore`)
- ✅ Never commit Stripe keys to GitHub
- ✅ Use different keys for test and production
- ✅ Rotate keys if accidentally exposed
- ✅ Use webhook signature verification (already implemented)
- ✅ Verify payment status before activating subscriptions

## 💡 Current Price IDs

The app is currently configured with these test price IDs (update with your own):

```typescript
premium: {
  monthly: "price_1Rgy9yHc0HPmM6HNPf15gTLT",
  yearly: "price_1RgyAzHc0HPmM6HNaJ2zl66e",
  lifetime: "price_1RgyBuHc0HPmM6HNeljL7yLP",
},
ultimate: {
  monthly: "price_1RgyALHc0HPmM6HNrgM1PIjS",
  yearly: "price_1RgyBSHc0HPmM6HN9aSZs616",
  lifetime: "price_1RgyBuHc0HPmM6HNeljL7yLP",
}
```

**Remember to replace these with your actual Stripe Price IDs!**

---

Need help? Check the [Stripe Support Center](https://support.stripe.com/) or review your deployment platform's documentation for environment variable setup.

