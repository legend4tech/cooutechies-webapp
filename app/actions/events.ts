/**
 * Event Server Actions (Updated with Serialization)
 * All return types properly serialized for client consumption
 */

"use server";

import type { Event } from "@/types/event.types";
import type { EventFormData } from "@/lib/validations";
import type { ApiResponse } from "@/types/data.types";
import type {
  SerializedEventDetailResponse,
  PaginatedEventsResponse,
} from "@/types/serialized.types";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";

/**
 * Create a new event with uploaded images
 */
export async function createEvent(
  formData: EventFormData
): Promise<ApiResponse<{ eventId: string }>> {
  try {
    const { db } = await connectToDatabase();
    const eventsCollection = db.collection<Event>("events");

    const event: Event = {
      _id: new ObjectId(),
      title: formData.title,
      description: formData.description,
      date: new Date(formData.date),
      location: formData.location,
      coverImage: formData.coverImage,
      duration: formData.duration,
      speakers: (formData.speakers || []).map((speaker) => ({
        name: speaker.name,
        role: speaker.role,
        photo: speaker.photo ?? undefined,
      })),
      maxAttendees: formData.maxAttendees ?? undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      announcementSent: false,
    };

    const result = await eventsCollection.insertOne(event);

    const activitiesCollection = db.collection("activities");
    await activitiesCollection.insertOne({
      action: "event_created",
      eventId: result.insertedId,
      details: `Event "${formData.title}" created`,
      createdAt: new Date(),
    });

    return {
      success: true,
      message: "Event created successfully",
      data: { eventId: result.insertedId.toString() },
    };
  } catch (error) {
    console.error("[Events] Create failed:", error);
    return {
      success: false,
      message: "Failed to create event",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all events with pagination and registration counts
 * Returns serialized data safe for client components
 */
export async function getEvents(
  page = 1,
  limit = 10
): Promise<ApiResponse<PaginatedEventsResponse>> {
  try {
    const { db } = await connectToDatabase();
    const eventsCollection = db.collection<Event>("events");

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      eventsCollection
        .find({})
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      eventsCollection.countDocuments({}),
    ]);

    const registrationsCollection = db.collection("eventRegistrations");

    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const registrationCount = await registrationsCollection.countDocuments({
          eventId: event._id,
        });

        // Serialize the event
        return {
          _id: event._id.toString(),
          title: event.title,
          description: event.description,
          date: event.date.toISOString(),
          location: event.location,
          coverImage: event.coverImage,
          duration: event.duration,
          speakers: event.speakers,
          maxAttendees: event.maxAttendees,
          createdAt: event.createdAt.toISOString(),
          updatedAt: event.updatedAt.toISOString(),
          announcementSent: event.announcementSent,
          announcementSentAt: event.announcementSentAt?.toISOString(),
          registrationCount,
        };
      })
    );

    return {
      success: true,
      message: "Events fetched successfully",

      data: {
        events: eventsWithCounts,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("[Events] Get failed:", error);
    return {
      success: false,
      message: "Ecountered error Fetching Events ",

      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get event details by ID with registrations and reminders
 * Returns fully serialized data safe for client components
 */
export async function getEventById(
  eventId: string
): Promise<ApiResponse<SerializedEventDetailResponse>> {
  try {
    if (!ObjectId.isValid(eventId)) {
      return {
        success: false,
        message: "  Invalid event ID",

        error: "Invalid event ID",
      };
    }

    const { db } = await connectToDatabase();
    const eventsCollection = db.collection<Event>("events");

    const event = await eventsCollection.findOne({
      _id: new ObjectId(eventId),
    });

    if (!event) {
      return {
        success: false,
        message: "Ecountered error Fetching Events ",

        error: "Event not found",
      };
    }

    const registrationsCollection = db.collection("eventRegistrations");
    const remindersCollection = db.collection("email_reminders");

    const [registrations, reminders] = await Promise.all([
      registrationsCollection.find({ eventId: event._id }).toArray(),
      remindersCollection.find({ eventId: event._id }).toArray(),
    ]);

    // Serialize all data
    const serializedEvent = {
      _id: event._id.toString(),
      title: event.title,
      description: event.description,
      date: event.date.toISOString(),
      location: event.location,
      coverImage: event.coverImage,
      duration: event.duration,
      speakers: event.speakers,
      maxAttendees: event.maxAttendees,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      announcementSent: event.announcementSent,
      announcementSentAt: event.announcementSentAt?.toISOString(),
    };

    const serializedRegistrations = registrations.map((reg) => ({
      _id: reg._id.toString(),
      firstName: reg.firstName,
      lastName: reg.lastName,
      email: reg.email,
      eventId: reg.eventId.toString(),
      registeredAt: reg.registeredAt.toISOString(),
      status: reg.status,
    }));

    const serializedReminders = reminders.map((reminder) => ({
      _id: reminder._id.toString(),
      eventId: reminder.eventId?.toString(),
      emailType: reminder.emailType,
      trigger: reminder.trigger,
      recipientCount: reminder.recipientCount,
      sentAt: reminder.sentAt.toISOString(),
      subject: reminder.subject,
      resendId: reminder.resendId,
      timeFrame: reminder.timeFrame,
    }));

    return {
      success: true,
      message: "Events fetched successfully",

      data: {
        event: serializedEvent,
        registrations: serializedRegistrations,
        reminders: serializedReminders,
        registrationCount: registrations.length,
      },
    };
  } catch (error) {
    console.error("[Events] Get by ID failed:", error);
    return {
      success: false,
      message: "Ecountered error Fetching Events ",

      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update event with optional image uploads
 */
export async function updateEvent(
  eventId: string,
  formData: Partial<EventFormData>
): Promise<ApiResponse> {
  try {
    if (!ObjectId.isValid(eventId)) {
      return {
        success: false,
        message: "Invalid event ID",
      };
    }

    const updateData: Partial<Event> = {};

    if (formData.title !== undefined) updateData.title = formData.title;
    if (formData.description !== undefined)
      updateData.description = formData.description;
    if (formData.location !== undefined)
      updateData.location = formData.location;
    if (formData.coverImage !== undefined)
      updateData.coverImage = formData.coverImage;
    if (formData.duration !== undefined)
      updateData.duration = formData.duration;
    if (formData.speakers !== undefined) {
      updateData.speakers = formData.speakers.map((speaker) => ({
        name: speaker.name,
        role: speaker.role,
        bio: speaker.bio || undefined, // Convert empty string to undefined
        photo: speaker.photo || undefined, // Convert null/empty to undefined
      }));
    }
    // ✅ FIX: Convert null to undefined for maxAttendees
    if (formData.maxAttendees !== undefined) {
      updateData.maxAttendees = formData.maxAttendees ?? undefined;
    }
    if (formData.date !== undefined) updateData.date = new Date(formData.date);

    updateData.updatedAt = new Date();

    const { db } = await connectToDatabase();
    const eventsCollection = db.collection<Event>("events");

    const result = await eventsCollection.updateOne(
      { _id: new ObjectId(eventId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return {
        success: false,
        message: "Event not found",
      };
    }

    return {
      success: true,
      message: "Event updated successfully",
    };
  } catch (error) {
    console.error("[Events] Update failed:", error);
    return {
      success: false,
      message: "Failed to update event",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
/**
 * Delete event and all related data
 */
export async function deleteEvent(eventId: string): Promise<ApiResponse> {
  try {
    if (!ObjectId.isValid(eventId)) {
      return {
        success: false,
        message: "Invalid event ID",
      };
    }

    const { db } = await connectToDatabase();
    const eventsCollection = db.collection<Event>("events");

    const result = await eventsCollection.deleteOne({
      _id: new ObjectId(eventId),
    });

    if (result.deletedCount === 0) {
      return {
        success: false,
        message: "Event not found",
      };
    }

    await Promise.all([
      db
        .collection("eventRegistrations")
        .deleteMany({ eventId: new ObjectId(eventId) }),
      db
        .collection("email_reminders")
        .deleteMany({ eventId: new ObjectId(eventId) }),
      db
        .collection("email_logs")
        .deleteMany({ eventId: new ObjectId(eventId) }),
    ]);

    return {
      success: true,
      message: "Event deleted successfully",
    };
  } catch (error) {
    console.error("[Events] Delete failed:", error);
    return {
      success: false,
      message: "Failed to delete event",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
