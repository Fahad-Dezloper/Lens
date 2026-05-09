"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { searchUsers, UserProfile } from "../actions";
import { useSearch } from "./SearchContext";

interface SearchFormProps {
  variant: "hero" | "topbar";
  initialValue?: string;
  onSearch?: (username: string) => void;
}

export function SearchForm({ variant, initialValue = "", onSearch }: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { setIsSearching, setHasData } = useSearch();

  useEffect(() => {
    setUsername(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (username.length >= 2 && !loading) {
        const result = await searchUsers(username);
        if (result.success && result.users) {
          setSuggestions(result.users);
          setShowSuggestions(true);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [username, loading]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent, selectedUsername?: string) => {
    if (e) e.preventDefault();
    const finalUsername = selectedUsername || username;
    if (!finalUsername.trim()) return;

    setShowSuggestions(false);
    setIsSearching(true);
    setHasData(false);

    if (onSearch) {
      onSearch(finalUsername.trim());
    } else {
      const params = new URLSearchParams(searchParams);
      params.set("q", finalUsername.trim());
      router.push(`?${params.toString()}`, { scroll: false });
    }
  };

  const isHero = variant === "hero";

  return (
    <motion.div
      ref={searchRef}
      layoutId="main-search"
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`relative group w-full ${isHero ? "max-w-[560px]" : "max-w-[400px]"}`}
    >
      <form onSubmit={(e) => handleSubmit(e)} className="w-full">
        <div 
          className={`relative flex items-center bg-card border border-border rounded-xl transition-all hover:border-primary/30 focus-within:border-primary/50 focus-within:bg-muted/50 shadow-md
            ${isHero ? "h-[52px] pr-4 pl-4" : "h-[40px] pr-3 pl-3"}`}
        >
          <Search className={`${isHero ? "w-4 h-4" : "w-3.5 h-3.5"} text-muted-foreground mr-3`} />
          <input
            type="text"
            placeholder="Enter a GitHub username to explore..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onFocus={() => username.length >= 2 && setShowSuggestions(true)}
            className={`w-full bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground h-full font-medium
              ${isHero ? "text-[14px]" : "text-[13px]"}`}
            spellCheck={false}
          />
        </div>
      </form>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-muted/90 backdrop-blur-md border border-border rounded-xl overflow-hidden shadow-xl z-50"
          >
            <div className="p-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.login}
                  type="button"
                  onClick={() => handleSubmit(undefined, suggestion.login)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-foreground/5 rounded-lg transition-colors group text-left"
                >
                  <img
                    src={suggestion.avatarUrl}
                    alt={suggestion.login}
                    className="w-8 h-8 rounded-full border border-border"
                  />
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-foreground">
                      {suggestion.login}
                    </p>
                    <p className="text-[12px] text-muted-foreground">
                      View contributions
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
