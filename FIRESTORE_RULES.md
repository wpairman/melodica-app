# Firestore Security Rules Setup

## Quick Fix: Allow All Reads/Writes (For Testing Only)

If users are not appearing in Firebase, the most common issue is Firestore security rules blocking writes.

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **melodica-2bce9**
3. Click on **Firestore Database** in the left sidebar

### Step 2: Open Rules Tab
1. Click on the **"Rules"** tab at the top
2. You'll see the current security rules

### Step 3: Update Rules (Temporary - For Testing)

**⚠️ WARNING: These rules allow anyone to read/write. Use only for testing!**

Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if true;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Step 4: Publish Rules
1. Click **"Publish"** button
2. Wait for confirmation

### Step 5: Test Again
1. Try signing up a new user
2. Check Firestore Database → `users` collection
3. User should appear immediately

## Production Rules (Use Later)

For production, use more secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Allow users to read their own data
      allow read: if request.auth != null && request.auth.uid == userId;
      // Allow anyone to create a user (for registration)
      allow create: if true;
      // Only allow users to update their own data
      allow update: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Troubleshooting

### Still not working?
1. **Check browser console** (F12) for specific error messages
2. **Verify Firestore is enabled**: 
   - Firebase Console → Firestore Database
   - If you see "Create database", click it and enable it
3. **Check environment variables**:
   - Make sure `.env.local` has all `NEXT_PUBLIC_FIREBASE_*` variables
   - Restart dev server after adding variables
4. **Check network tab**:
   - Open browser DevTools → Network tab
   - Look for requests to `firestore.googleapis.com`
   - Check if they're failing with 403 (permission denied) or other errors

