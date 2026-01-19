"use client";

import { useEvents } from "@/hooks/tanstack-query/use-events";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDuration } from "@/lib/eventDurationUtils";
import { EventsLoadingSkeleton } from "./EventsLoadingSkeleton";

export function EventsList() {
  const { data, isLoading, error } = useEvents(1, 50);

  if (isLoading) {
    return <EventsLoadingSkeleton />;
  }

  if (error) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <Card className="border border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-center text-destructive">
                {error instanceof Error
                  ? error.message
                  : "Failed to load events"}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  const events = data?.events || [];

  if (events.length === 0) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <Card className="border border-border">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No events available at the moment. Check back soon!
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 relative">
      <div className="container mx-auto">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link
              key={event._id}
              href={`/events/${event._id}`}
              className="group"
            >
              <Card className="overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 h-full">
                {/* Event Image */}
                <div className="relative w-full aspect-video bg-muted overflow-hidden">
                  <Image
                    src={event.coverImage || "/placeholder.svg"}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-4 line-clamp-2 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 text-primary/60 shrink-0" />
                      <span>
                        {new Date(event.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 text-primary/60 shrink-0" />
                      <span>{formatDuration(event.duration || "1 day")}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary/60 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
