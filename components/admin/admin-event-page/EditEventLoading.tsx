// app/admin/events/[id]/edit/loading.tsx
/**
 * Loading state for edit event page
 */

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function EditEventLoading() {
  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />

      {/* Header */}
      <div className="px-6 py-6 border-b border-border/50 sticky top-0 glass backdrop-blur-xl z-10">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto relative z-10">
        <div className="w-full max-w-4xl mx-auto">
          <Card className="border-border/50">
            <CardContent className="p-8 space-y-8">
              {/* Image and max attendees section */}
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="aspect-video w-full rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>

              {/* Speakers section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-36" />
                  <Skeleton className="h-9 w-32" />
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2].map((i) => (
                    <Card key={i} className="border-border/50">
                      <CardContent className="p-4">
                        <div className="flex gap-3 mb-3">
                          <Skeleton className="w-16 h-16 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-2/3" />
                          </div>
                        </div>
                        <div className="flex gap-2 pt-3 border-t border-border/50">
                          <Skeleton className="h-8 flex-1" />
                          <Skeleton className="h-8 flex-1" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4 justify-end pt-4">
                <Skeleton className="h-12 w-24" />
                <Skeleton className="h-12 w-40" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}