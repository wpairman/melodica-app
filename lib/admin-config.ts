/**
 * Admin Configuration
 * 
 * ⚠️ IMPORTANT: Add admin email addresses here
 * Only emails in this list will have access to the admin dashboard
 * 
 * These emails must match exactly the emails used to log into the app
 */

export const ADMIN_EMAILS = [
  "will7ovo@gmail.com",
  "willp2000@icloud.com",
].map(email => email.toLowerCase().trim())

/**
 * Check if an email is an admin email
 */
export function isAdminEmail(email: string): boolean {
  if (!email) return false
  const normalizedEmail = email.toLowerCase().trim()
  return ADMIN_EMAILS.some(adminEmail => adminEmail === normalizedEmail)
}

