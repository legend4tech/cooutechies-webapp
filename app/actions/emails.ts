"use server";

import { Resend } from "resend";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";
import EventAnnouncementEmail from "@/components/email-templates/event-announcement-email";
import EventReminderEmail from "@/components/email-templates/event-reminder-email";
import CustomBroadcastEmail from "@/components/email-templates/custom-broadcast-email";
import { requireAuth } from "@/lib/auth-helper";

// Collection names from environment
const EVENTS_COLLECTION = process.env.EVENTS_COLLECTION!;
const REGISTRATIONS_COLLECTION = process.env.REGISTRATIONS_COLLECTION!;
const EMAIL_LOGS_COLLECTION = process.env.EMAIL_LOGS_COLLECTION!;
const ACTIVITIES_COLLECTION = process.env.ACTIVITIES_COLLECTION!;

// ============================================
// TYPE DEFINITIONS
// ============================================

type TimeFrame = "1-week" | "3-days" | "tomorrow" | "today";

interface ReminderRecipient {
  email: string;
  name: string;
}

interface EmailResponse {
  success: boolean;
  message: string;
  error?: string;
}

interface RegistrationDocument {
  _id: ObjectId;
  email: string;
  status: string;
  [key: string]: unknown;
}

interface EmailLogDocument {
  _id: ObjectId;
  eventId?: ObjectId;
  emailType: string;
  trigger: string;
  recipientCount: number;
  sentAt: Date;
  subject: string;
  resendId?: string;
  timeFrame?: TimeFrame;
  htmlContentLength?: number;
  [key: string]: unknown;
}

interface ActivityLogDocument {
  _id: ObjectId;
  action: string;
  eventId?: ObjectId;
  details: string;
  createdAt: Date;
  [key: string]: unknown;
}

interface EventDocument {
  _id: ObjectId;
  announcementSent?: boolean;
  announcementSentAt?: Date;
  [key: string]: unknown;
}

// ============================================
// INITIALIZATION
// ============================================

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL as string;

// ============================================
// ANNOUNCEMENT EMAIL SYSTEM
// For notifying all community members about events
// ============================================

/**
 * Send event announcement to all registered community members
 * Fetches recipients from registrations collection
 * Sets announcementSent = true after successful send
 */
