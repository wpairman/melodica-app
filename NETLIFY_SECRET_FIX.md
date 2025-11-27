# Fixing Netlify Secret Detection for NEXT_PUBLIC_FIREBASE_API_KEY

## The Issue
Netlify's build is failing because it detects `NEXT_PUBLIC_FIREBASE_API_KEY` as an exposed secret in build output files.

## The Solution
Add `SECRETS_SCAN_OMIT_KEYS` environment variable to tell Netlify to ignore this key.

## Step-by-Step Fix

### Option 1: Add via netlify.toml (Already Done ✅)
The `netlify.toml` file has been updated with:
```toml
[build.environment]
  SECRETS_SCAN_OMIT_KEYS = "NEXT_PUBLIC_FIREBASE_API_KEY"
```

### Option 2: Add via Netlify Dashboard (Alternative)
If you prefer to set it in the dashboard:

1. Go to **Site configuration** → **Environment variables**
2. Click **"Add a variable"**
3. Set:
   - **Key:** `SECRETS_SCAN_OMIT_KEYS`
   - **Value:** `NEXT_PUBLIC_FIREBASE_API_KEY`
   - **Scopes:** Select all (Production, Deploy Previews, Branch deploys)
4. Click **"Create variable"**
5. Trigger a new deploy

## Why This is Safe
- `NEXT_PUBLIC_` prefix means it's **intentionally public**
- Firebase API keys are **designed to be public** (they're restricted by domain in Firebase Console)
- This is **standard practice** for Firebase web apps
- The key appears in build output because Next.js bundles it into the client-side JavaScript (which is expected)

## After Adding the Variable
1. Trigger a new deploy
2. The build should now pass
3. The secret scanner will skip checking `NEXT_PUBLIC_FIREBASE_API_KEY`

## Multiple Keys
If you need to omit multiple keys, separate them with commas:
```
SECRETS_SCAN_OMIT_KEYS = "NEXT_PUBLIC_FIREBASE_API_KEY,ANOTHER_KEY"
```
