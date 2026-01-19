"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getCoreTeamMembers,
  getCoreTeamMemberById,
  createCoreTeamMember,
  updateCoreTeamMember,
  deleteCoreTeamMember,
} from "@/app/actions/core-team";
import type { CoreTeamFormData } from "@/lib/core-team-schema";
import type { CoreTeamMember } from "@/types/core-team.types";

// Query Keys
export const coreTeamKeys = {
  all: ["core-team"] as const,
  lists: () => [...coreTeamKeys.all, "list"] as const,
  list: () => [...coreTeamKeys.lists()] as const,
  details: () => [...coreTeamKeys.all, "detail"] as const,
  detail: (id: string) => [...coreTeamKeys.details(), id] as const,
};

// ============================================================================
// GET ALL CORE TEAM MEMBERS
// ============================================================================

export function useCoreTeamMembers() {
  return useQuery({
    queryKey: coreTeamKeys.list(),
    queryFn: async () => {
      const response = await getCoreTeamMembers();
      console.log(response);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch team members");
      }
      // Reverse the members array so newest appears first
      return {
        ...response.data,
        members: response.data.members.reverse(),
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// GET SINGLE CORE TEAM MEMBER
// ============================================================================

export function useCoreTeamMember(memberId: string) {
  return useQuery({
    queryKey: coreTeamKeys.detail(memberId),
    queryFn: async () => {
      const response = await getCoreTeamMemberById(memberId);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch team member");
      }
      return response.data;
    },
    enabled: !!memberId, // Only run if memberId exists
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// CREATE CORE TEAM MEMBER MUTATION
// ============================================================================

export function useCreateCoreTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CoreTeamFormData) => {
      const response = await createCoreTeamMember(data);
      if (!response.success) {
        throw new Error(response.error || "Failed to create team member");
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch the team members list
      queryClient.invalidateQueries({ queryKey: coreTeamKeys.list() });
      toast.success("Team member added successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add team member");
    },
  });
}

// ============================================================================
// UPDATE CORE TEAM MEMBER MUTATION
// ============================================================================

export function useUpdateCoreTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      data,
    }: {
      memberId: string;
      data: Partial<CoreTeamFormData>;
    }) => {
      const response = await updateCoreTeamMember(memberId, data);
      if (!response.success) {
        throw new Error(response.error || "Failed to update team member");
      }
      return response;
    },
    onSuccess: (_, variables) => {
      // Invalidate both the list and the specific member detail
      queryClient.invalidateQueries({ queryKey: coreTeamKeys.list() });
      queryClient.invalidateQueries({
        queryKey: coreTeamKeys.detail(variables.memberId),
      });
      toast.success("Team member updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update team member");
    },
  });
}

// ============================================================================
// DELETE CORE TEAM MEMBER MUTATION
// ============================================================================

export function useDeleteCoreTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const response = await deleteCoreTeamMember(memberId);
      if (!response.success) {
        throw new Error(response.error || "Failed to delete team member");
      }
      return response;
    },
    onMutate: async (memberId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: coreTeamKeys.list() });

      // Snapshot previous value
      const previousMembers = queryClient.getQueryData(coreTeamKeys.list());

      // Optimistically update to remove the member
      queryClient.setQueryData(
        coreTeamKeys.list(),
        (old: { members: CoreTeamMember[]; total: number } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            members: old.members.filter(
              (m: CoreTeamMember) => m._id.toString() !== memberId,
            ),
            total: old.total - 1,
          };
        },
      );

      return { previousMembers };
    },
    onError: (error: Error, _, context) => {
      // Rollback on error
      if (context?.previousMembers) {
        queryClient.setQueryData(coreTeamKeys.list(), context.previousMembers);
      }
      toast.error(error.message || "Failed to delete team member");
    },
    onSuccess: () => {
      toast.success("Team member deleted successfully!");
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: coreTeamKeys.list() });
    },
  });
}

// ============================================================================
// OPTIMISTIC UPDATE HOOK (Advanced)
// ============================================================================

export function useOptimisticUpdateCoreTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      data,
    }: {
      memberId: string;
      data: Partial<CoreTeamFormData>;
    }) => {
      const response = await updateCoreTeamMember(memberId, data);
      if (!response.success) {
        throw new Error(response.error || "Failed to update team member");
      }
      return response;
    },
    onMutate: async ({ memberId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: coreTeamKeys.detail(memberId),
      });

      // Snapshot previous value
      const previousMember = queryClient.getQueryData(
        coreTeamKeys.detail(memberId),
      );

      // Optimistically update
      queryClient.setQueryData(
        coreTeamKeys.detail(memberId),
        (old: CoreTeamMember | undefined) => {
          if (!old) return old;
          return {
            ...old,
            ...data,
            updatedAt: new Date(),
          };
        },
      );

      return { previousMember, memberId };
    },
    onError: (error: Error, _, context) => {
      // Rollback on error
      if (context?.previousMember) {
        queryClient.setQueryData(
          coreTeamKeys.detail(context.memberId),
          context.previousMember,
        );
      }
      toast.error(error.message || "Failed to update team member");
    },
    onSuccess: (_, variables) => {
      toast.success("Team member updated successfully!");
    },
    onSettled: (_, __, variables) => {
      // Refetch to ensure we have the latest data
      queryClient.invalidateQueries({
        queryKey: coreTeamKeys.detail(variables.memberId),
      });
      queryClient.invalidateQueries({ queryKey: coreTeamKeys.list() });
    },
  });
}
