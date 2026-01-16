/**
 * Serialized Types for Client Components
 * All MongoDB ObjectIds and Dates converted to strings
 * These types are safe to pass from Server to Client Components
 */

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface SerializedSpeaker {
  name: string;
  role: string;
  bio?: string;
  photo?: string;
}

export interface SerializedEvent {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  coverImage: string;
  duration?: string;
  speakers?: SerializedSpeaker[];
  maxAttendees?: number;
  createdAt: string;
  updatedAt: string;
  announcementSent: boolean;
  announcementSentAt?: string;
}

// ============================================================================
// REGISTRATION TYPES
// ============================================================================

export interface SerializedEventRegistration {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  eventId: string;
  registeredAt: string;
  status: string;
}

export interface SerializedCommunityRegistration {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  level: string;
  techSkills?: string;
  aspiringSkills?: string;
  reason?: string;
  campus?: string;
  school?: string;
  createdAt: string;
  status: string;
}

// ============================================================================
// EMAIL LOG TYPES
// ============================================================================

export interface SerializedEmailLog {
  _id: string;
  eventId?: string;
  emailType: string;
  trigger: string;
  recipientCount: number;
  sentAt: string;
  subject: string;
  resendId?: string;
  timeFrame?: "1-week" | "3-days" | "tomorrow" | "today";
  htmlContentLength?: number;
}

// ============================================================================
// ACTIVITY LOG TYPES
// ============================================================================

export interface SerializedActivityLog {
  _id: string;
  action: string;
  eventId?: string;
  memberId?: string;
  details: string;
  createdAt: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface SerializedEventDetailResponse {
  event: SerializedEvent;
  registrations: SerializedEventRegistration[];
  reminders: SerializedEmailLog[];
  registrationCount: number;
}

export interface PaginatedEventsResponse {
  events: (SerializedEvent & { registrationCount: number })[];
  total: number;
  pages: number;
  currentPage: number;
}

export interface PaginatedRegistrationsResponse {
  registrations: SerializedCommunityRegistration[];
  total: number;
  pages: number;
  currentPage: number;
}
