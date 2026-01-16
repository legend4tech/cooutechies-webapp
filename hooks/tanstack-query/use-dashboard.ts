/**
 * Dashboard TanStack Query Hooks
 * Manages server state for dashboard statistics and activity logs
 * Provides optimized caching and real-time data fetching
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardStats, getActivityLog } from "@/app/actions/dashboard";
import type { DashboardStats } from "@/types/data.types";

// Serialized ActivityLog type for client-side use
export interface SerializedActivityLog {
  _id: string;
  action: string;
  eventId?: string;
  memberId?: string;
  details: string;
  createdAt: string;
}

// ============================================================================
// QUERY KEYS
// ============================================================================

export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
  activities: () => [...dashboardKeys.all, "activities"] as const,
  activityList: (page: number, limit: number) =>
    [...dashboardKeys.activities(), { page, limit }] as const,
};

// ============================================================================
// GET DASHBOARD STATISTICS
// ============================================================================

/**
 * Hook to fetch dashboard statistics
 * Automatically refetches every 30 seconds for real-time data
 */
export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: dashboardKeys.stats(),
    queryFn: async () => {
      const stats = await getDashboardStats();
      return stats;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
    refetchOnWindowFocus: true,
  });
}

// ============================================================================
// GET ACTIVITY LOG WITH PAGINATION
// ============================================================================

interface ActivityLogResponse {
  activities: SerializedActivityLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Hook to fetch activity log with pagination support
 * @param page - Current page number (1-indexed)
 * @param limit - Number of activities per page
 */
export function useActivityLog(page: number = 1, limit: number = 5) {
  return useQuery<ActivityLogResponse>({
    queryKey: dashboardKeys.activityList(page, limit),
    queryFn: async () => {
      const response = await getActivityLog(page, limit);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch activity log");
      }

      return {
        activities: response.data || [],
        total: response.total || 0,
        page: response.page || 1,
        limit: response.limit || limit,
        totalPages: response.totalPages || 1,
      };
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });
}
