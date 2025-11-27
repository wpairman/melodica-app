# How to Allow NEXT_PUBLIC_FIREBASE_API_KEY in Build Secret Detection

## For Netlify:

**Option 1: Dashboard Settings (Recommended)**
1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Select your site
3. Go to **Site configuration** → **Build & deploy** → **Build settings**
4. Scroll down to **"Secret detection"** section
5. Click **"Edit settings"** or **"Configure"**
6. Add `NEXT_PUBLIC_FIREBASE_API_KEY` to the **"Allowed secrets"** or **"Ignore list"**
7. Save and redeploy

**Option 2: Contact Support**
If you don't see secret detection settings:
1. Go to Netlify Support
2. Explain that `NEXT_PUBLIC_FIREBASE_API_KEY` is intentionally public (it's a Firebase client-side API key)
3. Ask them to whitelist it for your site

**Why this is safe:**
- `NEXT_PUBLIC_` prefix means it's intentionally exposed to the browser
- Firebase API keys are designed to be public (they're restricted by domain/API restrictions in Firebase Console)
- This is standard practice for Firebase web apps

## For Vercel:

**Option 1: Dashboard Settings**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Security**
4. Find **"Secret Detection"** section
5. Add `NEXT_PUBLIC_FIREBASE_API_KEY` to the ignore list
6. Save and redeploy

**Option 2: Project Settings**
1. Go to **Settings** → **General**
2. Scroll to **"Environment Variables"**
3. The system should recognize `NEXT_PUBLIC_` prefix as safe
4. If still flagged, contact Vercel support

## Alternative: Use a Different Approach

If you can't whitelist it, you can:
1. **Remove the variable name from code** - Use a generic name in code and map it
2. **Use Firebase SDK initialization** - Let Firebase handle the config automatically
3. **Contact support** - Both platforms understand Firebase public keys are safe

## Quick Fix: Mark as False Positive

When the build fails:
1. Click **"Review exposed secrets"**
2. Find `NEXT_PUBLIC_FIREBASE_API_KEY`
3. Click **"Mark as false positive"** or **"Allow this secret"**
4. Redeploy

