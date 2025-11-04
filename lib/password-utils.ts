/**
 * Password Security Utilities
 * Uses Web Crypto API for secure password hashing
 * 
 * Security Note: Client-side hashing provides basic protection against
 * casual inspection of localStorage, but for production apps, consider
 * implementing server-side authentication with proper password hashing.
 */

/**
 * Hash a password using Web Crypto API (PBKDF2)
 * @param password - Plain text password to hash
 * @returns Promise resolving to hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
  // Convert password to ArrayBuffer
  const encoder = new TextEncoder()
  const data = encoder.encode(password)

  // Generate a random salt
  const salt = crypto.getRandomValues(new Uint8Array(16))

  // Import key for PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    data,
    'PBKDF2',
    false,
    ['deriveBits']
  )

  // Derive bits using PBKDF2 (256 bits = 32 bytes)
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000, // High iteration count for security
      hash: 'SHA-256'
    },
    keyMaterial,
    256 // 256 bits = 32 bytes
  )

  // Convert salt and hash to base64 for storage
  const saltBase64 = btoa(String.fromCharCode(...salt))
  const hashBase64 = btoa(String.fromCharCode(...new Uint8Array(derivedBits)))
  
  // Return format: salt:hash (both base64 encoded)
  return `${saltBase64}:${hashBase64}`
}

/**
 * Verify a password against a stored hash
 * @param password - Plain text password to verify
 * @param hash - Stored hash in format "salt:hash"
 * @returns Promise resolving to true if password matches, false otherwise
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    // Split hash into salt and stored hash
    const [saltBase64, storedHashBase64] = hash.split(':')
    
    if (!saltBase64 || !storedHashBase64) {
      return false
    }

    // Decode salt and stored hash
    const salt = Uint8Array.from(atob(saltBase64), c => c.charCodeAt(0))
    const storedHash = Uint8Array.from(atob(storedHashBase64), c => c.charCodeAt(0))

    // Convert password to ArrayBuffer
    const encoder = new TextEncoder()
    const data = encoder.encode(password)

    // Import key for PBKDF2
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      data,
      'PBKDF2',
      false,
      ['deriveBits']
    )

    // Derive bits using same parameters
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256 // 256 bits = 32 bytes
    )

    const derivedHash = new Uint8Array(derivedBits)

    // Compare derived hash with stored hash (constant-time comparison)
    if (derivedHash.length !== storedHash.length) {
      return false
    }

    let isEqual = true
    for (let i = 0; i < derivedHash.length; i++) {
      if (derivedHash[i] !== storedHash[i]) {
        isEqual = false
      }
    }

    return isEqual
  } catch (error) {
    console.error('Error verifying password:', error)
    return false
  }
}

/**
 * Check if a hash is in the old format (plain text or needs migration)
 * @param hash - Hash string to check
 * @returns true if hash appears to be in old format
 */
export function isOldHashFormat(hash: string): boolean {
  // Old format doesn't have ':' separator or is too short
  return !hash.includes(':') || hash.length < 50
}

/**
 * Migrate existing plain text password to hashed format
 * This should be called during login for users with old password format
 * @param email - User email
 * @param plainPassword - Plain text password (user input)
 * @returns Promise resolving to hashed password
 */
export async function migratePassword(email: string, plainPassword: string): Promise<string> {
  // Hash the password using the new method
  return await hashPassword(plainPassword)
}

