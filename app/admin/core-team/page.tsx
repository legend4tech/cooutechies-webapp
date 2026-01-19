import CoreTeamClientContent from "@/components/admin/core-team/core-team-list-content";

export const metadata = {
  title: "Core Team",
  description: "Manage core team members and leadership",
};

export default function CoreTeamPage() {
  return (
    <main className="min-h-screen">
      <CoreTeamClientContent />
    </main>
  );
}
