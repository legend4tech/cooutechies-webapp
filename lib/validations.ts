import * as z from "zod";

export const registrationSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be at most 50 characters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be at most 50 characters"),
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email must be at most 255 characters")
    .toLowerCase(),
  department: z
    .string()
    .min(2, "Department must be at least 2 characters")
    .max(100, "Department must be at most 100 characters"),
  level: z.string().min(1, "Please select your level"),
  techSkills: z
    .string()
    .max(500, "Tech skills must be at most 500 characters")
    .optional()
    .or(z.literal("")),
  aspiringSkills: z
    .string()
    .max(500, "Aspiring skills must be at most 500 characters")
    .optional()
    .or(z.literal("")),
  reason: z
    .string()
    .min(20, "Please tell us more (minimum 20 characters)")
    .max(500, "Reason must be at most 500 characters"),
  campus: z.string().min(1, "Please select your campus"),
});

// Event validation schema
export const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.string().datetime("Invalid date format"),
  location: z.string().min(3, "Location is required"),
  coverImage: z.string().url("Valid image URL required"),
  duration: z.string().min(1, "Duration is required"),
  maxAttendees: z.number().int().positive().optional().nullable(),
  speakers: z
    .array(
      z.object({
        name: z.string().min(2),
        role: z.string().min(2),
        bio: z.string().optional(),
        photo: z.string().url().optional().nullable(),
      }),
    )
    .optional()
    .default([]),
});

export const eventRegistrationSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email is required"),
  eventId: z.string().min(1, "Event ID is required"),
});

// Email validation schema
export const emailSchema = z.object({
  subject: z.string().min(5, "Subject is required"),
  body: z.string().min(10, "Message body is required"),
  audience: z.enum(["all", "event-registrants"]),
});

// Manual email broadcast schema
export const broadcastEmailSchema = z.object({
  subject: z.string().min(5),
  body: z.string().min(10),
});

export type EventFormData = z.infer<typeof eventSchema>;
export type RegistrationFormData = z.infer<typeof registrationSchema>;
export type EventRegistrationData = z.infer<typeof eventRegistrationSchema>;
export type EmailFormData = z.infer<typeof emailSchema>;
export type BroadcastEmailData = z.infer<typeof broadcastEmailSchema>;
