"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface SearchContextType {
  hasData: boolean;
  setHasData: (hasData: boolean) => void;
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [hasData, setHasData] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setHasData(true);
      setSearchQuery(q);
    }
  }, [searchParams]);

  return (
    <SearchContext.Provider
      value={{
        hasData,
        setHasData,
        isSearching,
        setIsSearching,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
