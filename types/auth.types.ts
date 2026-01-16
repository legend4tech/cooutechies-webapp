/**
 * Authentication Type Definitions
 * Properly typed for MongoDB and Auth.js v5 integration
 */

import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";
import type { ObjectId } from "mongodb";

/**
 * User document stored in MongoDB
 */
export interface AuthUser {
  _id?: ObjectId;
  email: string;
  password: string; // bcrypt hashed password
  role: "admin" | "user";
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

/**
 * JWT Token payload - extends Auth.js JWT type
 */
export interface AuthJWT extends JWT {
  userId: string;
  email: string;
  role: "admin" | "user";
}

/**
 * Extended User type for Auth.js
 */
export interface ExtendedUser extends User {
  id: string;
  email: string;
  role: "admin" | "user";
}

/**
 * Session object - properly extends Auth.js Session type
 */
export interface AuthSession extends Session {
  user: ExtendedUser;
  accessToken?: string;
  expiresAt?: number;
}

/**
 * Login request payload
 */
export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Register/Create account request payload
 */
export interface RegisterPayload {
  email: string;
  password: string;
  adminToken: string;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = void> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
