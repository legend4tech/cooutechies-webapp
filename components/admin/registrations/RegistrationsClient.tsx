/**
 * Registrations Client Component
 * Handles client-side data fetching with TanStack Query
 */

"use client";

import { useState } from "react";
import { useCommunityRegistrations } from "@/hooks/tanstack-query/use-registrations";

import {
  Users,
  Mail,
  GraduationCap,
  MapPin,
  Calendar,
  Code,
  Target,
  MessageSquare,
  Sparkles,
  Building2,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AllRegistrationsError,
  AllRegistrationsSkeleton,
} from "./AllRegistrationsFallbacks";

const ITEMS_PER_PAGE = 10;

export function RegistrationsClient() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error, refetch } = useCommunityRegistrations(
    currentPage,
    ITEMS_PER_PAGE
  );

  // Helper function to display values, handling empty strings
  const displayValue = (value: string | undefined) => {
    return value && value.trim() !== "" ? value : "-";
  };

  // Helper function to check if value has content
  const hasContent = (value: string | undefined) => {
    return value && value.trim() !== "";
  };

  // Handle retry
  const handleRetry = () => {
    refetch();
  };

  // Show loading skeleton
  if (isLoading && currentPage === 1) {
    return <AllRegistrationsSkeleton />;
  }

  // Show error state
  if (error) {
    return <AllRegistrationsError error={error as Error} reset={handleRetry} />;
  }

  const registrations = data?.registrations ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.pages ?? 1;

  // Pagination handlers
  const canGoNext = currentPage < totalPages;
  const canGoPrev = currentPage > 1;

  const handleNextPage = () => {
    if (canGoNext) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (canGoPrev) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) {
        endPage = 4;
      }

      if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
      }

      if (startPage > 2) {
        pages.push("ellipsis-start");
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        pages.push("ellipsis-end");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  // Calculate display range
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, total);

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : registrations.length === 0 ? (
        <div className="glass rounded-2xl border-glow p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="p-4 rounded-2xl bg-muted/50 mb-4">
              <Users className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground text-sm font-medium">
              No registrations yet
            </p>
            <p className="text-muted-foreground/70 text-xs mt-1">
              Registrations will appear here once students join
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Registrations List */}
          {isLoading ? (
            <AllRegistrationsSkeleton />
          ) : (
            <div className="space-y-4">
              {registrations.map((registration, index) => (
                <div
                  key={registration._id}
                  className="glass rounded-xl overflow-hidden border-glow hover:shadow-xl transition-all duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Main Info Bar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-linear-to-r from-primary/5 via-transparent to-secondary/5 border-b border-border/30">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Avatar Circle */}
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary/30 to-secondary/30 flex items-center justify-center shrink-0 border-2 border-primary/20">
                        <span className="text-lg font-display font-bold text-gradient">
                          {registration.firstName[0]}
                          {registration.lastName[0]}
                        </span>
                      </div>

                      {/* Name and Email */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-display font-bold text-foreground mb-1">
                          {registration.firstName} {registration.lastName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{registration.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status and Date */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(registration.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30 whitespace-nowrap">
                        <Sparkles className="h-3 w-3" />
                        {registration.status}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
                      {/* Department */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10 shrink-0 mt-0.5">
                          <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Department
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {displayValue(registration.department)}
                          </p>
                        </div>
                      </div>

                      {/* Level */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-cyan-500/10 shrink-0 mt-0.5">
                          <GraduationCap className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Level
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {displayValue(registration.level)}
                          </p>
                        </div>
                      </div>

                      {/* Campus */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10 shrink-0 mt-0.5">
                          <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Campus
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {displayValue(registration.campus)}
                          </p>
                        </div>
                      </div>

                      {/* Tech Skills - Full Width */}
                      <div className="flex items-start gap-3 md:col-span-2 lg:col-span-3">
                        <div className="p-2 rounded-lg bg-green-500/10 shrink-0 mt-0.5">
                          <Code className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Current Tech Skills
                          </p>
                          <p className="text-sm text-foreground leading-relaxed">
                            {displayValue(registration.techSkills)}
                          </p>
                        </div>
                      </div>

                      {/* Aspiring Skills - Full Width */}
                      <div className="flex items-start gap-3 md:col-span-2 lg:col-span-3">
                        <div className="p-2 rounded-lg bg-orange-500/10 shrink-0 mt-0.5">
                          <Target className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Aspiring Skills
                          </p>
                          <p className="text-sm text-foreground leading-relaxed">
                            {displayValue(registration.aspiringSkills)}
                          </p>
                        </div>
                      </div>

                      {/* Reason - Full Width with Special Styling */}
                      <div className="flex items-start gap-3 md:col-span-2 lg:col-span-3 p-4 rounded-lg bg-muted/30 border border-border/30">
                        <div className="p-2 rounded-lg bg-primary/10 shrink-0 mt-0.5">
                          <MessageSquare className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            Reason for Joining
                          </p>
                          <p className="text-sm text-foreground leading-relaxed">
                            {displayValue(registration.reason)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Date */}
                    <div className="sm:hidden mt-4 pt-4 border-t border-border/30">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        Registered on{" "}
                        {new Date(registration.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="glass rounded-2xl p-6 border-glow mt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Page info */}
                <p className="text-xs text-muted-foreground">
                  Showing {startIndex} to {endIndex} of {total} registrations
                </p>

                {/* Pagination */}
                <Pagination>
                  <PaginationContent>
                    {/* Previous Button */}
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={handlePrevPage}
                        className={
                          !canGoPrev
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {/* Page Numbers */}
                    {getPageNumbers().map((page, index) => {
                      if (typeof page === "string") {
                        return (
                          <PaginationItem key={`${page}-${index}`}>
                            <span className="px-2 text-muted-foreground">
                              ...
                            </span>
                          </PaginationItem>
                        );
                      }

                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageClick(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    {/* Next Button */}
                    <PaginationItem>
                      <PaginationNext
                        onClick={handleNextPage}
                        className={
                          !canGoNext
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
