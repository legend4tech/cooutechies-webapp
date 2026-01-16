"use client";

import { motion } from "framer-motion";
import { Target, Users, Github, Linkedin, Twitter, Mail } from "lucide-react";
import {
  EmptyState,
  ErrorFallback,
  TeamCardSkeleton,
} from "./BiographyFallbacks";
import Image from "next/image";
import { useCoreTeamMembers } from "@/hooks/tanstack-query/use-core-team";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
};

/**
 * FounderSection - Displays founder information with futuristic styling
 */
function FounderSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 circuit-pattern opacity-30" />
      <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] -translate-y-1/2 -translate-x-1/2 pulse-glow" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[150px] translate-x-1/4 translate-y-1/4" />

      {/* Floating particles */}
      <motion.div
        className="absolute top-20 right-20 w-2 h-2 bg-primary rounded-full"
        animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-40 left-[30%] w-1 h-1 bg-secondary rounded-full"
        animate={{ y: [0, -15, 0], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="text-center mb-20"
        >
          <motion.span
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/40 bg-primary/10 mb-8 backdrop-blur-sm"
          >
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary tracking-wider uppercase">
              Founder
            </span>
          </motion.span>
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-6xl font-display font-bold tracking-tight"
          >
            <span className="text-gradient neon-text">Meet The Visionary</span>
          </motion.h2>
        </motion.div>

        {/* Founder Card */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="max-w-6xl mx-auto"
        >
          <div className="animated-border p-[2px] rounded-3xl">
            <div className="glass-strong rounded-3xl overflow-hidden">
              <div className="grid md:grid-cols-2">
                {/* Founder Image */}
                <div className="relative h-80 md:h-[500px] overflow-hidden">
                  <Image
                    src="/founder.jpg"
                    alt="Paul Alfred - Founder"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent md:bg-gradient-to-r" />

                  {/* Decorative HUD elements */}
                  <motion.div
                    className="absolute top-6 left-6 w-24 h-24 border-2 border-primary/50 rounded-full"
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 8, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute top-8 left-8 w-20 h-20 border border-secondary/30 rounded-full"
                    animate={{ scale: [1.1, 1, 1.1], rotate: [0, -90, 0] }}
                    transition={{ duration: 6, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute bottom-8 right-8 w-16 h-16 border-2 border-accent/40 rounded-lg rotate-45"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                  />

                  {/* Scan line effect */}
                  <div className="absolute inset-0 scan-line pointer-events-none" />
                </div>

                {/* Founder Info */}
                <div className="p-8 md:p-12 flex flex-col justify-center relative">
                  <motion.span
                    initial={{ width: 0 }}
                    whileInView={{ width: "3rem" }}
                    transition={{ duration: 0.8 }}
                    className="h-1 bg-gradient-to-r from-primary to-secondary mb-6 rounded-full"
                  />
                  <span className="text-primary font-semibold text-sm mb-3 tracking-[0.2em] uppercase">
                    Founder & Alumni
                  </span>
                  <h3 className="text-3xl md:text-5xl font-display font-bold mb-3 text-foreground">
                    Paul Alfred
                  </h3>
                  <p className="text-muted-foreground text-lg mb-8">
                    Engineering Graduate | Motion Designer
                  </p>

                  <div className="space-y-4 text-muted-foreground mb-10 leading-relaxed">
                    <p>
                      Paul Alfred founded COOU Techies with a vision to bridge
                      the gap between classroom learning and real-world tech
                      skills. His passion for technology and community building
                      has inspired hundreds of students.
                    </p>
                    <p>
                      Under his leadership, the community has organized over 30
                      events, mentored countless students, and produced
                      graduates passionate about tech.
                    </p>
                  </div>

                  {/* Social Links */}
                  <div className="flex gap-4">
                    {[
                      {
                        icon: Github,
                        href: "#",
                        color:
                          "hover:border-primary hover:text-primary hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)]",
                      },
                      {
                        icon: Linkedin,
                        href: "#",
                        color:
                          "hover:border-ring hover:text-ring hover:shadow-[0_0_20px_hsl(var(--ring)/0.3)]",
                      },
                      {
                        icon: Twitter,
                        href: "#",
                        color:
                          "hover:border-secondary hover:text-secondary hover:shadow-[0_0_20px_hsl(var(--secondary)/0.3)]",
                      },
                      {
                        icon: Mail,
                        href: "#",
                        color:
                          "hover:border-accent hover:text-accent hover:shadow-[0_0_20px_hsl(var(--accent)/0.3)]",
                      },
                    ].map((social, index) => (
                      <motion.a
                        key={index}
                        href={social.href}
                        whileHover={{ scale: 1.15, y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-12 h-12 rounded-xl border border-border bg-card/50 backdrop-blur-sm flex items-center justify-center text-muted-foreground transition-all duration-300 ${social.color}`}
                      >
                        <social.icon className="w-5 h-5" />
                      </motion.a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * CoreTeamCards - Displays team member cards in a responsive grid (row on desktop)
 */
export function CoreTeamCards() {
  const { data, isLoading, error, refetch } = useCoreTeamMembers();

  const socialIcons = {
    github: Github,
    twitter: Twitter,
    linkedin: Linkedin,
  };

  const socialColors = {
    github: "hover:text-primary hover:border-primary/50",
    linkedin: "hover:text-ring hover:border-ring/50",
    twitter: "hover:text-secondary hover:border-secondary/50",
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="text-center mb-20"
        >
          <motion.span
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-secondary/40 bg-secondary/10 mb-8 backdrop-blur-sm"
          >
            <Users className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-secondary tracking-wider uppercase">
              Core Team
            </span>
          </motion.span>
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-6xl font-display font-bold mb-6 tracking-tight"
          >
            <span className="text-gradient">The Dream</span>{" "}
            <span className="text-foreground">Makers</span>
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Meet the dedicated individuals who work tirelessly to make COOU
            Techies the incredible community it is today.
          </motion.p>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <TeamCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <ErrorFallback error={error as Error} onRetry={() => refetch()} />
        )}

        {/* Empty State */}
        {!isLoading && !error && data?.members?.length === 0 && <EmptyState />}

        {/* Team Cards Grid - Side by side on desktop */}
        {!isLoading && !error && data?.members && data.members.length > 0 && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {data.members.map((member, index) => (
              <motion.div
                key={member._id}
                variants={itemVariants}
                whileHover={{ y: -12, transition: { duration: 0.3 } }}
                className="group"
              >
                <div className="relative h-full">
                  {/* Glow effect on hover */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 rounded-2xl opacity-0 group-hover:opacity-60 blur-sm transition-all duration-500" />

                  <div className="relative glass rounded-2xl overflow-hidden transition-all duration-500 h-full border border-border/30 group-hover:border-transparent">
                    {/* Image Container */}
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={member.profileImage}
                        alt={member.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />

                      {/* HUD corner decorations */}
                      <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-primary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-primary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute bottom-16 left-3 w-6 h-6 border-l-2 border-b-2 border-secondary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute bottom-16 right-3 w-6 h-6 border-r-2 border-b-2 border-secondary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Desktop: Hover Overlay with Social Links */}
                      {member.socialLinks &&
                        Object.keys(member.socialLinks).length > 0 && (
                          <div className="hidden md:flex absolute inset-0 items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-background/60 backdrop-blur-sm">
                            {Object.entries(member.socialLinks)
                              .filter(([_, href]) => href)
                              .map(([platform, href]) => {
                                const Icon =
                                  socialIcons[
                                    platform as keyof typeof socialIcons
                                  ];
                                const colorClass =
                                  socialColors[
                                    platform as keyof typeof socialColors
                                  ];
                                if (!Icon) return null;

                                return (
                                  <motion.a
                                    key={platform}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={`w-11 h-11 rounded-xl bg-card/90 backdrop-blur-sm flex items-center justify-center text-muted-foreground transition-all duration-300 border border-border/50 ${colorClass}`}
                                  >
                                    <Icon className="w-5 h-5" />
                                  </motion.a>
                                );
                              })}
                          </div>
                        )}

                      {/* Mobile: Social Links at Bottom of Image */}
                      {member.socialLinks &&
                        Object.keys(member.socialLinks).length > 0 && (
                          <div className="md:hidden absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-card to-transparent">
                            <div className="flex gap-2 justify-center">
                              {Object.entries(member.socialLinks)
                                .filter(([_, href]) => href)
                                .map(([platform, href]) => {
                                  const Icon =
                                    socialIcons[
                                      platform as keyof typeof socialIcons
                                    ];
                                  if (!Icon) return null;

                                  return (
                                    <a
                                      key={platform}
                                      href={href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-9 h-9 rounded-lg bg-card/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-primary transition-colors border border-border/50"
                                    >
                                      <Icon className="w-4 h-4" />
                                    </a>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="p-6">
                      <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 mb-4">
                        <p className="text-xs font-semibold text-primary tracking-wide">
                          {member.role}
                        </p>
                      </div>
                      <h3 className="text-xl font-display font-bold mb-2 text-foreground group-hover:text-gradient transition-all duration-300">
                        {member.name}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                        {member.about}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

/**
 * BiographyTeamShowcase - Combines founder section and core team cards
 */
export const BiographyTeamShowcase = () => {
  return (
    <>
      <FounderSection />
      <CoreTeamCards />
    </>
  );
};

export default BiographyTeamShowcase;
