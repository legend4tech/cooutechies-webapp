/**
 * Auth Form Validation Schemas
 * Using Zod for client-side and type-safe validation
 */

import { z } from "zod";

/**
 * Login Schema
 * Validates email and password for authentication
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

/**
 * Create Account Schema
 * Validates email, password, and admin token for registration
 */
export const createAccountSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must not exceed 100 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  adminToken: z
    .string()
    .min(1, "Admin token is required")
    .min(10, "Admin token must be at least 10 characters"),
});

// Export types inferred from schemas
export type LoginFormValues = z.infer<typeof loginSchema>;
export type CreateAccountFormValues = z.infer<typeof createAccountSchema>;
