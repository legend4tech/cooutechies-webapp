/**
 * Event Detail Client Component
 * Handles client-side data fetching, pagination, and interactions
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpeakerCard } from "@/components/admin/speaker-card";
import { EventEmailActionsClient } from "@/components/admin/event-email-actions-client";
import { ShareEventButton } from "@/components/admin/share-event-button";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import {
  useEventDetails,
  useEventRegistrations,
  useCommunityEmails,
  useReminderStatus,
} from "@/hooks/tanstack-query/use-event-details";

import { formatDuration, isEventPast } from "@/lib/eventDurationUtils";
import Image from "next/image";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AdminEventDetailSkeleton } from "../AdminEventDetailSkeleton";
import { AdminEventDetailError } from "../AdminEventDetailError";

interface EventDetailClientProps {
  eventId: string;
  shareUrl: string;
}

const REGISTRATIONS_PER_PAGE = 10;

export function EventDetailClient({
  eventId,
  shareUrl,
}: EventDetailClientProps) {
  const [registrationsPage, setRegistrationsPage] = useState(1);

  // Fetch event details
  const {
    data: eventData,
    isLoading: eventLoading,
    error: eventError,
    refetch: refetchEvent,
  } = useEventDetails(eventId);

  // Fetch registrations with pagination
  const {
    data: registrationsData,
    isLoading: registrationsLoading,
    error: registrationsError,
  } = useEventRegistrations(eventId, registrationsPage, REGISTRATIONS_PER_PAGE);

  // Fetch community emails for announcements
  const { data: communityEmails = [] } = useCommunityEmails();

  // Fetch reminder status
  const { data: reminderStatus } = useReminderStatus(eventId);

  // Combined loading state
  const isLoading = eventLoading;

  // Combined error state
  const error = eventError || registrationsError;

  // Handle retry
  const handleRetry = () => {
    refetchEvent();
  };

  // Show loading skeleton on initial load
  if (isLoading) {
    return <AdminEventDetailSkeleton />;
  }

  // Show error state
  if (error || !eventData) {
    return <AdminEventDetailError error={error as Error} reset={handleRetry} />;
  }

  const { event, registrationCount } = eventData;
  const registrations = registrationsData?.registrations || [];
  const totalRegistrations = registrationsData?.total || 0;
  const totalPages = registrationsData?.totalPages || 1;

  // Check if event is past
  const eventIsPast = isEventPast(event.date, event.duration);

  // Pagination handlers
  const canGoNext = registrationsPage < totalPages;
  const canGoPrev = registrationsPage > 1;

  const handleNextPage = () => {
    if (canGoNext) {
      setRegistrationsPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (canGoPrev) {
      setRegistrationsPage((prev) => prev - 1);
    }
  };

  const handlePageClick = (page: number) => {
    setRegistrationsPage(page);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let startPage = Math.max(2, registrationsPage - 1);
      let endPage = Math.min(totalPages - 1, registrationsPage + 1);

      if (registrationsPage <= 2) {
        endPage = 4;
      }

      if (registrationsPage >= totalPages - 1) {
        startPage = totalPages - 3;
      }

      if (startPage > 2) {
        pages.push("ellipsis-start");
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        pages.push("ellipsis-end");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const startIndex = (registrationsPage - 1) * REGISTRATIONS_PER_PAGE + 1;
  const endIndex = Math.min(
    registrationsPage * REGISTRATIONS_PER_PAGE,
    totalRegistrations
  );

  return (
    <>
      {/* Hero Image - Portrait aspect ratio */}
      <div className="relative w-full aspect-[3/4] max-h-[600px] rounded-xl overflow-hidden border border-border/50 shadow-xl">
        <Image
          src={event.coverImage}
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-6 right-6">
          <ShareEventButton shareUrl={shareUrl} />
        </div>
      </div>

      {/* Main Event Details */}
      <div className="space-y-6">
        {/* Title and Description */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient">
            {event.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Key Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date */}
          <Card className="border border-border/50 bg-background/50 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Date
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-1">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="border border-border/50 bg-background/50 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Location
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-1">
                    {event.location}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Duration */}
          <Card className="border border-border/50 bg-background/50 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Duration
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-1">
                    {formatDuration(event.duration || "1 day")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendees */}
          <Card className="border border-border/50 bg-background/50 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Attendees
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-1">
                    {registrationCount} registration
                    {registrationCount !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {event.maxAttendees
                      ? `Max: ${event.maxAttendees}`
                      : "Unlimited"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Announcement Status */}
        <div className="flex items-center gap-3 p-4 rounded-lg bg-background/50 border border-border/50">
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              Announcement Status
            </p>
          </div>
          <span
            className={`inline-flex items-center px-4 py-2 rounded-full font-medium text-sm ${
              event.announcementSent
                ? "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20"
                : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20"
            }`}
          >
            {event.announcementSent
              ? "✓ Announcement Sent"
              : "⏱ Announcement Pending"}
          </span>
        </div>
      </div>

      {/* Email Actions */}
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-display font-bold">
            <span className="text-gradient">Email Actions</span>
          </h2>
          <p className="text-muted-foreground mt-2">
            Manage event communications
          </p>
        </div>
        <EventEmailActionsClient
          eventId={eventId}
          eventTitle={event.title}
          eventDate={new Date(event.date).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
          eventLocation={event.location}
          eventDescription={event.description}
          eventThumbnail={event.coverImage}
          announcementSent={event.announcementSent}
          registrations={registrations.map((reg) => ({
            email: reg.email,
            name: `${reg.firstName} ${reg.lastName}`,
          }))}
          allCommunityEmails={communityEmails}
          sentReminders={
            reminderStatus || {
              "1-week": false,
              "3-days": false,
              tomorrow: false,
              today: false,
            }
          }
          eventIsPast={eventIsPast}
          eventDateISO={event.date}
          eventDuration={event.duration}
        />
      </div>

      {/* Speakers */}
      {event.speakers && event.speakers.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-3xl font-display font-bold">
              <span className="text-gradient">Featured Speakers</span>
            </h2>
            <p className="text-muted-foreground mt-2">
              Meet the experts speaking at this event
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {event.speakers.map((speaker, index) => (
              <SpeakerCard
                key={index}
                name={speaker.name}
                role={speaker.role}
                bio={speaker.bio}
                photo={speaker.photo}
              />
            ))}
          </div>
        </div>
      )}

      {/* Registrations */}
      <Card className="border border-border">
        <CardHeader className="border-b border-border bg-background/50 ">
          <CardTitle className="pt-4">
            Registrations ({totalRegistrations})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {registrationsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : totalRegistrations === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No registrations yet
            </p>
          ) : (
            <>
              {registrationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-semibold text-foreground">
                            Name
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">
                            Email
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">
                            Registered
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrations.map((reg) => (
                          <tr
                            key={reg._id}
                            className="border-b border-border hover:bg-muted/50 transition-colors"
                          >
                            <td className="py-3 px-4 font-medium text-foreground">
                              {reg.firstName} {reg.lastName}
                            </td>
                            <td className="py-3 px-4 text-foreground">
                              {reg.email}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {new Date(reg.registeredAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6 pt-6 border-t border-border/50">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-muted-foreground">
                          Showing {startIndex} to {endIndex} of{" "}
                          {totalRegistrations} registrations
                        </p>

                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={handlePrevPage}
                                className={
                                  !canGoPrev
                                    ? "pointer-events-none opacity-50"
                                    : "cursor-pointer"
                                }
                              />
                            </PaginationItem>

                            {getPageNumbers().map((page, index) => {
                              if (typeof page === "string") {
                                return (
                                  <PaginationItem key={`${page}-${index}`}>
                                    <span className="px-2 text-muted-foreground">
                                      ...
                                    </span>
                                  </PaginationItem>
                                );
                              }

                              return (
                                <PaginationItem key={page}>
                                  <PaginationLink
                                    onClick={() => handlePageClick(page)}
                                    isActive={registrationsPage === page}
                                    className="cursor-pointer"
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            })}

                            <PaginationItem>
                              <PaginationNext
                                onClick={handleNextPage}
                                className={
                                  !canGoNext
                                    ? "pointer-events-none opacity-50"
                                    : "cursor-pointer"
                                }
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
