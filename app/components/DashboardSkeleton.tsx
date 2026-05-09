"use client";

import React from "react";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-6 mt-12 animate-pulse">
      {/* User Card Skeleton */}
      <div className="flex flex-col gap-6 w-full md:w-[350px] shrink-0">
        <div className="border border-border p-8 flex flex-col items-center space-y-6 bg-card rounded-xl">
          <div className="w-32 h-32 bg-muted rounded-full" />
          <div className="space-y-3 w-full">
            <div className="h-8 bg-muted rounded w-3/4 mx-auto" />
            <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
            <div className="h-20 bg-muted rounded w-full" />
            <div className="flex justify-center gap-2">
              <div className="h-8 bg-muted rounded w-20" />
              <div className="h-8 bg-muted rounded w-20" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 border border-border bg-card rounded-xl p-6" />
          ))}
        </div>
      </div>

      {/* Project Directory Skeleton */}
      <div className="flex flex-col w-full gap-6">
        <div className="h-10 bg-muted rounded w-48" />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 border border-border bg-card rounded-xl p-6" />
          ))}
        </div>
      </div>
    </div>
  );
}
