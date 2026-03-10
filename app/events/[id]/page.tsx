import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Infinity,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventSpeakerCard } from "@/components/eventPage/EventSpeakerCard";
import { RegistrationForm } from "@/components/eventPage/RegistrationForm";
import { EventStatusBadge } from "@/components/eventPage/EventStatusBadge";
import { getEventById } from "@/app/actions/events";
import { isRegistrationOpen, formatDuration } from "@/lib/eventDurationUtils";
import { Speaker } from "@/types/event.types";

import EventDetailSkeleton from "@/components/eventPage/EventDetailSkeleton";
import EventDetailError from "@/components/eventPage/EventDetailError";
import { Suspense } from "react";

/**
 * Event Detail Page (Server Component)
 * Fetches real event data from database using server actions
 * Displays detailed information about a specific event
 * Includes hero section, description, speakers, and registration form
 * Uses event duration to determine registration availability
 *
 * Route: /events/[id]
 */

interface EventPageProps {
  params: Promise<{
    id: string;
  }>;
}

import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { id } = await params;
  const response = await getEventById(id);

  if (!response?.data) {
    return {
      title: "Event Not Found",
      description: "The requested event could not be found",
    };
  }

  const { event } = response.data;

  return {
    title: event.title,
    description: event.description,
  };
}

// Separate the data fetching component
async function EventContent({ id }: { id: string }) {
  // Fetch event data from database using server action
  const response = await getEventById(id);

  // Handle error or missing data
  if (!response?.data) {
    return <EventDetailError error="Failed to load event data" />;
  }

  const { event, registrationCount } = response.data;

  // Format date and time
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  // Get event duration (default to "1 day" if not set)
  const eventDuration = event.duration || "1 day";

  // Check if registration is open based on event duration
  const registrationOpen = isRegistrationOpen(event.date, eventDuration);

  // Convert event date to ISO string for components
  const eventDateISO = eventDate.toISOString();

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-28 pb-0 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-0 left-0 w-150 h-150 bg-primary/10 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Back button */}
          <Button
            asChild
            variant="ghost"
            className="mb-8 group hover:bg-primary/10"
          >
            <Link href="/events">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Events
            </Link>
          </Button>

          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Left Column - Cover Image */}
            <div className="lg:col-span-3">
              <div className="relative h-100 md:h-125 rounded-3xl overflow-hidden border-glow">
                <Image
                  src={event.coverImage}
                  alt={event.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Right Column - Event Meta */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status Badge */}
              <EventStatusBadge
                eventDate={eventDateISO}
                duration={eventDuration}
              />

              {/* Event Title */}
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-tight mb-4">
                  {event.title}
                </h1>
              </div>

              {/* Event Details */}
              <div className="glass rounded-2xl p-6 space-y-4">
                {/* Date & Time */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-medium">{formattedDate}</p>
                    <p className="text-sm text-muted-foreground">
                      {formattedTime}
                    </p>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">
                      {formatDuration(eventDuration)}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{event.location}</p>
                  </div>
                </div>

                {/* Attendees */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Attendees</p>
                    <p className="font-medium">
                      {registrationCount || 0} registered
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {event.maxAttendees !== null ? (
                        `Maximum: ${event.maxAttendees} spots`
                      ) : (
                        <span className="flex items-center gap-1">
                          <Infinity className="w-4 h-4" />
                          Unlimited Attendees
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Description Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold mb-6">
                  About This Event
                </h2>
                <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
                  {event.description}
                </div>
              </div>

              {/* Speakers Section - Only show if speakers exist */}
              {event.speakers && event.speakers.length > 0 && (
                <div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold mb-6">
                    Featured Speakers
                  </h2>
                  <div className="space-y-4">
                    {event.speakers.map((speaker: Speaker, index: number) => (
                      <EventSpeakerCard key={index} speaker={speaker} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Registration */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <RegistrationForm
                  eventId={event._id.toString()}
                  eventDate={eventDateISO}
                  eventDuration={eventDuration}
                  isRegistrationOpen={registrationOpen}
                  eventTitle={event.title}
                  eventTime={formattedTime}
                  eventLocation={event.location}
                  eventDescription={event.description}
                  formattedDate={formattedDate}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Events CTA */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 circuit-pattern opacity-20" />
        <div className="absolute bottom-0 right-0 w-125 h-125 bg-secondary/10 rounded-full blur-[120px]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="glass rounded-3xl p-12 text-center max-w-2xl mx-auto border-glow">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              <span className="text-gradient">Explore More Events</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Check out other exciting events and workshops happening in our
              community!
            </p>
            <Button size="lg" asChild>
              <Link href="/events">View All Events</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen">
      <Suspense fallback={<EventDetailSkeleton />}>
        <EventContent id={id} />
      </Suspense>
    </main>
  );
}
