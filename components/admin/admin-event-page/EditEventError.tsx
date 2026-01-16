// app/admin/events/[id]/edit/error.tsx
/**
 * Error boundary for edit event page
 */

"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function EditEventError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Edit event error:", error);
  }, [error]);

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />

      {/* Header */}
      <div className="px-6 py-6 border-b border-border/50 sticky top-0 glass backdrop-blur-xl z-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-display font-bold">
            <span className="text-gradient">Edit Event</span>
          </h1>
        </div>
      </div>

      {/* Error Content */}
      <div className="flex-1 p-6 overflow-auto relative z-10 flex items-center justify-center">
        <Card className="max-w-lg w-full border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle>Something went wrong</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We encountered an error while loading the event for editing.
              Please try again.
            </p>

            {error.message && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive font-mono">
                  {error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button onClick={reset} className="flex-1" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button asChild className="flex-1">
                <Link href="/admin/events">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Events
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
