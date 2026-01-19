// Biography page that combines all biography section components

import { BiographyHeroAbout } from "@/components/Biography/BiographyHeroAbout";
import { BiographyTeamShowcase } from "@/components/Biography/BiographyTeamShowcase";
import { BiographyTimeline } from "@/components/Biography/BiographyTimeline";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/sections/Footer";

export const metadata = {
  title: "Biography",
  description: "Learn about our Community history, team, and milestones",
};

export default function BiographyPage() {
  return (
    <main className="w-full bg-background overflow-x-hidden">
      <Navbar />
      {/* Hero section with  introduction and image gallery */}
      <BiographyHeroAbout />

      {/* Team showcase section featuring founder and core team members */}
      <BiographyTeamShowcase />

      {/* Timeline section showing key community milestones and achievements */}
      <BiographyTimeline />
      <Footer />
    </main>
  );
}
