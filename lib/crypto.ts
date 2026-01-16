/**
 * Password hashing and verification utilities
 * Uses bcrypt for secure password handling
 */

import bcrypt from "bcryptjs";

/**
 * Hash password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12); // 12 rounds for security
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain text password with hashed password
 * @param password - Plain text password to verify
 * @param hashedPassword - Hashed password from database
 * @returns True if passwords match
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
