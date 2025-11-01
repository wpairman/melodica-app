# 🔐 Setting Up Stripe with GitHub

This guide shows how to configure Stripe payments when deploying from GitHub to Vercel/Netlify.

## ⚠️ Important: Never Commit Keys to GitHub

**Your Stripe keys should NEVER be in your code or committed to GitHub.** They must be set as environment variables in your deployment platform.

## 🚀 Option 1: Deploy to Vercel (Recommended)

Vercel automatically deploys from GitHub and supports environment variables.

### Step 1: Connect GitHub to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New Project**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings

### Step 2: Add Stripe Environment Variables in Vercel

1. In your Vercel project, go to **Settings** → **Environment Variables**
2. Add these variables for **Production**, **Preview**, and **Development**:

```
STRIPE_SECRET_KEY = sk_live_... (or sk_test_... for testing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_... (or pk_test_... for testing)
STRIPE_WEBHOOK_SECRET = whsec_... (from Stripe webhook endpoint)
```

3. Click **Save** for each variable
4. **Redeploy** your application for changes to take effect

### Step 3: Set Up Stripe Webhook for Production

1. Get your Vercel deployment URL (e.g., `https://melodica-app.vercel.app`)
2. In Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**
3. Enter: `https://your-domain.vercel.app/api/stripe/webhook`
4. Select events: `checkout.session.completed`, `customer.subscription.*`, etc.
5. Copy the webhook signing secret (`whsec_...`)
6. Add it to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

## 🚀 Option 2: Deploy to Netlify

Similar process for Netlify:

### Step 1: Connect GitHub to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click **Add new site** → **Import an existing project**
3. Choose GitHub and select your repository

### Step 2: Add Environment Variables in Netlify

1. Go to **Site settings** → **Environment variables**
2. Click **Add a variable** for each:

```
STRIPE_SECRET_KEY = sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_...
STRIPE_WEBHOOK_SECRET = whsec_...
```

3. Click **Save**
4. Trigger a new deployment

### Step 3: Set Up Stripe Webhook

1. Use your Netlify URL: `https://your-site.netlify.app/api/stripe/webhook`
2. Configure in Stripe Dashboard (same as Vercel steps above)

## 🔧 Option 3: GitHub Actions (For CI/CD)

If you're using GitHub Actions, you can store secrets in GitHub:

### Step 1: Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each:

- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

**Note:** GitHub Secrets are for CI/CD only. For actual deployment, use your hosting platform's environment variables (Vercel/Netlify).

### Step 2: Update GitHub Actions Workflow (Optional)

If you have a workflow file (`.github/workflows/deploy.yml`), you can reference secrets:

```yaml
env:
  STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
  STRIPE_PUBLISHABLE_KEY: ${{ secrets.STRIPE_PUBLISHABLE_KEY }}
```

## ✅ Verification Checklist

After setting up:

- [ ] Environment variables added to Vercel/Netlify
- [ ] Stripe webhook endpoint created in Stripe Dashboard
- [ ] Webhook secret added to environment variables
- [ ] Application redeployed with new variables
- [ ] Test payment flow on `/pricing` page
- [ ] Verify webhook events in Stripe Dashboard
- [ ] Check that subscriptions activate after payment

## 📝 Quick Reference

### Where to Find Stripe Keys:

1. **API Keys**: [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
   - Publishable key: `pk_test_...` or `pk_live_...`
   - Secret key: `sk_test_...` or `sk_live_...`

2. **Webhook Secret**: [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
   - Click on your webhook endpoint
   - Click "Reveal" next to "Signing secret"
   - Copy `whsec_...`

### Environment Variable Names:

```
STRIPE_SECRET_KEY          (server-side only)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  (client-side safe)
STRIPE_WEBHOOK_SECRET      (for webhook verification)
```

## 🔒 Security Reminders

- ✅ `.env.local` is in `.gitignore` - won't be committed
- ✅ Never commit actual keys to GitHub
- ✅ Use test keys for development, live keys for production
- ✅ Rotate keys if accidentally exposed
- ✅ Each environment (dev/staging/prod) should have separate keys

## 📚 Next Steps

1. Read [STRIPE_SETUP.md](./STRIPE_SETUP.md) for detailed setup instructions
2. Test locally with test keys
3. Deploy to Vercel/Netlify
4. Add production keys to deployment platform
5. Set up production webhook endpoint
6. Test with real payment (small amount first!)

---

**Remember:** GitHub is for code, not secrets. Always use your deployment platform's environment variable system!

