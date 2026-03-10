import type { ObjectId } from "mongodb";

/**
 * Speaker interface for event speakers
 * Changed photo to only accept string | undefined (no null)
 */
export interface Speaker {
  name: string;
  role: string;
  bio?: string;
  photo?: string | undefined;
}

/**
 * Event interface for MongoDB documents
 * Includes all fields required for event management
 * Changed maxAttendees to only accept number | undefined (no null)
 */
export interface Event {
  _id: ObjectId;
  title: string;
  description: string;
  date: Date;
  location: string;
  coverImage: string;
  duration: string;
  speakers: Speaker[];
  maxAttendees?: number | null;
  createdAt: Date;
  updatedAt: Date;
  announcementSent: boolean;
  announcementSentAt?: Date;
}

/**
 * Registration Document
 * Tracks user registrations for events
 */
export interface EventRegistration {
  _id: ObjectId;
  eventId: ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  registeredAt: Date;
}
