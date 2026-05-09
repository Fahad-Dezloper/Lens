"use client";
import React from "react";
import { ModeToggle } from "./ThemeToggler";
import { SearchForm } from "./SearchForm";
import { useSearch } from "./SearchContext";
import { useSearchParams } from "next/navigation";

const Topbar = () => {
  const { hasData, isSearching } = useSearch();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  return (
    <div className="w-full px-6 py-4 bg-[#020408] border-b border-border flex justify-between items-center text-sm transition-colors duration-300">
      <div className="flex items-center gap-3 text-foreground shrink-0">
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5 text-primary"
        >
          <path d="M12 2L22 20H2L12 2Z" />
        </svg>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium">GitLens</span>
      </div>

      <div className="flex-1 flex justify-center px-8">
        {(hasData || isSearching) && <SearchForm variant="topbar" initialValue={query} />}
      </div>

      <div className="flex gap-4 items-center text-muted-foreground shrink-0">
        <ModeToggle />
      </div>
    </div>
  );
};

export default Topbar;
