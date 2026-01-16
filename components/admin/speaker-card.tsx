/**
 * Speaker Card Component
 * Displays speaker information with fallback for missing photos
 */

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";

interface SpeakerProps {
  name: string;
  role: string;
  bio?: string;
  photo?: string | undefined;
}

export function SpeakerCard({ name, role, bio, photo }: SpeakerProps) {
  return (
    <Card className="overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
      {/* Speaker Photo */}
      <div className="relative w-full h-48 bg-muted overflow-hidden">
        {photo ? (
          <Image
            src={photo}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/10 to-secondary/10">
            <User className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
      </div>

      {/* Speaker Info */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-lg font-bold text-foreground">{name}</h3>
          <p className="text-sm text-primary font-medium">{role}</p>
        </div>
        {bio && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {bio}
          </p>
        )}
      </div>
    </Card>
  );
}
