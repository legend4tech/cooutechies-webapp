/**
 * Dashboard Statistics Server Actions
 * Aggregates data for the dashboard overview
 * Provides real-time metrics and activity feed with pagination
 */

"use server";

import { connectToDatabase } from "@/lib/db";
import { ActivityLog, DashboardStats } from "@/types/data.types";

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const { db } = await connectToDatabase();
    const now = new Date();

    // Calculate stats in parallel
    const [totalEvents, totalRegistrations, emailsLast7Days] =
      await Promise.all([
        db.collection("events").countDocuments({}),
        db.collection("registrations").countDocuments({}),
        db.collection("email_logs").countDocuments({
          sentAt: {
            $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          },
        }),
      ]);

    // Calculate upcoming events
    const upcomingEvents = await db.collection("events").countDocuments({
      date: { $gte: now },
    });

    return {
      totalEvents,
      upcomingEvents,
      totalRegistrations,
      emailsSentLast7Days: emailsLast7Days,
    };
  } catch (error) {
    console.error("[Dashboard] Stats fetch failed:", error);
    return {
      totalEvents: 0,
      upcomingEvents: 0,
      totalRegistrations: 0,
      emailsSentLast7Days: 0,
    };
  }
}

/**
 * Get activity log with pagination
 * @param page - Page number (1-indexed)
 * @param limit - Number of items per page
 */
export async function getActivityLog(page: number = 1, limit: number = 5) {
  try {
    const { db } = await connectToDatabase();
    const activitiesCollection = db.collection<ActivityLog>("activities");

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
    const serializedActivities = activities.map((activity) => ({
      _id: activity._id.toString(),
      action: activity.action,
      eventId: activity.eventId?.toString(),
      details: activity.details,
      createdAt: activity.createdAt.toISOString(),
    }));

    return {
      success: true,
      data: serializedActivities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("[Dashboard] Activity log fetch failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: [],
      total: 0,
      page: 1,
      limit,
      totalPages: 0,
    };
  }
}
