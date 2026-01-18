/**
 * Registration Server Actions (Updated with Serialization and Auth)
 * All return types properly serialized for client consumption
 */

"use server";

import { connectToDatabase } from "@/lib/db";
import {
  registrationSchema,
  eventRegistrationSchema,
  type RegistrationFormData,
  type EventRegistrationData,
} from "@/lib/validations";
import { sendConfirmationEmail } from "@/lib/confirmation-email";
import { ObjectId } from "mongodb";
import z from "zod";
import { Resend } from "resend";
import EventConfirmationEmail from "@/components/email-templates/EventConfirmationEmail";
import type {
  PaginatedRegistrationsResponse,
  SerializedCommunityRegistration,
} from "@/types/serialized.types";
import { requireAuth } from "@/lib/auth-helper";
import type { ApiResponse } from "@/types/data.types";

// Collection names from environment
const REGISTRATIONS_COLLECTION = process.env.REGISTRATIONS_COLLECTION!;
const EVENT_REGISTRATIONS_COLLECTION =
  process.env.EVENT_REGISTRATIONS_COLLECTION!;

interface RegistrationResponseData {
  registrationId: string;
}

export interface PaginatedCommunityRegistrationsResponse {
  registrations: SerializedCommunityRegistration[];
  total: number;
  pages: number;
  currentPage: number;
}

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL as string;

/**
 * Submit a new community registration (Public endpoint - no auth required)
 */
