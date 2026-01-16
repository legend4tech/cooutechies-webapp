/**
 * Dashboard Loading Skeleton
 * Displays placeholder content while dashboard data loads
 * Matches the exact layout and design of the dashboard
 */

import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Activity } from "lucide-react";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Background effects matching biography page */}
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-125 h-125 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-100 h-100 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header with glassmorphic effect */}
      <div className="z-10 px-6 py-6 border-b border-border/50 sticky top-0 glass backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-linear-to-br from-primary/20 to-secondary/20">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold">
              <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Welcome back to your admin panel
            </p>
          </div>
        </div>
      </div>

      {/* Content with relative positioning */}
      <div className="flex-1 p-6 overflow-auto relative z-10">
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="glass rounded-2xl overflow-hidden border-glow"
              >
                <div className="p-6">
                  {/* Icon and Trend */}
                  <div className="flex items-start justify-between mb-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                  </div>

                  {/* Stats */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-16" />
                    <Skeleton className="h-3 w-28 mt-2" />
                  </div>
                </div>

                {/* Gradient bottom accent */}
                <div className="h-1 bg-linear-to-r from-primary via-secondary to-primary opacity-50" />
              </div>
            ))}
          </div>

          {/* Activity Log Skeleton */}
          <div className="glass rounded-2xl overflow-hidden border-glow">
            <div className="border-b border-border/50 bg-linear-to-r from-primary/5 via-transparent to-secondary/5 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-linear-to-br from-primary/20 to-secondary/20">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-foreground">
                    Recent Activity
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Latest updates and events
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-0">
                {[...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 py-5 border-b border-border/30 last:border-0"
                  >
                    {/* Status Icon Skeleton */}
                    <Skeleton className="h-8 w-8 rounded-xl shrink-0 mt-0.5" />

                    {/* Content Skeleton */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
