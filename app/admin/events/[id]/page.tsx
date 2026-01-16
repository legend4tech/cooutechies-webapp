/**
 * Event Detail Page (Server Component)
 * Displays comprehensive event information with client-side interactions
 * Server component handles initial data fetch, client component handles interactivity
 */

import { Button } from "@/components/ui/button";
import { ChevronLeft, Sparkles, Pencil } from "lucide-react";
import Link from "next/link";
import { EventDetailClient } from "@/components/admin/admin-event-page/EventDetailClient";
import { Suspense } from "react";
import { AdminEventDetailSkeleton } from "@/components/admin/AdminEventDetailSkeleton";
import { getEventById } from "@/app/actions/events";
import { notFound } from "next/navigation";
import { DeleteEventButton } from "@/components/admin/admin-event-page/DeleteEventButton";

interface Params {
  id: string;
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;

  // Fetch event to get title for delete button
  const result = await getEventById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const { event } = result.data;

  // Build the share URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const shareUrl = `${baseUrl}/events/${id}`;

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-125 h-125 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-100 h-100 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="px-6 py-6 border-b border-border/50 top-0 glass backdrop-blur-xl z-10 sticky">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Button size="icon" asChild>
              <Link href="/admin/events">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium text-primary">
                    Event Details
                  </span>
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold truncate">
                <span className="text-gradient">Event Details</span>
              </h1>
              <p className="text-muted-foreground text-sm">
                View and manage event information
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button asChild variant="outline">
              <Link href={`/admin/events/${id}/edit`}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Event
              </Link>
            </Button>
            <DeleteEventButton eventId={id} eventTitle={event.title} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto relative z-10">
        <div className="space-y-8 max-w-5xl">
          <Suspense fallback={<AdminEventDetailSkeleton />}>
            <EventDetailClient eventId={id} shareUrl={shareUrl} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
