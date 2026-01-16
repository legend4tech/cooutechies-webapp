/**
 * Registrations Error Component
 * Shows when registration fetch fails
 */

"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface RegistrationsErrorProps {
  error: Error;
  reset: () => void;
}

export function AllRegistrationsError({
  error,
  reset,
}: RegistrationsErrorProps) {
  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-125 h-125 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="glass rounded-2xl p-8 max-w-md w-full text-center border-glow">
          <div className="p-4 rounded-2xl bg-destructive/10 w-fit mx-auto mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>

          <h2 className="text-2xl font-display font-bold mb-2">
            Failed to Load Registrations
          </h2>

          <p className="text-muted-foreground text-sm mb-6">
            {error.message || "An error occurred while fetching registrations"}
          </p>

          <Button onClick={reset} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Registrations Loading Skeleton
 * Matches the structure of the registrations list
 */

import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function AllRegistrationsSkeleton() {
  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Loading cards matching the registration structure */}
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="glass rounded-xl overflow-hidden border-glow animate-pulse"
        >
          {/* Main Info Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-linear-to-r from-primary/5 via-transparent to-secondary/5 border-b border-border/30">
            <div className="flex items-center gap-4 flex-1">
              {/* Avatar Circle */}
              <Skeleton className="w-12 h-12 rounded-full" />

              {/* Name and Email */}
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-52" />
              </div>
            </div>

            {/* Status and Date */}
            <div className="flex items-center gap-4 shrink-0">
              <Skeleton className="hidden sm:block h-4 w-24" />
              <Skeleton className="h-6 rounded-full w-20" />
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
              {/* 3 columns of info */}
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="w-8 h-8 rounded-lg shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}

              {/* Full width sections */}
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`full-${i}`}
                  className="flex items-start gap-3 md:col-span-3"
                >
                  <Skeleton className="w-8 h-8 rounded-lg shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AllRegistrationsPageSkeleton() {
  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-125 h-125 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-100 h-100 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="z-10 px-6 py-6 border-b border-border/50 sticky top-0 glass backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-linear-to-br from-primary/20 to-secondary/20">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold">
                <span className="text-gradient">Community Registrations</span>
              </h1>
              <Skeleton className="h-4 w-32 mt-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto relative z-10">
        <AllRegistrationsSkeleton />
      </div>
    </div>
  );
}
