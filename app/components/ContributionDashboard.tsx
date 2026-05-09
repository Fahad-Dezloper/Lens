"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import {
  getOpenSourceContributions,
  searchUsers,
  RepoContribution,
  UserProfile,
} from "../actions";
import { Search, AlertCircle, Globe, User } from "lucide-react";
import { SearchForm } from "./SearchForm";
import { useSearch } from "./SearchContext";
import { UserCard } from "./UserCard";
import { ProjectDirectory } from "./ProjectDirectory";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { motion } from "motion/react";
import { useSearchParams, useRouter } from "next/navigation";
import { ActionResponse } from "../actions";

type FilterType = "all" | "external" | "owned";

export function ContributionDashboard({
  initialUsername,
  initialData,
}: {
  initialUsername?: string;
  initialData?: ActionResponse;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasData, setHasData, isSearching, setIsSearching } = useSearch();
  const [username, setUsername] = useState(initialUsername || "");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RepoContribution[] | null>(
    initialData?.data || null,
  );
  const [user, setUser] = useState<UserProfile | null>(
    initialData?.user || null,
  );
  const [error, setError] = useState<string | null>(initialData?.error || null);
  const [filter, setFilter] = useState<FilterType>("external");
  const [totalPrs, setTotalPrs] = useState<number | null>(
    initialData?.totalPrs || null,
  );
  const [externalPrs, setExternalPrs] = useState<number | null>(
    initialData?.externalPrs || null,
  );

  useEffect(() => {
    const query = searchParams.get("q");
    if (query && query !== user?.login) {
      handleSubmit(undefined, query);
    } else if (!query) {
      // Reset if no query
      setData(null);
      setUser(null);
      setHasData(false);
      setIsSearching(false);
    } else if (data) {
      setHasData(true);
      setIsSearching(false);
    }
  }, [searchParams]);

  const handleSubmit = async (
    e?: React.FormEvent,
    selectedUsername?: string,
  ) => {
    if (e) e.preventDefault();
    const finalUsername = selectedUsername || username;
    if (!finalUsername.trim()) return;

    const currentQuery = searchParams.get("q");
    if (currentQuery !== finalUsername.trim()) {
      const params = new URLSearchParams(searchParams);
      params.set("q", finalUsername.trim());
      router.push(`?${params.toString()}`, { scroll: false });
    }

    setLoading(true);
    setError(null);
    setData(null);
    setUser(null);
    // Don't setHasData(false) here if we are already in result mode
    setIsSearching(true);
    setFilter("external");
    setTotalPrs(null);
    setExternalPrs(null);
    if (selectedUsername) setUsername(selectedUsername);

    const result = await getOpenSourceContributions(finalUsername.trim());
    if (result.success && result.data) {
      setData(result.data);
      setUser(result.user || null);
      setTotalPrs(result.totalPrs || null);
      setExternalPrs(result.externalPrs || null);
      setHasData(true);
    } else {
      setError(result.error || "Something went wrong");
      setHasData(false);
    }
    setLoading(false);
    setIsSearching(false);
  };

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (filter === "external") return data.filter((repo) => repo.isExternal);
    if (filter === "owned") return data.filter((repo) => !repo.isExternal);
    return data;
  }, [data, filter]);

  const stats = useMemo(() => {
    if (!data) return null;
    return {
      totalRepos: data.length,
      externalRepos: data.filter((r) => r.isExternal).length,
      ownedRepos: data.filter((r) => !r.isExternal).length,
      topRepo: data[0]?.repoName,
    };
  }, [data]);

  const tabs = [
    {
      id: "external",
      label: "Contributions",
      icon: Globe,
      count: stats?.externalRepos,
    },
    { id: "owned", label: "My Projects", icon: User, count: stats?.ownedRepos },
  ];

  const showHero = !data && !isSearching && !loading && !error;

  return (
    <div className="w-full bg-[#0C1117] font-sans min-h-[80vh]">
      <div
        className={`flex flex-col items-center w-full ${showHero ? "justify-center min-h-[60vh] mt-[-5vh]" : ""}`}
      >
        {showHero && (
          <motion.div
            initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
            className="flex flex-col items-center text-center"
          >
            <h1 className="text-[40px] md:text-[76px] leading-[1.05] font-bold text-foreground tracking-tight mb-8 max-w-5xl">
              Explore people's
              <br />
              <span className="text-muted-foreground">
                open source contributions.
              </span>
            </h1>
            <p className="text-muted-foreground text-[16px] md:text-[19px] mb-12 font-medium max-w-2xl leading-relaxed">
              Visualize the open source impact of any GitHub developer.
            </p>
          </motion.div>
        )}

        {showHero && <SearchForm variant="hero" initialValue={username} />}
      </div>

      {(loading || isSearching) && !data && (
        <div className="w-full px-4">
          <DashboardSkeleton />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 text-foreground bg-background px-6 py-4 border-2 border-foreground max-w-lg mx-auto mb-8">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {data && user && (
        <div className="w-full px-4">
          <div className="flex flex-col md:flex-row gap-6 pb-20">
            <UserCard user={user} stats={stats} externalPrs={externalPrs} />
            <ProjectDirectory
              filteredData={filteredData}
              filter={filter}
              setFilter={setFilter}
              tabs={tabs}
              username={user.login}
            />
          </div>
        </div>
      )}
    </div>
  );
}
