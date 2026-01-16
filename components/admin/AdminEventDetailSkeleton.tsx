/**
 * Event Detail Loading Skeleton
 * Displays placeholder content while event data loads
 * Matches the exact layout of the event detail page
 */

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Sparkles } from "lucide-react";
import Link from "next/link";

export function AdminEventDetailSkeleton() {
  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-125 h-125 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-100 h-100 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="px-6 py-6 border-b border-border/50 top-0 glass backdrop-blur-xl z-10 sticky">
        <div className="flex items-center gap-4">
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
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">
                  Event Details
                </span>
              </span>
            </div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto relative z-10">
        <div className="space-y-8 max-w-5xl">
          {/* Cover Image - Portrait aspect ratio */}
          <Skeleton className="w-full aspect-[3/4] max-h-[600px] rounded-xl" />

          {/* Main Event Details */}
          <div className="space-y-6">
            {/* Title and Description */}
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
            </div>

            {/* Key Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card
                  key={i}
                  className="border border-border/50 bg-background/50 backdrop-blur"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Announcement Status */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-background/50 border border-border/50">
              <div className="flex-1">
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-8 w-48 rounded-full" />
            </div>
          </div>

          {/* Email Actions */}
          <div className="space-y-4">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-56 w-full rounded-2xl" />
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          </div>

          {/* Speakers Section */}
          <div className="space-y-4">
            <div>
              <Skeleton className="h-8 w-56 mb-2" />
              <Skeleton className="h-4 w-72" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="border border-border/50">
                  <Skeleton className="w-full h-48" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Registrations */}
          <Card className="border border-border">
            <CardHeader className="border-b border-border bg-background/50">
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
