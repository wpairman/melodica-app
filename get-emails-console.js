/**
 * Quick script to get all registered emails from localStorage
 * 
 * To use:
 * 1. Open your app in the browser (http://localhost:3000)
 * 2. Open browser console (F12 or Cmd+Option+I)
 * 3. Copy and paste this entire script
 * 4. Press Enter
 * 
 * Or save this file and run: node get-emails-console.js (if you have a way to access localStorage)
 */

// Get emails from localStorage
function getRegisteredEmails() {
  try {
    const allUsersStr = localStorage.getItem("allUsers");
    
    if (!allUsersStr) {
      console.log("❌ No users found in localStorage.");
      console.log("Make sure you are on the app domain and have registered users.");
      return [];
    }

    const allUsers = JSON.parse(allUsersStr);
    
    if (!Array.isArray(allUsers) || allUsers.length === 0) {
      console.log("❌ No users found in the allUsers array.");
      return [];
    }

    const emails = allUsers.map(user => ({
      email: user.email || 'N/A',
      name: user.name || 'N/A',
      emailVerified: user.emailVerified || false,
      createdAt: user.createdAt || 'N/A'
    }));

    console.log("\n" + "=".repeat(60));
    console.log(`📧 Found ${emails.length} registered user(s)`);
    console.log("=".repeat(60) + "\n");

    const verifiedCount = emails.filter(u => u.emailVerified).length;
    const unverifiedCount = emails.length - verifiedCount;

    console.log(`Total: ${emails.length}`);
    console.log(`Verified: ${verifiedCount}`);
    console.log(`Unverified: ${unverifiedCount}\n`);

    console.log("📋 Registered Emails:\n");
    emails.forEach((user, index) => {
      const verified = user.emailVerified ? "✅ Verified" : "⏳ Unverified";
      const name = user.name !== 'N/A' ? ` (${user.name})` : '';
      console.log(`${index + 1}. ${user.email}${name} - ${verified}`);
    });

    console.log("\n" + "=".repeat(60));
    console.log("\n📧 Email addresses only:\n");
    emails.forEach(user => console.log(user.email));

    console.log("\n" + "=".repeat(60));
    console.log("\n💾 To copy all emails:");
    const emailList = emails.map(u => u.email).join(", ");
    console.log("Copy this:", emailList);
    
    // Try to copy to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(emailList).then(() => {
        console.log("✅ Emails copied to clipboard!");
      }).catch(() => {
        console.log("⚠️ Could not copy to clipboard automatically");
      });
    }

    return emails;
  } catch (error) {
    console.error("❌ Error reading localStorage:", error);
    return [];
  }
}

// Run it
getRegisteredEmails();

