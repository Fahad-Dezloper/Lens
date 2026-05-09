"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import {
  getOpenSourceContributions,
  searchUsers,
  RepoContribution,
  UserProfile,
} from "../actions";
import {
  Search,
  AlertCircle,
  Globe,
  User,
} from "lucide-react";
import { SearchForm } from "./SearchForm";
import { useSearch } from "./SearchContext";
import { UserCard } from "./UserCard";
import { ProjectDirectory } from "./ProjectDirectory";
import { DashboardSkeleton } from "./DashboardSkeleton";

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
    if (initialUsername && !initialData) {
      handleSubmit(undefined, initialUsername);
    } else if (initialData?.success) {
      setHasData(true);
      setIsSearching(false);
    }
  }, [initialUsername, initialData]);

  const handleSubmit = async (
    e?: React.FormEvent,
    selectedUsername?: string,
  ) => {
    if (e) e.preventDefault();
    const finalUsername = selectedUsername || username;
    if (!finalUsername.trim()) return;

    // Update URL
    const params = new URLSearchParams(searchParams);
    params.set("q", finalUsername.trim());
    router.push(`?${params.toString()}`, { scroll: false });

    setLoading(true);
    setError(null);
    setData(null);
    setUser(null);
    setHasData(false);
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

  const showHero = !hasData && !isSearching && !loading;

  return (
    <div className="w-full bg-[#0C1117] font-sans">
      <div
        className={`flex flex-col items-center w-full transition-all duration-500 ease-in-out ${showHero ? "justify-center min-h-[60vh] mt-[-5vh]" : ""}`}
      >
        {showHero && (
          <div className="flex flex-col items-center text-center">
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
          </div>
        )}

        {showHero && <SearchForm variant="hero" initialValue={username} />}
      </div>

      {(loading || isSearching) && !data && <DashboardSkeleton />}

      {error && (
        <div className="flex items-center gap-3 text-foreground bg-background px-6 py-4 border-2 border-foreground max-w-lg mx-auto mb-8">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {data && user && (
        <div className="flex flex-col md:flex-row gap-6 mt-12">
          <UserCard user={user} stats={stats} externalPrs={externalPrs} />
          <ProjectDirectory
            filteredData={filteredData}
            filter={filter}
            setFilter={setFilter}
            tabs={tabs}
            username={user.login}
          />
        </div>
      )}
    </div>
  );
}
