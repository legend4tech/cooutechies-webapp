/**
 * Enhanced Registrations Page - Server Component
 * Uses client component for data fetching with TanStack Query
 */

import { Suspense } from "react";
import { Users } from "lucide-react";
import { RegistrationsClient } from "@/components/admin/registrations/RegistrationsClient";
import { AllRegistrationsPageSkeleton } from "@/components/admin/registrations/AllRegistrationsFallbacks";

export default function RegistrationsPage() {
  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-125 h-125 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-100 h-100 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header with glassmorphic effect */}
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
              <p className="text-muted-foreground text-sm mt-0.5">
                Manage community member registrations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto relative z-10">
        <Suspense fallback={<AllRegistrationsPageSkeleton />}>
          <RegistrationsClient />
        </Suspense>
      </div>
    </div>
  );
}
