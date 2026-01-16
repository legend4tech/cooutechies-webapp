/**
 * Event Details TanStack Query Hooks
 * Manages server state for event details, registrations, and email actions
 * Handles serialization for client-side data consumption
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEventById } from "@/app/actions/events";
import { getCommunityRegistrations } from "@/app/actions/registrations";
import {
  getRemindersSentStatus,
  sendEventAnnouncement,
  sendEventReminder,
} from "@/app/actions/emails";
import type {
  SerializedEvent,
  SerializedEventRegistration,
  SerializedEventDetailResponse,
} from "@/types/serialized.types";

type TimeFrame = "1-week" | "3-days" | "tomorrow" | "today";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const eventDetailsKeys = {
  all: ["event-details"] as const,
  detail: (id: string) => [...eventDetailsKeys.all, id] as const,
  registrations: (id: string, page: number, limit: number) =>
    [...eventDetailsKeys.detail(id), "registrations", { page, limit }] as const,
  communityEmails: () => ["community-emails"] as const,
  reminderStatus: (id: string) =>
    [...eventDetailsKeys.detail(id), "reminder-status"] as const,
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Fetch event details with automatic serialization
 */
export function useEventDetails(eventId: string) {
  return useQuery({
    queryKey: eventDetailsKeys.detail(eventId),
    queryFn: async () => {
      const result = await getEventById(eventId);
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch event");
      }

      // Data is already serialized from server action
      return {
        event: result.data.event,
        registrationCount: result.data.registrationCount,
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

interface ActivityLogResponse {
  registrations: SerializedEventRegistration[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Fetch event registrations with pagination
 */
export function useEventRegistrations(
  eventId: string,
  page: number = 1,
  limit: number = 10
) {
  return useQuery({
    queryKey: eventDetailsKeys.registrations(eventId, page, limit),
    queryFn: async () => {
      const result = await getEventById(eventId);
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch registrations");
      }

      // Data is already serialized from server action
      const allRegistrations = result.data.registrations;
      const total = allRegistrations.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedRegistrations = allRegistrations.slice(
        startIndex,
        endIndex
      );

      return {
        registrations: paginatedRegistrations,
        total,
        page,
        limit,
        totalPages,
      };
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}

/**
 * Fetch all community emails for announcements
 */
export function useCommunityEmails() {
  return useQuery({
    queryKey: eventDetailsKeys.communityEmails(),
    queryFn: async () => {
      const result = await getCommunityRegistrations(1, 0);
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch community emails");
      }
      if ("registrations" in result.data) {
        return result.data.registrations.map((reg) => reg.email);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch reminder sent status for all timeframes
 */
export function useReminderStatus(eventId: string) {
  return useQuery({
    queryKey: eventDetailsKeys.reminderStatus(eventId),
    queryFn: async () => {
      const result = await getRemindersSentStatus(eventId);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch reminder status");
      }
      return (
        result.data || {
          "1-week": false,
          "3-days": false,
          tomorrow: false,
          today: false,
        }
      );
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Send event announcement mutation
 */
export function useSendAnnouncement(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData: {
      title: string;
      description: string;
      date: string;
      location: string;
      thumbnail?: string;
    }) => {
      return await sendEventAnnouncement(eventId, eventData);
    },
    onSuccess: () => {
      // Invalidate event details to reflect announcement status change
      queryClient.invalidateQueries({
        queryKey: eventDetailsKeys.detail(eventId),
      });
    },
  });
}

/**
 * Send event reminder mutation
 */
export function useSendReminder(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recipients,
      eventData,
      timeFrame,
    }: {
      recipients: Array<{ email: string; name: string }>;
      eventData: { title: string; date: string; location: string };
      timeFrame: TimeFrame;
    }) => {
      return await sendEventReminder(eventId, recipients, eventData, timeFrame);
    },
    onSuccess: () => {
      // Invalidate reminder status to show updated sent state
      queryClient.invalidateQueries({
        queryKey: eventDetailsKeys.reminderStatus(eventId),
      });
    },
  });
}
