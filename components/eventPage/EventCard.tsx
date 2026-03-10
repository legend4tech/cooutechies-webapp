"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  isEventOngoing,
  formatDuration,
  isEventUpcoming,
} from "@/lib/eventDurationUtils";

/**
 * EventCard Component
 * Displays an event card with image, details, and registration button
 * Used in the events listing page for both upcoming and past events
 * Uses event duration to determine if event is ongoing
 *
 * @param event - Event object containing all event details including duration
 * @param isPast - Boolean indicating if event is past (for styling)
 * @param registeredCount - Number of registered attendees
 */

interface EventCardProps {
  event: {
    _id: string;
    title: string;
    description: string;
    date: string; // ISO date string
    location: string;
    coverImage: string;
    maxAttendees: number | null;
    duration?: string; // Event duration (e.g., "1 day", "2 weeks")
  };
  isPast?: boolean;
  registeredCount?: number;
}

export function EventCard({
  event,
  isPast = false,
  registeredCount = 0,
}: EventCardProps) {
  // Format date for display
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  // Get event duration (default to "1 day" if not specified)
  const duration = event.duration || "1 day";

  // Check if event is currently ongoing based on duration
  const isOngoing = isEventOngoing(event.date, duration);
  const isUpcoming = isEventUpcoming(event.date);

  return (
    <div
      className={`glass rounded-2xl overflow-hidden group hover:border-primary/30 transition-all duration-500 ${
        isPast ? "opacity-80" : ""
      }`}
    >
      {/* Event Cover Image */}
      <Link
        href={`/events/${event._id}`}
        className="block relative h-56 overflow-hidden"
      >
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.06 }}
          transition={{
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1], // real smooth easing
          }}
        >
          <Image
            src={event.coverImage || "/placeholder.svg"}
            alt={event.title}
            fill
            className="object-cover"
          />
        </motion.div>

        {/* <div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent" /> */}

        {/* Past Event Badge */}
        {isPast && (
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-muted/90 backdrop-blur-sm text-xs font-medium">
            Past Event
          </div>
        )}

        {/* Upcoming Badge */}
        {isUpcoming && (
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-secondary/90 backdrop-blur-sm text-xs font-medium">
            Upcoming
          </div>
        )}

        {/* Ongoing Badge */}
        {isOngoing && (
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/90 backdrop-blur-sm text-xs font-medium text-primary-foreground">
            Ongoing
          </div>
        )}
      </Link>

      {/* Event Details */}
      <div className="p-6">
        {/* Event Title */}
        <Link href={`/events/${event._id}`}>
          <h3 className="text-xl font-display font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
            {event.title}
          </h3>
        </Link>

        {/* Event Description */}
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        {/* Event Meta Info */}
        <div className="space-y-2 mb-4">
          {/* Date & Time */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <span>
              {formattedDate} • {formattedTime}
            </span>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 text-primary" />
            <span>{formatDuration(duration)}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="line-clamp-1">{event.location}</span>
          </div>

          {/* Registered Count */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4 text-primary" />
            <span>
              {registeredCount} registered
              {event.maxAttendees !== null && ` • ${event.maxAttendees} max`}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Link href={`/events/${event._id}`} className="block">
          <Button
            className="w-full"
            variant={isPast ? "outline" : "default"}
            disabled={isPast}
          >
            {isPast
              ? "Event Ended"
              : isOngoing
                ? "Register (Event in progress)"
                : "Register Now"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