export async function sendEventAnnouncement(
  eventId: string,
  eventData: {
    title: string;
    description: string;
    date: string;
    location: string;
    thumbnail?: string;
  },
): Promise<EmailResponse> {
  const authError = await requireAuth<never>();
  if (authError) {
    return {
      success: false,
      message: authError.message,
      error: authError.error,
    };
  }

  try {
    // Validate API key is configured
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    // Connect to database
    const { db } = await connectToDatabase();

    // Fetch all registered community members
    const registrationsCollection = db.collection(REGISTRATIONS_COLLECTION);
    const registrations = (await registrationsCollection
      .find({ status: "registered" })
      .toArray()) as RegistrationDocument[];

    if (!registrations || registrations.length === 0) {
      return {
        success: false,
        message: "No registered community members found",
      };
    }

    // Extract and validate email addresses
    const recipientEmails = registrations
      .map((reg) => reg.email)
      .filter(
        (email): email is string =>
          typeof email === "string" && email.length > 0,
      );

    if (recipientEmails.length === 0) {
      return {
        success: false,
        message: "No valid email addresses found in registrations",
      };
    }

    // Build registration link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const registrationLink = `${baseUrl}/events/${eventId}`;

    // Send announcement email to all recipients
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmails,
      subject: `🎉 New Event: ${eventData.title}`,
      react: EventAnnouncementEmail({
        eventTitle: eventData.title,
        eventDescription: eventData.description,
        eventDate: eventData.date,
        eventLocation: eventData.location,
        eventImage: eventData.thumbnail,
        registrationLink,
      }),
    });

    if (response.error) {
      throw new Error(`Resend API error: ${response.error.message}`);
    }

    // Update event document - mark announcement as sent
    const eventsCollection = db.collection(EVENTS_COLLECTION);
    await eventsCollection.updateOne(
      { _id: new ObjectId(eventId) },
      { $set: { announcementSent: true, announcementSentAt: new Date() } },
    );

    // Log email send in database
    const emailLogsCollection = db.collection(EMAIL_LOGS_COLLECTION);
    await emailLogsCollection.insertOne({
      eventId: new ObjectId(eventId),
      emailType: "announcement",
      trigger: "manual",
      recipientCount: recipientEmails.length,
      sentAt: new Date(),
      subject: `New Event: ${eventData.title}`,
      resendId: response.data?.id,
    } as EmailLogDocument);

    // Record activity for audit trail
    const activitiesCollection = db.collection(ACTIVITIES_COLLECTION);
    await activitiesCollection.insertOne({
      action: "event_announcement_sent",
      eventId: new ObjectId(eventId),
      details: `Event announcement sent to ${recipientEmails.length} community members`,
      createdAt: new Date(),
    } as ActivityLogDocument);

    return {
      success: true,
      message: `Announcement sent to ${recipientEmails.length} community members`,
    };
  } catch (error) {
    console.error("[Email] Announcement send failed:", error);
    return {
      success: false,
      message: "Failed to send announcement",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================
// REMINDER EMAIL SYSTEM
// For notifying registered event attendees
// ============================================

/**
 * Send event reminder to registered attendees
 * Manually triggered from admin dashboard
 * Time-aware messaging based on timeFrame parameter
 */
export async function sendEventReminder(
  eventId: string,
  recipients: ReminderRecipient[],
  eventData: {
    title: string;
    date: string;
    location: string;
  },
  timeFrame: TimeFrame,
): Promise<EmailResponse> {
  const authError = await requireAuth<never>();
  if (authError) {
    return {
      success: false,
      message: authError.message,
      error: authError.error,
    };
  }

  try {
    // Validate API key is configured
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    // Connect to database
    const { db } = await connectToDatabase();
    const emailLogsCollection = db.collection(EMAIL_LOGS_COLLECTION);

    // Check if reminder for this timeFrame was already sent to prevent duplicates
    const existingReminder = (await emailLogsCollection.findOne({
      eventId: new ObjectId(eventId),
      emailType: "reminder",
      timeFrame: timeFrame,
    })) as EmailLogDocument | null;

    if (existingReminder) {
      return {
        success: false,
        message: `Reminder for "${timeFrame}" already sent to this event`,
      };
    }

    // Build event link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const eventLink = `${baseUrl}/events/${eventId}`;

    // Send individual reminder emails to each recipient
    const emailPromises = recipients.map((recipient) =>
      resend.emails.send({
        from: FROM_EMAIL,
        to: recipient.email,
        subject: `Reminder: ${eventData.title}`,
        react: EventReminderEmail({
          recipientName: recipient.name,
          eventTitle: eventData.title,
          eventDate: eventData.date,
          eventLocation: eventData.location,
          timeFrame,
          eventLink,
        }),
      }),
    );

    // Wait for all emails to send
    const results = await Promise.all(emailPromises);

    // Check for and log failures
    const failedEmails = results.filter((r) => r.error);
    if (failedEmails.length > 0) {
      console.error(
        "[Email] Some reminders failed:",
        failedEmails.map((f) => f.error?.message),
      );
    }

    // Count successful sends
    const successCount = results.filter((r) => !r.error).length;

    if (successCount > 0) {
      // Record successful email sends in database
      await emailLogsCollection.insertOne({
        eventId: new ObjectId(eventId),
        emailType: "reminder",
        timeFrame: timeFrame,
        trigger: "manual",
        recipientCount: successCount,
        sentAt: new Date(),
        subject: `Reminder: ${eventData.title}`,
      } as EmailLogDocument);

      // Record activity for audit trail
      const activitiesCollection = db.collection(ACTIVITIES_COLLECTION);
      await activitiesCollection.insertOne({
        action: "event_reminder_sent",
        eventId: new ObjectId(eventId),
        details: `Event reminder (${timeFrame}) sent to ${successCount} attendees`,
        createdAt: new Date(),
      } as ActivityLogDocument);
    }

    return {
      success: true,
      message: `Reminder sent to ${successCount} attendees${
        failedEmails.length > 0 ? ` (${failedEmails.length} failed)` : ""
      }`,
    };
  } catch (error) {
    console.error("[Email] Reminder send failed:", error);
    return {
      success: false,
      message: "Failed to send reminder",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send custom broadcast email to all registered community members
 * Uses HTML content provided by user
 */
export async function sendCustomBroadcast(
  subject: string,
  htmlContent: string,
): Promise<EmailResponse> {
  const authError = await requireAuth<never>();
  if (authError) {
    return {
      success: false,
      message: authError.message,
      error: authError.error,
    };
  }

  try {
    // Validate API key is configured
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    // Connect to database
    const { db } = await connectToDatabase();
    const registrationsCollection = db.collection(REGISTRATIONS_COLLECTION);

    // Fetch all registered community members
    const registrations = (await registrationsCollection
      .find({ status: "registered" })
      .toArray()) as RegistrationDocument[];

    if (!registrations || registrations.length === 0) {
      return {
        success: false,
        message: "No registered community members found",
      };
    }

    // Extract and validate email addresses
    const recipientEmails = registrations
      .map((reg) => reg.email)
      .filter(
        (email): email is string =>
          typeof email === "string" && email.length > 0,
      );

    if (recipientEmails.length === 0) {
      return {
        success: false,
        message: "No valid email addresses found",
      };
    }

    // Send broadcast email
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmails,
      subject: subject,
      react: CustomBroadcastEmail({
        subject,
        htmlContent,
      }),
    });

    if (response.error) {
      throw new Error(`Resend API error: ${response.error.message}`);
    }

    // Log email send in database
    const emailLogsCollection = db.collection(EMAIL_LOGS_COLLECTION);
    await emailLogsCollection.insertOne({
      emailType: "custom-broadcast",
      trigger: "manual",
      recipientCount: recipientEmails.length,
      sentAt: new Date(),
      subject: subject,
      resendId: response.data?.id,
      htmlContentLength: htmlContent.length,
    } as EmailLogDocument);

    // Record activity for audit trail
    const activitiesCollection = db.collection(ACTIVITIES_COLLECTION);
    await activitiesCollection.insertOne({
      action: "custom_broadcast_sent",
      details: `Custom broadcast sent to ${recipientEmails.length} members`,
      createdAt: new Date(),
    } as ActivityLogDocument);

    return {
      success: true,
      message: `Broadcast sent to ${recipientEmails.length} community members`,
    };
  } catch (error) {
    console.error("[Email] Custom broadcast failed:", error);
    return {
      success: false,
      message: "Failed to send broadcast",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get reminder sent status for all timeframes
 * Returns which reminder timeframes have already been sent for an event
 */
export async function getRemindersSentStatus(eventId: string): Promise<{
  success: boolean;
  data?: Record<TimeFrame, boolean>;
  error?: string;
}> {
  const authError = await requireAuth<never>();
  if (authError) {
    return {
      success: false,
      error: authError.error,
    };
  }

  try {
    // Connect to database
    const { db } = await connectToDatabase();
    const emailLogsCollection = db.collection(EMAIL_LOGS_COLLECTION);

    // Find all reminder logs for this event
    const reminderLogs = (await emailLogsCollection
      .find({
        eventId: new ObjectId(eventId),
        emailType: "reminder",
      })
      .toArray()) as EmailLogDocument[];

    // Initialize status object - all timeframes default to false
    const status: Record<TimeFrame, boolean> = {
      "1-week": false,
      "3-days": false,
      tomorrow: false,
      today: false,
    };

    // Mark timeframes that have been sent
    reminderLogs.forEach((log) => {
      if (log.timeFrame && log.timeFrame in status) {
        status[log.timeFrame] = true;
      }
    });

    return {
      success: true,
      data: status,
    };
  } catch (error) {
    console.error("[Email] Failed to fetch reminder status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get email history for recent sends
 * Returns the most recent email logs up to the specified limit
 */
export async function getEmailHistory(limit = 50): Promise<{
  success: boolean;
  data?: EmailLogDocument[];
  error?: string;
}> {
  const authError = await requireAuth<never>();
  if (authError) {
    return {
      success: false,
      error: authError.error,
    };
  }

  try {
    // Connect to database
    const { db } = await connectToDatabase();
    const emailLogsCollection = db.collection(EMAIL_LOGS_COLLECTION);

    // Fetch recent email logs, sorted by most recent first
    const logs = (await emailLogsCollection
      .find({})
      .sort({ sentAt: -1 })
      .limit(limit)
      .toArray()) as EmailLogDocument[];

    return {
      success: true,
      data: logs,
    };
  } catch (error) {
    console.error("[Email] History fetch failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check if announcement was already sent for a specific event
 * Returns true if announcement has been sent, false otherwise
 */
export async function hasAnnouncementBeenSent(
  eventId: string,
): Promise<boolean> {
  try {
    // Connect to database
    const { db } = await connectToDatabase();
    const eventsCollection = db.collection(EVENTS_COLLECTION);

    // Find the event and check announcementSent flag
    const event = (await eventsCollection.findOne({
      _id: new ObjectId(eventId),
    })) as EventDocument | null;

    return event?.announcementSent === true;
  } catch (error) {
    console.error("[Email] Check failed:", error);
    return false;
  }
}
