// app/admin/events/[id]/edit/page.tsx
/**
 * Edit Event Page
 * Loads existing event data and allows editing
 */

import { getEventById } from "@/app/actions/events";
import { notFound } from "next/navigation";

import { EventForm } from "@/components/admin/admin-event-page/event-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditEventPage({ params }: PageProps) {
  const { id } = await params;

  const result = await getEventById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const { event } = result.data;

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-125 h-125 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="px-6 py-6 border-b border-border/50 sticky top-0 glass backdrop-blur-xl z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Button size="icon" asChild className="h-9 w-9 shrink-0">
              <Link href={`/admin/events/${id}`}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold">
                <span className="text-gradient">Edit Event</span>
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Update event information and details
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto relative z-10">
        <EventForm event={event} mode="edit" />
      </div>
    </div>
  );
}
