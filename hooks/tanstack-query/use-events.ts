/**
 * Events TanStack Query Hooks
 * Manages server state for events list with proper serialization
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEvents, deleteEvent } from "@/app/actions/events";
import type { PaginatedEventsResponse } from "@/types/serialized.types";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const eventsKeys = {
  all: ["events"] as const,
  lists: () => [...eventsKeys.all, "list"] as const,
  list: (page: number, limit: number) =>
    [...eventsKeys.lists(), { page, limit }] as const,
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Fetch paginated events list with registration counts
 */
export function useEvents(page: number = 1, limit: number = 50) {
  return useQuery({
    queryKey: eventsKeys.list(page, limit),
    queryFn: async (): Promise<PaginatedEventsResponse> => {
      const result = await getEvents(page, limit);

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch events");
      }

      return result.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Delete event mutation with cache invalidation
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const result = await deleteEvent(eventId);

      if (!result.success) {
        throw new Error(result.error || result.message);
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate all events queries to refetch
      queryClient.invalidateQueries({
        queryKey: eventsKeys.lists(),
      });
    },
  });
}
