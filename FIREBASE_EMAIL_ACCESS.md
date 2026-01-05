# Accessing Registered Emails from Firebase

All user emails are automatically saved to Firebase Firestore when users register. This guide shows you how to access and export all registered emails.

## 📋 Prerequisites

1. Firebase project must be set up (see `lib/firebase-config.ts`)
2. Firebase environment variables configured in `.env.local`
3. Access to Firebase Console

## 🔥 Accessing Emails in Firebase Console

### Step 1: Go to Firebase Console
1. Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Select your project

### Step 2: Navigate to Firestore Database
1. Click on **"Firestore Database"** in the left sidebar
2. You should see a collection called **"users"**

### Step 3: View All Users
1. Click on the **"users"** collection
2. You'll see all registered users with their data
3. Each document contains:
   - `email` - User's email address
   - `name` - User's name
   - `emailVerified` - Whether email is verified (true/false)
   - `createdAt` - Registration timestamp
   - `updatedAt` - Last update timestamp
   - Other user data (gender, preferences, etc.)

## 📊 Exporting Emails

### Option 1: Export from Firebase Console (Manual)

1. In Firestore Database, click on the **"users"** collection
2. Click the **three dots menu** (⋮) at the top
3. Select **"Export collection"**
4. Choose export format (JSON or CSV)
5. Download the file

### Option 2: Export via Firebase CLI (Automated)

If you have Firebase CLI installed:

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Export users collection
firebase firestore:export ./exports/users --collection-ids=users
```

### Option 3: Use Firebase Admin SDK (Programmatic)

Create a script to export emails:

```javascript
// scripts/export-emails.js
const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccount = require('./path-to-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function exportEmails() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  
  const emails = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    emails.push({
      email: data.email,
      name: data.name,
      emailVerified: data.emailVerified || false,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
    });
  });
  
  // Export as JSON
  fs.writeFileSync('emails.json', JSON.stringify(emails, null, 2));
  
  // Export as CSV
  const csv = [
    ['Email', 'Name', 'Verified', 'Created At'],
    ...emails.map(u => [u.email, u.name, u.emailVerified, u.createdAt])
  ].map(row => row.join(',')).join('\n');
  
  fs.writeFileSync('emails.csv', csv);
  
  console.log(`Exported ${emails.length} emails`);
}

exportEmails();
```

## 🔍 Filtering Users

### View Only Verified Emails
In Firebase Console:
1. Click on "users" collection
2. Use the filter icon
3. Add filter: `emailVerified` = `true`

### View Only Unverified Emails
1. Click on "users" collection
2. Use the filter icon
3. Add filter: `emailVerified` = `false` OR `emailVerified` does not exist

## 📧 Getting Just Email Addresses

### Using Firebase Console Query
1. In Firestore, create a query:
   - Collection: `users`
   - Field: `email`
   - Operator: `exists`
   - Value: `true`
2. Export the results

### Using Firebase Admin SDK
```javascript
const emails = [];
snapshot.forEach(doc => {
  emails.push(doc.data().email);
});

// Save as text file (one email per line)
fs.writeFileSync('emails.txt', emails.join('\n'));

// Save as comma-separated
fs.writeFileSync('emails-comma.txt', emails.join(', '));
```

## 🔐 Security Notes

- **Never expose Firebase credentials** in client-side code
- Use Firebase Admin SDK for server-side operations
- Set up proper Firestore security rules
- Consider using Firebase Functions for automated exports

## 📝 Current Implementation

The app automatically saves users to Firebase when they register:
- **File**: `app/register/page.tsx` (line ~330)
- **Function**: `saveUserToFirebase()` from `lib/firebase-users.ts`
- **Collection**: `users` in Firestore

Email verification status is also updated in Firebase:
- **File**: `app/verify-email/page.tsx`
- **Function**: `updateUserEmailVerificationInFirebase()`

## 🔄 Migrating Existing Users

If you have users in localStorage that aren't in Firebase yet, use the migration tool:

1. **Via Web Page**: Visit `/migrate-users` in your app
   - Compare user counts between localStorage and Firebase
   - Migrate all users with one click
   - View migration results and errors

2. **Via Browser Console**:
   ```javascript
   import { migrateUsersToFirebase } from '@/lib/migrate-users-to-firebase'
   await migrateUsersToFirebase()
   ```

The migration is safe to run multiple times - it will update existing users rather than creating duplicates.

## 🚀 Quick Access

**Direct link to Firestore**: 
```
https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore/data/~2Fusers
```

Replace `YOUR_PROJECT_ID` with your actual Firebase project ID.

