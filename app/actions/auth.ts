"use server";

import { signIn, signOut } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { hashPassword } from "@/lib/crypto";
import type {
  LoginPayload,
  RegisterPayload,
  ApiResponse,
} from "@/types/auth.types";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const ADMIN_COLLECTION = process.env.ADMIN_COLLECTION!;
const ACTIVITIES_COLLECTION = process.env.ACTIVITIES_COLLECTION!;

/**
 * Login Server Action
 * Authenticates admin user
 */
export async function loginAction(
  payload: LoginPayload,
): Promise<ApiResponse<{ redirectUrl: string }>> {
  try {
    await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirectTo: "/admin",
    });

    return {
      success: true,
      message: "Login successful",
      data: { redirectUrl: "/admin" },
    };
  } catch (error: unknown) {
    const err = error as { digest?: string };
    if (err.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }

    return {
      success: false,
      message: "Invalid email or password",
      error: "Invalid credentials",
    };
  }
}

/**
 * Register/Create Account Server Action
 * Creates new admin user
 */
export async function registerAction(
  payload: RegisterPayload,
): Promise<ApiResponse<{ userId: string }>> {
  try {
    if (payload.adminToken !== ADMIN_TOKEN) {
      return {
        success: false,
        message: "Invalid admin token",
        error: "Admin token verification failed",
      };
    }

    const { db } = await connectToDatabase();
    const adminCollection = db.collection(ADMIN_COLLECTION);

    const existingAdmin = await adminCollection.findOne({
      email: payload.email.toLowerCase(),
    });

    if (existingAdmin) {
      return {
        success: false,
        message: "Admin account already exists",
        error: "Email is already registered",
      };
    }

    const hashedPassword = await hashPassword(payload.password);

    const result = await adminCollection.insertOne({
      email: payload.email.toLowerCase(),
      password: hashedPassword,
      role: "admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Log activity
    const activitiesCollection = db.collection(ACTIVITIES_COLLECTION);
    await activitiesCollection.insertOne({
      action: "admin_registered",
      userId: result.insertedId,
      email: payload.email,
      createdAt: new Date(),
    });

    return {
      success: true,
      message: "Admin account created successfully",
      data: { userId: result.insertedId.toString() },
    };
  } catch (error) {
    return {
      success: false,
      message: "Registration failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Logout Server Action
 * Clears session and redirects to login
 */
export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
