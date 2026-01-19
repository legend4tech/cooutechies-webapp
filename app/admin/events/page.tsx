import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { EventsListAdmin } from "@/components/admin/admin-event-page/EventsListAdmin";

export const metadata = {
  title: "Events",
  description: "Manage events and registrations",
};

export default function EventsPage() {
  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-125 h-125 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-100 h-100 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="px-6 py-6 border-b border-border/50 sticky top-0 glass backdrop-blur-xl z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">Events</span>
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold">
              <span className="text-gradient">Events</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage your events and registrations
            </p>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/admin/events/new">
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Link>
          </Button>
        </div>
      </div>

      {/* Content - Now Client Component */}
      <EventsListAdmin />
    </div>
  );
}
