import { EventForm } from "@/components/admin/admin-event-page/event-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function NewEventPage() {
  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-125 h-125 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-100 h-100 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      {/*  Header with reduced height */}
      <div className="px-4 sm:px-6 py-4 border-b border-border/50 sticky top-0 glass backdrop-blur-xl z-10 ">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <Button size="icon" asChild className="h-9 w-9 shrink-0">
              <Link href="/admin/events">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>

            {/* Header Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-primary/30 bg-primary/10">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span className="text-xs font-medium text-primary">
                    New Event
                  </span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold leading-tight">
                <span className="text-gradient">Create New Event</span>
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 line-clamp-1">
                Fill in the details below to add a new event to your calendar
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-6 overflow-auto relative z-10">
        <div className="max-w-4xl mx-auto">
          <EventForm />
        </div>
      </div>
    </div>
  );
}
