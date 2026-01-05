# Quick Migration Script - Run in Browser Console

## Step 1: Open Your App
1. Open your app in the browser (e.g., `http://localhost:3000`)
2. Open the browser console (Press F12, or right-click → Inspect → Console tab)

## Step 2: Copy and Paste This Script

Copy the entire script below and paste it into the browser console, then press Enter:

```javascript
(async function migrateUsersToFirebase() {
  console.log("🔄 Starting migration...");
  
  // Get users from localStorage
  const allUsersStr = localStorage.getItem("allUsers");
  if (!allUsersStr) {
    console.log("❌ No users found in localStorage");
    return;
  }
  
  let allUsers = [];
  try {
    allUsers = JSON.parse(allUsersStr);
  } catch (error) {
    console.error("❌ Error parsing localStorage:", error);
    return;
  }
  
  if (!Array.isArray(allUsers) || allUsers.length === 0) {
    console.log("ℹ️ No users found in localStorage array");
    return;
  }
  
  console.log(`📦 Found ${allUsers.length} users in localStorage`);
  
  // Import Firebase functions
  try {
    const { migrateUsersToFirebase } = await import('/lib/migrate-users-to-firebase.ts');
    const result = await migrateUsersToFirebase();
    
    console.log("\n📊 Migration Summary:");
    console.log(`✅ Successfully migrated: ${result.success} users`);
    console.log(`❌ Failed: ${result.failed} users`);
    
    if (result.errors.length > 0) {
      console.log("\n❌ Errors:");
      result.errors.forEach(err => {
        console.log(`  - ${err.email}: ${err.error}`);
      });
    }
    
    // Compare counts after migration
    const { compareUserCounts } = await import('/lib/migrate-users-to-firebase.ts');
    await compareUserCounts();
    
  } catch (error) {
    console.error("❌ Migration error:", error);
    console.log("\n💡 Make sure:");
    console.log("1. Your dev server is running");
    console.log("2. Firebase is configured in .env.local");
    console.log("3. You're on the app domain (not just a static file)");
  }
})();
```

## Step 3: Check Results

After running the script, you should see:
- How many users were found
- How many were successfully migrated
- Any errors that occurred
- A comparison of localStorage vs Firebase counts

## Alternative: Direct URL Access

If the `/migrate-users` route doesn't work, try:
- `http://localhost:3000/migrate-users` (if dev server is running)
- Or use the console script above (works from any page)

## Troubleshooting

If you get import errors:
1. Make sure your dev server is running (`npm run dev`)
2. Make sure you're accessing the app through the dev server, not opening HTML files directly
3. Check browser console for any Firebase configuration errors



