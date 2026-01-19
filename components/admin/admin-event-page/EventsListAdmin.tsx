"use client";

import { useEvents } from "@/hooks/tanstack-query/use-events";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, MapPin, Users, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatDuration } from "@/lib/eventDurationUtils";

export function EventsListAdmin() {
  const { data, isLoading, error } = useEvents(1, 50);

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="grid gap-6 max-w-7xl grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="w-full aspect-video bg-muted animate-pulse" />
              <CardContent className="p-4 space-y-3">
                <div className="h-6 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
        <Card className="border border-destructive/50">
          <CardContent className="pt-6">
            <p className="text-center text-destructive">
              {error instanceof Error ? error.message : "Failed to load events"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const events = data?.events || [];

  return (
    <div className="flex-1 p-6 overflow-auto relative z-10">
      {events.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No events yet. Create one to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 max-w-7xl grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div key={event._id} className="group flex flex-col h-full">
              <Card className="overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 flex flex-col h-full backdrop-blur-sm bg-card/50">
                {/* Event Image Container */}
                <div className="relative w-full aspect-video bg-muted overflow-hidden">
                  <Image
                    src={event.coverImage || "/placeholder.svg"}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-md ${
                        event.announcementSent
                          ? "bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/30"
                          : "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border border-yellow-500/30"
                      }`}
                    >
                      {event.announcementSent ? "Announced" : "Pending"}
                    </span>
                  </div>
                </div>

                <CardContent className="flex-1 p-4 flex flex-col justify-between">
                  {/* Event Info */}
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 text-primary/60 shrink-0" />
                        <span>
                          {new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
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

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4 text-secondary/60 shrink-0" />
                        <span>
                          {event.registrationCount || 0} registrations
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    asChild
                    size="sm"
                    className="mt-4 w-full bg-primary hover:bg-primary/90 transition-colors"
                  >
                    <Link href={`/admin/events/${event._id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
