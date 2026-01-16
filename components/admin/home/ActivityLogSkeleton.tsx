import { Skeleton } from "@/components/ui/skeleton";

export function ActivityLogSkeleton() {
  return (
    <div className="space-y-0 min-h-[400px]">
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="flex items-start gap-4 py-5 border-b border-border/30 last:border-0"
        >
          <Skeleton className="h-8 w-8 rounded-xl shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}
