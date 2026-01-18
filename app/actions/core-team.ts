/**
 * Core Team Server Actions
 * Handles CRUD operations for core team members
 * Images are uploaded in parallel before database insertion
 */

"use server";

import type { ApiResponse } from "@/types/data.types";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";
import { CoreTeamFormData, coreTeamFormSchema } from "@/lib/core-team-schema";
import { CoreTeamMember, CoreTeamMemberDB } from "@/types/core-team.types";
import { requireAuth } from "@/lib/auth-helper";

// Collection names from environment
const CORE_TEAM_COLLECTION = process.env.CORE_TEAM_COLLECTION!;
const ACTIVITIES_COLLECTION = process.env.ACTIVITIES_COLLECTION!;

/**
 * Helper function to serialize MongoDB documents for client components
 * Converts ObjectId and Date objects to strings
 */
function serializeMember(member: CoreTeamMemberDB): CoreTeamMember {
  return {
    _id: member._id.toString(),
    name: member.name,
    role: member.role,
    about: member.about,
    profileImage: member.profileImage,
    socialLinks: member.socialLinks || {},
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString(),
  };
}

/**
 * Create a new core team member
 * @param formData - Core team member form data with image
 * @returns API response with created member ID
 */
export async function createCoreTeamMember(
  formData: CoreTeamFormData,
): Promise<ApiResponse<{ memberId: string }>> {
  const authError = await requireAuth<{ memberId: string }>();
  if (authError) return authError;

  try {
    // Validate form data
    const validatedData = coreTeamFormSchema.parse(formData);

    // Clean up empty social links
    const socialLinks = {
      ...(validatedData.socialLinks.github && {
        github: validatedData.socialLinks.github,
      }),
      ...(validatedData.socialLinks.twitter && {
        twitter: validatedData.socialLinks.twitter,
      }),
      ...(validatedData.socialLinks.linkedin && {
        linkedin: validatedData.socialLinks.linkedin,
      }),
    };

    // Create member document
    const member: CoreTeamMemberDB = {
      _id: new ObjectId(),
      name: validatedData.name,
      role: validatedData.role,
      about: validatedData.about,
      profileImage: validatedData.profileImage,
      socialLinks,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { db } = await connectToDatabase();
    const coreTeamCollection =
      db.collection<CoreTeamMemberDB>(CORE_TEAM_COLLECTION);
    const result = await coreTeamCollection.insertOne(member);

    // Log activity for audit trail
    const activitiesCollection = db.collection(ACTIVITIES_COLLECTION);
    await activitiesCollection.insertOne({
      action: "core_team_member_created",
      memberId: result.insertedId,
      details: `Core team member "${validatedData.name}" created as ${validatedData.role}`,
      createdAt: new Date(),
    });

    return {
      success: true,
      message: "Core team member created successfully",
      data: { memberId: result.insertedId.toString() },
    };
  } catch (error) {
    console.error("[Core Team] Create failed:", error);
    return {
      success: false,
      message: "Failed to create core team member",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all core team members
 * @returns List of all core team members (serialized for client)
 */
export async function getCoreTeamMembers(): Promise<
  ApiResponse<{
    members: CoreTeamMember[];
    total: number;
  }>
> {
  try {
    const { db } = await connectToDatabase();
    const coreTeamCollection =
      db.collection<CoreTeamMemberDB>(CORE_TEAM_COLLECTION);
    const membersDB = await coreTeamCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Serialize members for client components
    const members = membersDB.map(serializeMember);

    return {
      success: true,
      message: "Successfully Fetched CoreTeam Members",

      data: {
        members,

        total: members.length,
      },
    };
  } catch (error) {
    console.error("[Core Team] Get all failed:", error);
    return {
      success: false,
      message: "Error Getting All core team",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get core team member by ID
 * @param memberId - MongoDB ObjectId as string
 * @returns Core team member details (serialized for client)
 */
export async function getCoreTeamMemberById(
  memberId: string,
): Promise<ApiResponse<CoreTeamMember>> {
  try {
    if (!ObjectId.isValid(memberId)) {
      return {
        success: false,
        message: "Error Getting  core team by id",

        error: "Invalid member ID",
      };
    }

    const { db } = await connectToDatabase();
    const coreTeamCollection =
      db.collection<CoreTeamMemberDB>(CORE_TEAM_COLLECTION);
    const memberDB = await coreTeamCollection.findOne({
      _id: new ObjectId(memberId),
    });

    if (!memberDB) {
      return {
        success: false,
        message: "Error Getting  core team by id",

        error: "Member not found",
      };
    }

    // Serialize member for client component
    const member = serializeMember(memberDB);

    return {
      success: true,
      message: "Data fetched successfully",

      data: member,
    };
  } catch (error) {
    console.error("[Core Team] Get by ID failed:", error);
    return {
      success: false,
      message: "Error Getting core team by id",

      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update core team member
 * @param memberId - MongoDB ObjectId as string
 * @param formData - Partial form data for updates
 * @returns API response with update status
 */
export async function updateCoreTeamMember(
  memberId: string,
  formData: Partial<CoreTeamFormData>,
): Promise<ApiResponse> {
  try {
    if (!ObjectId.isValid(memberId)) {
      return {
        success: false,
        message: "Invalid member ID",
      };
    }

    // Validate form data (partial)
    const validatedData = coreTeamFormSchema.partial().parse(formData);

    const updateData: Partial<CoreTeamMemberDB> = {};

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.role !== undefined) updateData.role = validatedData.role;
    if (validatedData.about !== undefined)
      updateData.about = validatedData.about;
    if (validatedData.profileImage !== undefined)
      updateData.profileImage = validatedData.profileImage;

    if (validatedData.socialLinks !== undefined) {
      const socialLinks = {
        ...(validatedData.socialLinks.github && {
          github: validatedData.socialLinks.github,
        }),
        ...(validatedData.socialLinks.twitter && {
          twitter: validatedData.socialLinks.twitter,
        }),
        ...(validatedData.socialLinks.linkedin && {
          linkedin: validatedData.socialLinks.linkedin,
        }),
      };
      updateData.socialLinks = socialLinks;
    }

    updateData.updatedAt = new Date();

    const { db } = await connectToDatabase();
    const coreTeamCollection =
      db.collection<CoreTeamMemberDB>(CORE_TEAM_COLLECTION);
    const result = await coreTeamCollection.updateOne(
      { _id: new ObjectId(memberId) },
      { $set: updateData },
    );

    if (result.matchedCount === 0) {
      return {
        success: false,
        message: "Core team member not found",
      };
    }

    // Log activity for audit trail
    const activitiesCollection = db.collection(ACTIVITIES_COLLECTION);
    await activitiesCollection.insertOne({
      action: "core_team_member_updated",
      memberId: new ObjectId(memberId),
      details: `Core team member "${validatedData.name || "Unknown"}" updated`,
      createdAt: new Date(),
    });

    return {
      success: true,
      message: "Core team member updated successfully",
    };
  } catch (error) {
    console.error("[Core Team] Update failed:", error);
    return {
      success: false,
      message: "Failed to update core team member",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete core team member
 * @param memberId - MongoDB ObjectId as string
 * @returns API response with deletion status
 */
export async function deleteCoreTeamMember(
  memberId: string,
): Promise<ApiResponse> {
  try {
    if (!ObjectId.isValid(memberId)) {
      return {
        success: false,
        message: "Invalid member ID",
      };
    }

    const { db } = await connectToDatabase();
    const coreTeamCollection =
      db.collection<CoreTeamMemberDB>(CORE_TEAM_COLLECTION);

    // Fetch member for audit trail details
    const member = await coreTeamCollection.findOne({
      _id: new ObjectId(memberId),
    });

    const result = await coreTeamCollection.deleteOne({
      _id: new ObjectId(memberId),
    });

    if (result.deletedCount === 0) {
      return {
        success: false,
        message: "Core team member not found",
      };
    }

    // Log activity for audit trail
    const activitiesCollection = db.collection(ACTIVITIES_COLLECTION);
    await activitiesCollection.insertOne({
      action: "core_team_member_deleted",
      memberId: new ObjectId(memberId),
      details: `Core team member "${member?.name || "Unknown"}" deleted`,
      createdAt: new Date(),
    });

    return {
      success: true,
      message: "Core team member deleted successfully",
    };
  } catch (error) {
    console.error("[Core Team] Delete failed:", error);
    return {
      success: false,
      message: "Failed to delete core team member",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
