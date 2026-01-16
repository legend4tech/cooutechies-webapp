/** * Dashboard Error Fallback Component * Displays when dashboard data fails to
load * Provides retry functionality and helpful error messaging */ "use client";
import { AlertCircle, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
interface DashboardErrorProps {
  error: Error;
  reset?: () => void;
}
export function DashboardError({ error, reset }: DashboardErrorProps) {
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

      {/* Error Content */}
      <div className="flex-1 p-6 overflow-auto relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="glass rounded-2xl overflow-hidden border-glow p-12">
            <div className="flex flex-col items-center justify-center text-center">
              {/* Error Icon */}
              <div className="p-4 rounded-2xl bg-destructive/10 mb-6">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
              {/* Error Message */}
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Failed to Load Dashboard
              </h2>
              <p className="text-muted-foreground max-w-md mb-6">
                {error.message ||
                  "We encountered an error while loading yourdashboard data. Please try again."}
              </p>
              {/* Retry Button */}{" "}
              {reset && (
                <Button
                  onClick={reset}
                  size="lg"
                  className="gap-2"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
              )}{" "}
              {/* Additional Help */}
              <p className="text-xs text-muted-foreground/70 mt-8">
                If this problem persists, please contact support
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
