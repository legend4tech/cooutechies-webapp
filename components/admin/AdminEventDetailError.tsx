/**
 * Event Detail Error Component
 * Displays error state when event data fails to load
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ChevronLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

interface EventDetailErrorProps {
  error: Error;
  reset: () => void;
}

export function AdminEventDetailError({ error, reset }: EventDetailErrorProps) {
  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-125 h-125 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-100 h-100 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="px-6 py-6 border-b border-border/50 glass backdrop-blur-xl z-10">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="hover:bg-primary/10 transition-colors"
        >
          <Link href="/admin/events">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      {/* Error Content */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <Card className="max-w-md w-full border-destructive/50 glass">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="p-4 rounded-full bg-destructive/10">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-display font-bold">
                  Failed to Load Event
                </h3>
                <p className="text-sm text-muted-foreground">
                  {error.message ||
                    "An unexpected error occurred while loading the event details."}
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <Button
                  onClick={reset}
                  className="flex-1 bg-primary hover:bg-primary/90"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button asChild className="flex-1" variant="outline">
                  <Link href="/admin/events">Go Back</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
