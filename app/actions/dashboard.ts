/**
 * Dashboard Statistics Server Actions
 * Aggregates data for the dashboard overview
 * Provides real-time metrics and activity feed with pagination
 */

"use server";

import { requireAuth } from "@/lib/auth-helper";
import { connectToDatabase } from "@/lib/db";
import {
  ActivityLog,
  DashboardStats,
  ApiResponse,
  ActivityLogPaginatedResponse,
  SerializedActivityLog,
} from "@/types/data.types";

// Collection names from environment
const EVENTS_COLLECTION = process.env.EVENTS_COLLECTION!;
const REGISTRATIONS_COLLECTION = process.env.REGISTRATIONS_COLLECTION!;
const EMAIL_LOGS_COLLECTION = process.env.EMAIL_LOGS_COLLECTION!;
const ACTIVITIES_COLLECTION = process.env.ACTIVITIES_COLLECTION!;

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<
  ApiResponse<DashboardStats>
> {
  const authError = await requireAuth<DashboardStats>();
  if (authError) return authError;

  try {
    const { db } = await connectToDatabase();
    const now = new Date();

    // Calculate stats in parallel
    const [totalEvents, totalRegistrations, emailsLast7Days] =
      await Promise.all([
        db.collection(EVENTS_COLLECTION).countDocuments({}),
        db.collection(REGISTRATIONS_COLLECTION).countDocuments({}),
        db.collection(EMAIL_LOGS_COLLECTION).countDocuments({
          sentAt: {
            $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          },
        }),
      ]);

    // Calculate upcoming events
    const upcomingEvents = await db
      .collection(EVENTS_COLLECTION)
      .countDocuments({
        date: { $gte: now },
      });

    return {
      success: true,
      message: "Dashboard stats fetched successfully",
      data: {
        totalEvents,
        upcomingEvents,
        totalRegistrations,
        emailsSentLast7Days: emailsLast7Days,
      },
    };
  } catch (error) {
    console.error("[Dashboard] Stats fetch failed:", error);
    return {
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get activity log with pagination
 * @param page - Page number (1-indexed)
 * @param limit - Number of items per page
 */
export async function getActivityLog(
  page: number = 1,
  limit: number = 5,
): Promise<ApiResponse<ActivityLogPaginatedResponse>> {
  const authError = await requireAuth<ActivityLogPaginatedResponse>();
  if (authError) return authError;

  try {
    const { db } = await connectToDatabase();
    const activitiesCollection = db.collection<ActivityLog>(
      ACTIVITIES_COLLECTION,
    );

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination metadata
    const total = await activitiesCollection.countDocuments({});

    // Fetch paginated activities
    const activities = await activitiesCollection
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Serialize MongoDB ObjectIds to strings for client components
    const serializedActivities: SerializedActivityLog[] = activities.map(
      (activity) => ({
        _id: activity._id.toString(),
        action: activity.action,
        eventId: activity.eventId?.toString(),
        memberId: activity.memberId?.toString(),
        details: activity.details,
        createdAt: activity.createdAt.toISOString(),
      }),
    );

    return {
      success: true,
      message: "Activity log fetched successfully",
      data: {
        activities: serializedActivities,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("[Dashboard] Activity log fetch failed:", error);
    return {
      success: false,
      message: "Failed to fetch activity log",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
