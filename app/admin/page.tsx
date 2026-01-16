/**
 * Dashboard Overview Page
 * Server component that wraps the client-side dashboard
 * Provides initial metadata and layout structure
 */

import { DashboardClient } from "@/components/admin/home/DashboardClient";
import { DashboardSkeleton } from "@/components/admin/home/DashboardSkeleton";
import { Suspense } from "react";

export const metadata = {
  title: "Dashboard | Admin Panel",
  description: "View real-time statistics and recent activity",
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient />
    </Suspense>
  );
}