export async function submitRegistration(
  formData: RegistrationFormData,
): Promise<ApiResponse<RegistrationResponseData>> {
  try {
    const validatedData = registrationSchema.parse(formData);

    const { db } = await connectToDatabase();
    const registrationsCollection = db.collection(REGISTRATIONS_COLLECTION);

    const existingRegistration = await registrationsCollection.findOne({
      email: validatedData.email.toLowerCase(),
    });

    if (existingRegistration) {
      return {
        success: false,
        message: "This email is already registered",
        error: "EMAIL_EXISTS",
      };
    }

    const registration = {
      _id: new ObjectId(),
      ...validatedData,
      createdAt: new Date(),
      status: "registered",
    };

    const result = await registrationsCollection.insertOne(registration);

    try {
      await sendConfirmationEmail({
        firstName: validatedData.firstName,
        email: validatedData.email,
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    return {
      success: true,
      message: "Registration successful! Check your email for confirmation.",
      data: {
        registrationId: result.insertedId.toString(),
      },
    };
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        error: "VALIDATION_ERROR",
      };
    }

    return {
      success: false,
      message: "Registration failed. Please try again.",
      error: "REGISTRATION_ERROR",
    };
  }
}

/**
 * Get all community registrations with serialization (Admin only)
 */
export async function getCommunityRegistrations(
  page = 1,
  limit = 20,
): Promise<ApiResponse<PaginatedCommunityRegistrationsResponse>> {
  const authError =
    await requireAuth<PaginatedCommunityRegistrationsResponse>();
  if (authError) return authError;

  try {
    const { db } = await connectToDatabase();
    const registrationsCollection = db.collection(REGISTRATIONS_COLLECTION);

    const query = {};
    const skip = limit > 0 ? (page - 1) * limit : 0;

    const [registrations, total] = await Promise.all([
      registrationsCollection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit > 0 ? limit : 0)
        .toArray(),
      registrationsCollection.countDocuments(query),
    ]);

    // Serialize registrations according to SerializedCommunityRegistration
    const serialized = registrations.map((reg) => ({
      _id: reg._id.toString(),
      firstName: reg.firstName,
      lastName: reg.lastName,
      email: reg.email,
      department: reg.department,
      level: reg.level,
      techSkills: reg.techSkills,
      aspiringSkills: reg.aspiringSkills,
      reason: reg.reason,
      campus: reg.campus,
      school: reg.school,
      createdAt: reg.createdAt.toISOString(),
      status: reg.status,
    }));

    return {
      success: true,
      message: "Community registrations fetched successfully",
      data: {
        registrations: serialized,
        total,
        pages: limit > 0 ? Math.ceil(total / limit) : 1,
        currentPage: limit > 0 ? page : 1,
      },
    };
  } catch (error) {
    console.error("[Registrations] Fetch failed:", error);
    return {
      success: false,
      message: "Failed to fetch community registrations",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get registrations for a specific event with serialization (Admin only)
 */
export async function getEventRegistrations(
  eventId: string,
  page = 1,
  limit = 20,
): Promise<ApiResponse<PaginatedRegistrationsResponse>> {
  const authError = await requireAuth<PaginatedRegistrationsResponse>();
  if (authError) return authError;

  try {
    if (!ObjectId.isValid(eventId)) {
      return {
        success: false,
        message: "Invalid event ID",
        error: "Invalid event ID",
      };
    }

    const { db } = await connectToDatabase();
    const eventRegistrationsCollection = db.collection(
      EVENT_REGISTRATIONS_COLLECTION,
    );

    const skip = (page - 1) * limit;

    const [registrations, total] = await Promise.all([
      eventRegistrationsCollection
        .find({ eventId: new ObjectId(eventId) })
        .sort({ registeredAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      eventRegistrationsCollection.countDocuments({
        eventId: new ObjectId(eventId),
      }),
    ]);

    // Serialize registrations
    const serialized = registrations.map((reg) => ({
      _id: reg._id.toString(),
      firstName: reg.firstName,
      lastName: reg.lastName,
      email: reg.email,
      eventId: reg.eventId.toString(),
      registeredAt: reg.registeredAt.toISOString(),
      status: reg.status,
    }));

    return {
      success: true,
      message: "Event registrations fetched successfully",
      data: {
        registrations: serialized,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("[Event Registrations] Fetch failed:", error);
    return {
      success: false,
      message: "Failed to fetch event registrations",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Submit event registration (Public endpoint - no auth required)
 */
export async function submitEventRegistration(
  formData: EventRegistrationData & {
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    eventDescription?: string;
  },
): Promise<ApiResponse<RegistrationResponseData>> {
  try {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const validatedData = eventRegistrationSchema.parse(formData);

    if (!ObjectId.isValid(validatedData.eventId)) {
      return {
        success: false,
        message: "Invalid event ID",
        error: "Invalid event ID",
      };
    }

    const { db } = await connectToDatabase();
    const eventRegistrationsCollection = db.collection(
      EVENT_REGISTRATIONS_COLLECTION,
    );

    const existingRegistration = await eventRegistrationsCollection.findOne({
      email: validatedData.email.toLowerCase(),
      eventId: new ObjectId(validatedData.eventId),
    });

    if (existingRegistration) {
      return {
        success: false,
        message: "This email is already registered for this event",
        error: "EMAIL_EXISTS",
      };
    }

    const registration = {
      _id: new ObjectId(),
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email.toLowerCase(),
      eventId: new ObjectId(validatedData.eventId),
      registeredAt: new Date(),
      status: "registered",
    };

    const result = await eventRegistrationsCollection.insertOne(registration);

    try {
      const response = await resend.emails.send({
        from: FROM_EMAIL,
        to: validatedData.email,
        subject: `You're Registered for ${formData.eventTitle}! 🎉`,
        react: EventConfirmationEmail({
          firstName: validatedData.firstName,
          eventTitle: formData.eventTitle,
          eventDate: formData.eventDate,
          eventTime: formData.eventTime,
          eventLocation: formData.eventLocation,
          eventDescription: formData.eventDescription,
        }),
      });

      if (response.error) {
        console.error("Resend API error:", response.error);
      }
    } catch (emailError) {
      console.error("Event confirmation email sending failed:", emailError);
    }

    return {
      success: true,
      message:
        "Successfully registered for the event! Check your email for confirmation.",
      data: {
        registrationId: result.insertedId.toString(),
      },
    };
  } catch (error) {
    console.error("[Event Registration] Submission failed:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        error: "VALIDATION_ERROR",
      };
    }

    return {
      success: false,
      message: "Failed to register for event. Please try again.",
      error: "REGISTRATION_ERROR",
    };
  }
}
