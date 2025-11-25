# Firebase Setup Guide

This guide will help you set up Firebase to track all users across devices in your admin panel.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard:
   - Enter project name (e.g., "melodica-app")
   - Enable/disable Google Analytics (optional)
   - Click "Create project"

## Step 2: Enable Firestore Database

1. In your Firebase project, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development) or "Start in production mode" (for production)
4. Select a location for your database (choose the closest to your users)
5. Click "Enable"

## Step 3: Get Your Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Scroll down to "Your apps" section
3. Click the web icon `</>` to add a web app
4. Register your app:
   - Enter app nickname (e.g., "Melodica Web")
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"
5. Copy the Firebase configuration object

## Step 4: Add Environment Variables

Create a `.env.local` file in your project root (if it doesn't exist) and add:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

Replace the values with your actual Firebase config values.

## Step 5: Set Up Firestore Security Rules

1. In Firebase Console, go to "Firestore Database" → "Rules"
2. For development, you can use these rules (⚠️ NOT for production):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Allow read/write for now (development only)
      allow read, write: if true;
    }
  }
}
```

3. For production, use more secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Only allow admins to read all users
      allow read: if request.auth != null && 
        request.auth.token.email in ['will7ovo@gmail.com', 'willp2000@icloud.com'];
      // Allow users to write their own data
      allow write: if request.auth != null && 
        (request.auth.uid == userId || 
         request.auth.token.email in ['will7ovo@gmail.com', 'willp2000@icloud.com']);
    }
  }
}
```

## Step 6: Restart Your Development Server

After adding environment variables:

```bash
npm run dev
```

## Step 7: Test the Integration

1. Register a new user account
2. Check Firebase Console → Firestore Database → `users` collection
3. You should see the new user document
4. Go to Admin Panel in your app
5. You should see all users from Firebase (not just localStorage)

## Troubleshooting

### Users not appearing in admin panel
- Check browser console for Firebase errors
- Verify environment variables are set correctly
- Make sure Firestore is enabled and rules allow read access
- Check that `.env.local` file exists and has correct values

### Firebase not initializing
- Verify all environment variables start with `NEXT_PUBLIC_`
- Restart your dev server after adding env variables
- Check browser console for specific error messages

### Permission denied errors
- Update Firestore security rules to allow read/write
- Make sure you're logged in with an admin email

## Important Notes

- **Free Tier**: Firebase has a generous free tier (Spark plan) that should be sufficient for most apps
- **Security**: Update Firestore rules for production to prevent unauthorized access
- **Backup**: Firebase automatically backs up your data
- **Offline Support**: The app will fall back to localStorage if Firebase is not configured

## Next Steps

Once Firebase is set up:
- All new user registrations will be saved to Firebase
- Admin panel will show all users from Firebase
- Users can sign up on any device and appear in admin panel
- Consider adding Firebase Authentication for more secure login

