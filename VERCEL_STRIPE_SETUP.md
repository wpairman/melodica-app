# 🔐 Adding Stripe Keys to Vercel Dashboard

## Step-by-Step Instructions

### Step 1: Navigate to Project Settings

From the Vercel dashboard you're viewing:

1. Click the **"Project configuration"** button in the project overview card (top section)
   - OR click the **gear icon (⚙️)** in the left sidebar
   - OR go to: `https://vercel.com/[your-org]/[project-name]/settings`

### Step 2: Go to Environment Variables

1. In the Settings page, look for the left menu
2. Click on **"Environment Variables"** (under Configuration section)

### Step 3: Add Your Stripe Keys

Click **"Add New"** button and add each variable:

#### Variable 1: Stripe Secret Key
- **Key:** `STRIPE_SECRET_KEY`
- **Value:** `sk_test_...` (from Stripe Dashboard)
- **Environment:** Select **Production**, **Preview**, and **Development** (or just Production if you only want it there)
- Click **Save**

#### Variable 2: Stripe Publishable Key
- **Key:** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Value:** `pk_test_...` (from Stripe Dashboard)
- **Environment:** Select **Production**, **Preview**, and **Development**
- Click **Save**

#### Variable 3: Stripe Webhook Secret
- **Key:** `STRIPE_WEBHOOK_SECRET`
- **Value:** `whsec_...` (from Stripe Webhook endpoint)
- **Environment:** Select **Production** (and Preview if needed)
- Click **Save**

### Step 4: Redeploy

1. After adding all variables, go back to your project
2. Click **"Deployments"** in the left sidebar
3. Find the latest deployment
4. Click the **three dots (⋯)** menu
5. Click **"Redeploy"**
   - OR make a small change and push to GitHub (will auto-redeploy)

## 📍 Quick Path

```
Vercel Dashboard → Your Project → Settings (gear icon) → Environment Variables → Add New
```

## ✅ Verification

After redeploying:
1. Test checkout on your live site: `https://your-domain.vercel.app/pricing`
2. Check Stripe Dashboard → **Payments** to see if test payment was processed
3. Check Vercel deployment logs if there are any errors

## 🔍 Can't Find Environment Variables?

If you don't see "Environment Variables":
- Make sure you have **Admin/Owner** access to the project
- Check that you're in **Settings**, not the overview page
- Look under the **"Configuration"** section in the left menu

---

**Need your Stripe keys?**
- Go to: https://dashboard.stripe.com/apikeys
- See [STRIPE_SETUP.md](./STRIPE_SETUP.md) for detailed instructions

