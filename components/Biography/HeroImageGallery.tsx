"use client";

import type React from "react";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence, easeInOut } from "framer-motion";
import { useCoreTeamMembers } from "@/hooks/tanstack-query/use-core-team";
import { Skeleton } from "@/components/ui/skeleton";

export default function HeroImageGallery() {
  const { data, isLoading, error } = useCoreTeamMembers();
  const images = data?.members?.map((member) => member.profileImage) ?? [];

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  const decorativeVariants = useMemo(
    () => ({
      cornerTopLeft: {
        scale: [1, 1.1, 1],
        rotate: [0, 90, 0],
      },
      cornerBottomRight: {
        scale: [1, 1.15, 1],
        rotate: [0, -90, 0],
      },
      floatingTop: {
        y: [0, -20, 0],
        rotate: [0, 10, 0],
        scale: [1, 1.1, 1],
      },
      floatingBottom: {
        y: [0, 15, 0],
        rotate: [0, -10, 0],
        scale: [1, 1.15, 1],
      },
      floatingLeft: {
        x: [0, 10, 0],
        rotate: [0, 15, 0],
      },
    }),
    []
  );

  const transitions = useMemo(
    () => ({
      decorative: {
        duration: 8,
        repeat: Number.POSITIVE_INFINITY,
        ease: easeInOut,
      },
      decorativeSlow: {
        duration: 10,
        repeat: Number.POSITIVE_INFINITY,
        ease: easeInOut,
        delay: 1,
      },
      floating: {
        duration: 5,
        repeat: Number.POSITIVE_INFINITY,
        ease: easeInOut,
      },
      glow: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: easeInOut,
      },
    }),
    []
  );

  const handleImageClick = (index: number) => {
    setActiveIndex(index);
  };

  const handleIndicatorClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    e.stopPropagation();
    setActiveIndex(index);
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-112.5 md:h-137.5 lg:h-150 overflow-hidden flex items-center justify-center">
        <div className="absolute -top-6 -left-6 w-32 h-32 rounded-3xl opacity-15 border border-primary" />
        <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full opacity-20 border border-secondary" />
        <Skeleton className="w-70 h-70 md:w-95 md:h-95 lg:w-105 lg:h-105 rounded-3xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-112.5 md:h-137.5 lg:h-150 overflow-hidden flex items-center justify-center px-4">
        <div className="absolute -top-6 -left-6 w-32 h-32 rounded-3xl opacity-15 border border-primary" />
        <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full opacity-20 border border-secondary" />
        <div className="relative z-20 text-center">
          <div className="w-70 h-70 md:w-95 md:h-95 lg:w-105 lg:h-105 rounded-3xl bg-destructive/10 border border-destructive/30 flex items-center justify-center">
            <div>
              <p className="text-sm text-destructive font-medium">
                Failed to load images
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {error.message || "Something went wrong"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!error && images.length === 0) {
    return (
      <div className="relative w-full h-112.5 md:h-137.5 lg:h-150 overflow-hidden flex items-center justify-center px-4">
        <div className="absolute -top-6 -left-6 w-32 h-32 rounded-3xl opacity-15 border border-primary" />
        <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full opacity-20 border border-secondary" />
        <div className="relative z-20 text-center">
          <div className="w-70 h-70 md:w-95 md:h-95 lg:w-105 lg:h-105 rounded-3xl bg-secondary/10 border border-secondary/30 flex items-center justify-center">
            <div>
              <p className="text-sm text-muted-foreground">
                No images available
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Please check back later
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-112.5 md:h-137.5 lg:h-150 overflow-hidden">
      <motion.div
        className="absolute -top-6 -left-6 w-32 h-32 rounded-3xl"
        style={{
          background:
            "radial-gradient(circle at center, var(--color-primary) 0%, transparent 70%)",
          opacity: 0.15,
          border: "1px solid var(--color-primary)",
        }}
        animate={decorativeVariants.cornerTopLeft}
        transition={transitions.decorative}
      />
      <motion.div
        className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, var(--color-secondary) 0%, transparent 70%)",
          opacity: 0.2,
          border: "1px solid var(--color-secondary)",
        }}
        animate={decorativeVariants.cornerBottomRight}
        transition={transitions.decorativeSlow}
      />

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full blur-3xl pointer-events-none"
        style={{
          background: "var(--color-primary)",
          opacity: 0.05,
        }}
      />
      <div
        className="absolute top-1/3 right-1/4 w-100 h-100 rounded-full blur-3xl pointer-events-none"
        style={{
          background: "var(--color-secondary)",
          opacity: 0.05,
        }}
      />

      <div className="relative w-full h-full flex items-center justify-center px-4">
        <AnimatePresence mode="sync">
          {images.map((image, index) => {
            const isActive = index === activeIndex;
            const isPrev =
              index === (activeIndex - 1 + images.length) % images.length;
            const isNext = index === (activeIndex + 1) % images.length;
            const isFarPrev =
              index === (activeIndex - 2 + images.length) % images.length;
            const isFarNext = index === (activeIndex + 2) % images.length;

            let xOffset = 0;
            let yOffset = 0;
            let scale = 0.5;
            let zIndex = 0;
            let opacity = 0;
            let rotation = 0;
            let blur = 4;

            if (isActive) {
              xOffset = 0;
              yOffset = 0;
              scale = 1;
              zIndex = 40;
              opacity = 1;
              rotation = 0;
              blur = 0;
            } else if (isPrev) {
              xOffset = -200;
              yOffset = 20;
              scale = 0.8;
              zIndex = 30;
              opacity = 0.85;
              rotation = -6;
              blur = 0;
            } else if (isNext) {
              xOffset = 200;
              yOffset = 20;
              scale = 0.8;
              zIndex = 30;
              opacity = 0.85;
              rotation = 6;
              blur = 0;
            } else if (isFarPrev) {
              xOffset = -340;
              yOffset = 40;
              scale = 0.65;
              zIndex = 20;
              opacity = 0.5;
              rotation = -10;
              blur = 2;
            } else if (isFarNext) {
              xOffset = 340;
              yOffset = 40;
              scale = 0.65;
              zIndex = 20;
              opacity = 0.5;
              rotation = 10;
              blur = 2;
            }

            return (
              <motion.div
                key={index}
                className="absolute cursor-pointer"
                initial={false}
                animate={{
                  x: xOffset,
                  y: yOffset,
                  scale,
                  zIndex,
                  opacity,
                  rotateZ: rotation,
                  filter: `blur(${blur}px)`,
                }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 25,
                  mass: 0.8,
                }}
                onClick={() => handleImageClick(index)}
                whileHover={{
                  scale: isActive ? 1.03 : scale + 0.05,
                  y: isActive ? -5 : yOffset - 5,
                  transition: { duration: 0.2 },
                }}
              >
                <div
                  className={`relative overflow-hidden rounded-3xl transition-all duration-500 ${
                    isActive
                      ? "w-70 h-70 md:w-95 md:h-95 lg:w-105 lg:h-105"
                      : "w-50 h-50 md:w-65 md:h-65 lg:w-75 lg:h-75"
                  }`}
                  style={{
                    boxShadow: isActive
                      ? "0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--color-primary)"
                      : "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  {isActive && (
                    <>
                      <motion.div
                        className="absolute -inset-0.5 rounded-3xl z-0"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                        }}
                        animate={{
                          opacity: [0.4, 0.7, 0.4],
                        }}
                        transition={transitions.glow}
                      />
                      <div
                        className="absolute -inset-4 rounded-3xl opacity-40 blur-xl"
                        style={{
                          background:
                            "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)",
                        }}
                      />
                    </>
                  )}

                  <div className="relative w-full h-full z-10">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Community activity ${index + 1}`}
                      fill
                      className="object-cover"
                      loading="lazy"
                      sizes="(max-width: 768px) 200px, (max-width: 1024px) 260px, 300px"
                    />

                    <div
                      className="absolute inset-0"
                      style={{
                        background: isActive
                          ? "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)"
                          : "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)",
                      }}
                    />

                    {isActive && (
                      <motion.div
                        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background:
                            "linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
                          backgroundSize: "200% 200%",
                        }}
                      />
                    )}
                  </div>

                  {isActive && (
                    <motion.div
                      className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-20 px-4 py-2 rounded-full"
                      style={{
                        background: "rgba(0, 0, 0, 0.4)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {images.map((_, i) => (
                        <motion.button
                          key={i}
                          onClick={(e) => handleIndicatorClick(e, i)}
                          className="relative rounded-full transition-all duration-300"
                          style={{
                            width: i === activeIndex ? "28px" : "8px",
                            height: "8px",
                            background:
                              i === activeIndex
                                ? "linear-gradient(to right, var(--color-primary), var(--color-secondary))"
                                : "rgba(255, 255, 255, 0.4)",
                          }}
                          whileHover={{
                            scale: 1.2,
                            background:
                              i === activeIndex
                                ? "linear-gradient(to right, var(--color-primary), var(--color-secondary))"
                                : "rgba(255, 255, 255, 0.6)",
                          }}
                          aria-label={`View image ${i + 1}`}
                        />
                      ))}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <motion.div
        className="absolute -top-10 right-1/4 w-16 h-16 rounded-2xl backdrop-blur-sm pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary), transparent)",
          opacity: 0.15,
          border: "1px solid",
          borderColor: "var(--color-primary)",
        }}
        animate={decorativeVariants.floatingTop}
        transition={transitions.floating}
      />
      <motion.div
        className="absolute -bottom-8 left-1/4 w-14 h-14 rounded-full backdrop-blur-sm pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, var(--color-secondary), transparent)",
          opacity: 0.2,
          border: "1px solid",
          borderColor: "var(--color-secondary)",
        }}
        animate={decorativeVariants.floatingBottom}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: easeInOut,
          delay: 0.5,
        }}
      />

      <motion.div
        className="absolute top-1/4 -left-8 w-12 h-12 rounded-xl backdrop-blur-sm pointer-events-none"
        style={{
          background:
            "linear-gradient(45deg, var(--color-accent), transparent)",
          opacity: 0.1,
        }}
        animate={decorativeVariants.floatingLeft}
        transition={{
          duration: 7,
          repeat: Number.POSITIVE_INFINITY,
          ease: easeInOut,
          delay: 1,
        }}
      />
    </div>
  );
}
