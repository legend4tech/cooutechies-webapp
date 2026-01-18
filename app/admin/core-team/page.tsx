/**
 * Core Team List Page
 * Server-side rendered page displaying all core team members
 * Matches the design aesthetic of the admin dashboard
 */

import CoreTeamListContent from "@/components/admin/core-team/core-team-list-content";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, Plus } from "lucide-react";
import { getCoreTeamMembers } from "@/app/actions/core-team";
import CoreTeamError from "@/components/admin/core-team/core-team-error";
import { Suspense } from "react";
import CoreTeamSkeleton from "@/components/admin/core-team/core-team-skeleton";

export const metadata = {
  title: "Core Team | Admin Dashboard",
  description: "Manage core team members",
};

async function CoreTeamContent() {
  // Fetch core team members on the server
  const response = await getCoreTeamMembers();
  console.log(response);

  if (!response?.data) {
    return <CoreTeamError />;
  }
  const members = response.data.members;

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Background effects matching dashboard design */}
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-125 h-125 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-100 h-100 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header with action button */}
      <div className="z-10 px-6 py-6 border-b border-border/50 sticky top-0 glass backdrop-blur-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-linear-to-br from-primary/20 to-secondary/20">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold">
                <span className="text-gradient">Core Team</span>
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Manage your team members
              </p>
            </div>
          </div>
          <Link href="/admin/core-team/add">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Member</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 p-6 overflow-auto relative z-10">
        <div className="max-w-7xl mx-auto">
          {members.length === 0 ? (
            <div className="glass rounded-2xl overflow-hidden border-glow p-12 text-center">
              <div className="p-4 rounded-2xl bg-muted/50 mb-4 inline-block">
                <Users className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                No team members yet
              </h2>
              <p className="text-muted-foreground mb-6">
                Get started by adding your first core team member
              </p>
              <Link href="/admin/core-team/add">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add First Member
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CoreTeamListContent members={members} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function CoreTeamPage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<CoreTeamSkeleton />}>
        <CoreTeamContent />
      </Suspense>
    </main>
  );
}
