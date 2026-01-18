/**
 * Reusable Auth Helper
 * Import this in any server action that needs authentication
 */

import { auth } from "@/auth";
import type { ExtendedUser } from "@/types/auth.types";
import type { ApiResponse } from "@/types/data.types";

/**
 * Check if user is authenticated admin
 * Returns error response if not authenticated, null if OK
 *
 * @param requireAdmin - If true, requires admin role. If false, any authenticated user is OK
 * @returns ApiResponse error or null if authenticated
 */
/**
 * Check if user is authenticated admin
 * Returns error response if not authenticated, null if OK
 *
 * @param requireAdmin - If true, requires admin role. If false, any authenticated user is OK
 * @returns ApiResponse error or null if authenticated
 */
export async function requireAuth<T = unknown>(
  requireAdmin = true
): Promise<ApiResponse<T> | null> {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      message: "Unauthorized",
      error: "You must be logged in to perform this action",
    } as ApiResponse<T>;
  }

  if (requireAdmin) {
    const user = session.user as ExtendedUser;
    if (user.role !== "admin") {
      return {
        success: false,
        message: "Forbidden",
        error: "You do not have permission to perform this action",
      } as ApiResponse<T>;
    }
  }

  return null; // Auth passed
}
