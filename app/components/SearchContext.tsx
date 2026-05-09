"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface SearchContextType {
  hasData: boolean;
  setHasData: (hasData: boolean) => void;
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [hasData, setHasData] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchParams.get("q")) {
      setHasData(true);
    }
  }, []);

  return (
    <SearchContext.Provider
      value={{ hasData, setHasData, isSearching, setIsSearching }}
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
