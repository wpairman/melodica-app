# Netlify Environment Variables Setup

## Problem
Stripe payments work on `localhost:3001` but not on `https://melodica1.netlify.app` because environment variables need to be set in Netlify's dashboard.

## Solution: Add Environment Variables in Netlify

### Step 1: Go to Netlify Dashboard
1. Visit [https://app.netlify.com](https://app.netlify.com)
2. Log in to your account
3. Click on your site: **melodica1**

### Step 2: Navigate to Environment Variables
The exact location depends on your Netlify dashboard version. Try these paths:

**Method 1: Via Site Settings (Most Common)**
1. On your site dashboard, look for **"Site configuration"** or **"Site settings"** in the top navigation bar
2. Click on it
3. In the left sidebar, look for:
   - **"Environment variables"** OR
   - **"Build & deploy"** → Then click **"Environment"** or **"Environment variables"**
   - Sometimes it's under **"Build settings"** → **"Environment"**

**Method 2: Via Site Overview**
1. From your site dashboard (melodica1)
2. Click on **"Configuration"** or **"Settings"** in the top menu
3. Look for **"Environment variables"** in the left sidebar

**Method 3: Direct URL (if logged in)**
Try navigating directly to: `https://app.netlify.com/sites/melodica1/configuration/env`

### Step 3: Add STRIPE_SECRET_KEY
Once you're on the Environment Variables page:

1. Look for a button that says one of these:
   - **"Add a variable"**
   - **"New variable"**
   - **"Add environment variable"**
   - **"+ Add variable"**
   - It might be a blue button, or a green "+" icon button
   - Sometimes it's at the top right, sometimes at the bottom of the list

2. Click that button

3. Fill in the form:
   - **Key**: `STRIPE_SECRET_KEY`
   - **Value**: Your Stripe secret key from your Stripe dashboard (starts with `sk_live_` or `sk_test_`)
     - Get it from: https://dashboard.stripe.com/apikeys
     - ⚠️ **Never commit your actual secret key to Git** - only add it in Netlify's dashboard
   - **Scopes**: Select **All scopes** (or "Production" if you only want it for production)

4. Click **Save** or **Add variable**

### Step 4: Redeploy Your Site
After adding the environment variable, you need to trigger a new deployment:

**Option A: Redeploy via Dashboard**
1. Go to **Deploys** tab (top navigation)
2. Click the **...** (three dots) on the latest deployment
3. Select **Redeploy site**
4. Click **Redeploy**

**Option B: Trigger via Git Push**
```bash
# Make a small change (like adding a comment) and push
git commit --allow-empty -m "Trigger Netlify rebuild with env vars"
git push
```

### Step 5: Verify It Works
1. Wait for the deployment to finish (check the Deploys tab)
2. Visit: https://melodica1.netlify.app/pricing
3. Click any "Subscribe" button
4. It should redirect to Stripe checkout

## Important Notes

- ✅ Environment variables are available only **after** redeployment
- ✅ The variable name must be **exactly** `STRIPE_SECRET_KEY` (case-sensitive)
- ✅ Never commit `.env.local` to Git (it's already in `.gitignore`)
- ✅ The secret key should only be set in Netlify's dashboard, not in code

## Troubleshooting

### Still not working after redeploy?
1. **Check deployment logs**:
   - Go to **Deploys** → Click on the latest deployment
   - Look for any errors in the build logs
   - Search for "Stripe key check" to see if the variable is loaded

2. **Verify variable is set**:
   - Go to **Site settings** → **Environment variables**
   - Make sure `STRIPE_SECRET_KEY` appears in the list
   - Check that it's set for the correct scope (Production/All)

3. **Check API route logs**:
   - In Netlify, go to **Functions** tab
   - Look for API route logs when you click the payment button
   - Should show "Stripe key check: { exists: true, ... }"

4. **Test API directly**:
   - Open browser console on the pricing page
   - Try clicking a button and check the Network tab
   - Look at the `/api/stripe/checkout` request response
