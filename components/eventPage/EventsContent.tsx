"use client";

import Link from "next/link";
import { Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/eventPage/EventCard";
import { calculateEventEndTime } from "@/lib/eventDurationUtils";
import { EventsInlineError } from "./EventsErrorFallback";
import { EventsLoadingSkeleton } from "./EventsLoadingSkeleton";
import { useEvents } from "@/hooks/tanstack-query/use-events";

/**
 * EventsContent Component
 * Client component that uses TanStack Query for data fetching
 */

interface EventWithCount {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  coverImage: string;
  duration?: string;
  maxAttendees?: number;
  registrationCount?: number;
}

function separateEvents(events: EventWithCount[]) {
  const now = new Date();
  const upcoming: EventWithCount[] = [];
  const past: EventWithCount[] = [];

  events.forEach((event) => {
    const eventDate = new Date(event.date);
    const duration = event.duration || "1 day";
    const eventEndTime = calculateEventEndTime(eventDate, duration);

    if (now <= eventEndTime) {
      upcoming.push(event);
    } else {
      past.push(event);
    }
  });

  return { upcoming, past };
}

export function EventsContent() {
  // Use TanStack Query hook
  const { data, isLoading, isError, error } = useEvents(1, 50);

  // Handle loading state
  if (isLoading) {
    return <EventsLoadingSkeleton />;
  }

  // Handle error state
  if (isError || !data) {
    return <EventsInlineError />;
  }

  // Get events and separate into upcoming and past
  const allEvents = data.events;
  const { upcoming, past } = separateEvents(allEvents);

  return (
    <>
      {/* Upcoming Events Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold">
                Upcoming Events
              </h2>
              <p className="text-muted-foreground text-sm">
                {upcoming.length} {upcoming.length === 1 ? "event" : "events"}{" "}
                you can register for
              </p>
            </div>
          </div>

          {/* Events Grid */}
          {upcoming.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcoming.map((event) => (
                <EventCard
                  key={event._id}
                  event={{
                    _id: event._id,
                    title: event.title,
                    description: event.description,
                    date: event.date,
                    location: event.location,
                    coverImage: event.coverImage,
                    maxAttendees: event.maxAttendees ?? null,
                    duration: event.duration || "1 day",
                  }}
                  registeredCount={event.registrationCount || 0}
                />
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl p-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-display font-bold mb-2">
                No Upcoming Events
              </h3>
              <p className="text-muted-foreground">
                Check back soon for new events and workshops!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Past Events Section */}
      {past.length > 0 && (
        <section className="py-16 relative">
          <div className="container mx-auto px-4">
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-muted/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold">
                  Past Events
                </h2>
                <p className="text-muted-foreground text-sm">
                  Catch up on what you missed
                </p>
              </div>
            </div>

            {/* Events Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {past.map((event) => (
                <EventCard
                  key={event._id}
                  event={{
                    _id: event._id,
                    title: event.title,
                    description: event.description,
                    date: event.date,
                    location: event.location,
                    coverImage: event.coverImage,
                    maxAttendees: event.maxAttendees ?? null,
                    duration: event.duration || "1 day",
                  }}
                  isPast={true}
                  registeredCount={event.registrationCount || 0}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 circuit-pattern opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="glass rounded-3xl p-12 text-center max-w-2xl mx-auto border-glow">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              <span className="text-gradient">Stay Updated</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Don&apos;t miss out on our upcoming events! Follow us on social
              media or join our community to get notified about new events.
            </p>
            <Button size="lg" asChild>
              <Link href="/join">Join Our Community</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
