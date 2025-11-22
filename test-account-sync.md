# Account Sync Testing Checklist

## Test Scenario 1: Export Account
1. ✅ User is logged in on Device A
2. ✅ Go to Dashboard → Settings
3. ✅ Scroll to "Multi-Device Account Sync"
4. ✅ Click "Export Account"
5. ✅ Verify JSON file downloads with name: `melodica-account-YYYY-MM-DD.json`
6. ✅ Verify file contains:
   - `allUsers` array
   - `currentUser` object
   - `userData` object
   - `exportedAt` timestamp
   - `version: "1.0"`

## Test Scenario 2: Import Account on Login Page
1. ✅ User is on Device B (new device, not logged in)
2. ✅ Go to Login page
3. ✅ See blue notice: "Using a new device?"
4. ✅ Click "Import Account from Another Device"
5. ✅ Select the exported JSON file
6. ✅ Verify:
   - Toast shows "Account imported successfully"
   - User is automatically logged in
   - Redirects to dashboard
   - Can access all features

## Test Scenario 3: Import Account in Settings
1. ✅ User is logged in on Device B
2. ✅ Go to Dashboard → Settings
3. ✅ Scroll to "Multi-Device Account Sync"
4. ✅ Click "Import Account"
5. ✅ Select the exported JSON file
6. ✅ Verify:
   - Toast shows "Account imported"
   - Page reloads
   - User remains logged in
   - All data is synced

## Test Scenario 4: Error Handling
1. ✅ Try importing invalid file (not JSON)
   - Should show error: "Failed to import account data"
2. ✅ Try importing file without version/exportedAt
   - Should show error: "Invalid account file format"
3. ✅ Try exporting when not logged in
   - Should show error: "No account data found to export"

## Test Scenario 5: Login After Import
1. ✅ Import account on Device B
2. ✅ Log out
3. ✅ Try to log in with same credentials
4. ✅ Should work because allUsers array now contains the user

## Code Verification
- ✅ Build passes without errors
- ✅ All imports are correct
- ✅ TypeScript types are valid
- ✅ localStorage operations are wrapped in try-catch
- ✅ Error messages are user-friendly

