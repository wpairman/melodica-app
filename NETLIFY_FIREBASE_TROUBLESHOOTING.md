# Netlify Firebase Troubleshooting Guide

## Step 1: Verify Environment Variables Are Set

1. Go to Netlify Dashboard → Your Site → **Site configuration** → **Environment variables**
2. Verify all 6 variables are listed:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

## Step 2: Trigger a New Deploy

**IMPORTANT:** Environment variables only take effect after a new deploy!

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for the deploy to complete (usually 2-5 minutes)
4. The deploy must complete successfully

## Step 3: Check Firestore Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **melodica-2bce9**
3. Go to **Firestore Database** → **Rules** tab
4. Make sure rules allow writes:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if true;
    }
  }
}
```

5. Click **"Publish"**

## Step 4: Verify Firestore is Enabled

1. In Firebase Console → **Firestore Database**
2. You should see tabs: **Data**, **Rules**, **Indexes**, **Usage**
3. If you see "Create database" button, click it and enable Firestore

## Step 5: Test and Check Browser Console

1. Go to `melodicaapp.com`
2. Open browser console (F12)
3. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
4. Look for Firebase logs:
   - "🔍 Firebase Config Check"
   - "🔥 Initializing Firebase app..."
   - "✅ Firebase Firestore initialized: YES"
5. Try signing up a new user
6. Check console for:
   - "🔥 Attempting to save user to Firebase..."
   - "✅ User saved to Firebase successfully!"
   - Any error messages

## Step 6: Check Network Tab

1. Open browser DevTools → **Network** tab
2. Try signing up
3. Look for requests to `firestore.googleapis.com`
4. Check if any requests fail with:
   - 403 (Permission denied) → Firestore rules issue
   - 404 (Not found) → Firestore not enabled
   - Other errors → Check error details

## Common Issues:

### Issue: Variables not loading
- **Solution:** Make sure you triggered a new deploy after adding variables
- Variables only apply to new deploys, not existing ones

### Issue: "Firebase not initialized"
- **Solution:** Check that all 6 variables start with `NEXT_PUBLIC_`
- Verify variables are set for "Production" scope
- Trigger a new deploy

### Issue: "Permission denied" errors
- **Solution:** Update Firestore security rules (Step 3 above)

### Issue: No errors but users not appearing
- **Solution:** Check Firestore is enabled (Step 4)
- Verify you're checking the correct Firebase project
- Check browser console for silent failures

