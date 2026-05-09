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

export function SearchForm({
  variant,
  initialValue = "",
  onSearch,
}: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { setIsSearching, setHasData } = useSearch();

  const [selectedIndex, setSelectedIndex] = useState(0);

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
          setSelectedIndex(0);
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
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (prev) => (prev - 1 + suggestions.length) % suggestions.length,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(undefined, suggestions[selectedIndex].login);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} className="text-foreground font-bold">
              {part}
            </span>
          ) : (
            <span key={i} className="opacity-50">
              {part}
            </span>
          ),
        )}
      </>
    );
  };

  const isHero = variant === "hero";

  return (
    <motion.div
      ref={searchRef}
      layoutId="main-search"
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`relative group w-full z-40 ${isHero ? "max-w-[560px]" : "max-w-[400px]"}`}
    >
      <form onSubmit={(e) => handleSubmit(e)} className="w-full">
        <div className="flex items-center w-full">
          <div className="block w-full">
            <motion.span
              layoutId="search-input-wrapper"
              className={`flex items-center px-3 py-0 text-[#f0f6fb] rounded-md border border-[#3d444d] shadow-[inset_0_1px_0_rgba(1,4,9,0.24)] transition-all focus-within:border-[#4493F8] focus-within:ring-1 focus-within:ring-[#4493F8]
                ${isHero ? "h-11 text-base bg-[#0d1117]" : "h-10 text-sm bg-transparent"}`}
            >
              <span className="mr-3 text-[#9198a1] flex items-center">
                <svg
                  className={`${isHero ? "w-4 h-4" : "w-4 h-4"} fill-current`}
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path d="M10.68 11.74a6 6 0 1 1 1.06-1.06l3.28 3.28a.75.75 0 1 1-1.06 1.06l-3.28-3.28ZM11 7a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z"></path>
                </svg>
              </span>

              <motion.input
                layoutId="search-input-field"
                type="text"
                placeholder="Enter a GitHub username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => username.length >= 2 && setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                className="block w-full bg-transparent border-none text-[#f0f6fb] focus:outline-none placeholder-[#9198a1] py-px font-medium"
                spellCheck={false}
              />

              <motion.span
                layoutId="search-shortcut-wrapper"
                className="flex items-center text-[#9198a1] ml-2"
              >
                <kbd className="relative inline-block rounded-md">
                  <span
                    className={`inline-flex items-center justify-center rounded-md border border-[#3d444d] bg-transparent opacity-60
                      ${isHero ? "p-1.5 w-6 h-6 text-[13px]" : "p-1 w-5 h-5 text-[11px]"}`}
                  >
                    <span>/</span>
                  </span>
                </kbd>
              </motion.span>
            </motion.span>
          </div>
        </div>
      </form>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#0d1117] border border-[#30363d] rounded-xl overflow-hidden shadow-2xl z-50 p-2"
          >
            {suggestions.map((suggestion, index) => {
              const isActive = index === selectedIndex;
              return (
                <button
                  key={suggestion.login}
                  type="button"
                  onClick={() => handleSubmit(undefined, suggestion.login)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all group text-left border-2
                    ${isActive ? "bg-[#161b22] border-[#4493F8]" : "bg-transparent border-transparent"}`}
                >
                  <div className="w-6 h-6 rounded bg-[#30363d] flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={suggestion.avatarUrl}
                      alt={suggestion.login}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <p
                      className={`text-sm font-medium ${isActive ? "text-[#f0f6fb]" : "text-[#9198a1]"}`}
                    >
                      {highlightMatch(suggestion.login, username)}
                    </p>
                    {isActive && (
                      <span className="ml-auto text-[10px] text-[#9198a1] font-mono border border-[#3d444d] rounded px-1 py-0.5">
                        Jump to
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
