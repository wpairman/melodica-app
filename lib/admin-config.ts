/**
 * Admin Configuration
 * 
 * ⚠️ IMPORTANT: Replace "your-email@example.com" with YOUR actual email address
 * Only this email will have access to the admin dashboard
 * 
 * This email must match exactly the email you use to log into the app
 */

export const ADMIN_EMAIL = "will7ovo@gmail.com"

export const ADMIN_EMAILS = [ADMIN_EMAIL.toLowerCase().trim()]

/**
 * Check if an email is an admin email
 */
export function isAdminEmail(email: string): boolean {
  if (!email) return false
  const normalizedEmail = email.toLowerCase().trim()
  return ADMIN_EMAILS.some(adminEmail => adminEmail === normalizedEmail)
}

