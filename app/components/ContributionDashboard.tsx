"use client";

import { useEffect, useState, useMemo, useRef } from 'react';
import { getOpenSourceContributions, searchUsers, RepoContribution, UserProfile } from '../actions';
import { 
  Search, Loader2, GitPullRequest, AlertCircle, 
  LayoutGrid, Globe, User, ExternalLink, Code2,
  TrendingUp, Layers, Milestone, UserCircle,
  MapPin, Building2, Users, Award, Calendar, ChevronRight,
  Mail, Link as LinkIcon
} from 'lucide-react';
import { RepoCard } from './RepoCard';

import { useSearchParams, useRouter } from 'next/navigation';
import { ActionResponse } from '../actions';

type FilterType = 'all' | 'external' | 'owned';

export function ContributionDashboard({ initialUsername, initialData }: { initialUsername?: string, initialData?: ActionResponse }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState(initialUsername || '');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RepoContribution[] | null>(initialData?.data || null);
  const [user, setUser] = useState<UserProfile | null>(initialData?.user || null);
  const [error, setError] = useState<string | null>(initialData?.error || null);
  const [filter, setFilter] = useState<FilterType>('external');
  const [totalPrs, setTotalPrs] = useState<number | null>(initialData?.totalPrs || null);
  const [externalPrs, setExternalPrs] = useState<number | null>(initialData?.externalPrs || null);
  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (initialUsername && !initialData) {
      handleSubmit(undefined, initialUsername);
    }
  }, [initialUsername, initialData]);

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

  const handleSubmit = async (e?: React.FormEvent, selectedUsername?: string) => {
    if (e) e.preventDefault();
    const finalUsername = selectedUsername || username;
    if (!finalUsername.trim()) return;

    // Update URL
    const params = new URLSearchParams(searchParams);
    params.set('q', finalUsername.trim());
    router.push(`?${params.toString()}`, { scroll: false });
    
    setLoading(true);
    setError(null);
    setData(null);
    setUser(null);
    setFilter('external');
    setTotalPrs(null);
    setExternalPrs(null);
    setSuggestions([]);
    setShowSuggestions(false);
    if (selectedUsername) setUsername(selectedUsername);
    
    const result = await getOpenSourceContributions(finalUsername.trim());
    if (result.success && result.data) {
      setData(result.data);
      setUser(result.user || null);
      setTotalPrs(result.totalPrs || null);
      setExternalPrs(result.externalPrs || null);
    } else {
      setError(result.error || 'Something went wrong');
    }
    setLoading(false);
  };

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (filter === 'external') return data.filter(repo => repo.isExternal);
    if (filter === 'owned') return data.filter(repo => !repo.isExternal);
    return data;
  }, [data, filter]);

  const stats = useMemo(() => {
    if (!data) return null;
    return {
      totalRepos: data.length,
      externalRepos: data.filter(r => r.isExternal).length,
      ownedRepos: data.filter(r => !r.isExternal).length,
      topRepo: data[0]?.repoName
    };
  }, [data]);

  const tabs = [
    { id: 'external', label: 'Contributions', icon: Globe, count: stats?.externalRepos },
    { id: 'owned', label: 'My Projects', icon: User, count: stats?.ownedRepos },
  ];

  return (
    <div className="w-full">
      <div className='flex flex-col md:flex-row justify-between mb-12 items-start md:items-center w-full gap-4'>
        <p className="text-foreground text-sm font-black uppercase tracking-widest border-l-4 border-foreground pl-4">
          CONTRIBUTION TRACKER // OPEN SOURCE UTILITY
        </p>

        <form 
          onSubmit={(e) => handleSubmit(e)}
          className="w-full max-w-md relative group"
          ref={searchRef}
        >
          <div className="relative flex items-center bg-background border-2 border-foreground pr-4 pl-2 transition-colors">
            <div className="pl-2 pr-4">
              <Search className="w-5 h-5 text-foreground" />
            </div>
            <input
              type="text"
              placeholder="ENTER GITHUB USERNAME..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => username.length >= 2 && setShowSuggestions(true)}
              className="w-full bg-transparent border-none outline-none text-foreground text-sm py-3 placeholder:text-foreground/30 font-black uppercase tracking-tighter"
              spellCheck={false}
            />
            <kbd className="bg-foreground text-background pointer-events-none hidden h-5 items-center gap-1 border border-foreground px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex">
              <span className="text-xs">⌘</span>F
            </kbd>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-background border-2 border-foreground shadow-none z-40">
              <div className="p-1">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.login}
                    type="button"
                    onClick={() => handleSubmit(undefined, suggestion.login)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-foreground hover:text-background transition-colors group text-left border border-transparent hover:border-foreground"
                  >
                    <img 
                      src={suggestion.avatarUrl} 
                      alt={suggestion.login} 
                      className="w-10 h-10 border border-foreground grayscale"
                    />
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-tighter">{suggestion.login}</p>
                      <p className="text-[8px] font-bold opacity-50 uppercase">VIEW CONTRIBUTIONS</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>

      {error && (
        <div className="flex items-center gap-3 text-foreground bg-background px-6 py-4 border-2 border-foreground max-w-lg mx-auto mb-8">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {data && user && (
        <div className="flex flex-col  md:flex-row gap-6">
          <div className='flex flex-col gap-6 w-full md:w-[350px] shrink-0'>
            <div className="border-2 border-foreground p-8 flex flex-col items-center text-center space-y-6 bg-background relative">
              <div className="relative">
                <img 
                  src={user.avatarUrl} 
                  alt={user.login}
                  className="w-32 h-32 border-2 border-foreground grayscale"
                />
              </div>

              <div className="space-y-3 w-full">
                <div className="space-y-1">
                  {user.name && <h1 className="text-2xl font-bold text-foreground uppercase tracking-tighter leading-none">{user.name}</h1>}
                  <h2 className="text-lg font-medium text-muted-foreground">@{user.login}</h2>
                </div>

                {user.bio && (
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto px-4 border-t border-b border-foreground/10 py-2">
                    {user.bio}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <a 
                    href={user.htmlUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-foreground hover:bg-foreground hover:text-background transition-colors flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase border border-foreground px-3 py-1.5"
                  >
                    <Code2 className="w-3 h-3" />
                    GitHub
                  </a>

                  {user.twitterUsername && (
                    <a 
                      href={`https://x.com/${user.twitterUsername}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-foreground hover:bg-foreground hover:text-background transition-colors flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase border border-foreground px-3 py-1.5"
                    >
                      Twitter
                    </a>
                  )}

                  {user.blog && (
                    <a 
                      href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-foreground hover:bg-foreground hover:text-background transition-colors flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase border border-foreground px-3 py-1.5"
                    >
                      Website
                    </a>
                  )}

                  {user.email && (
                    <a 
                      href={`mailto:${user.email}`}
                      className="text-foreground hover:bg-foreground hover:text-background transition-colors flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase border border-foreground px-3 py-1.5"
                    >
                      Email
                    </a>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 w-full pt-4 border-t border-foreground">
                {user.location && (
                  <div className="flex items-center gap-2 text-[10px] text-foreground font-bold uppercase">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{user.location}</span>
                  </div>
                )}
                {user.company && (
                  <div className="flex items-center gap-2 text-[10px] text-foreground font-bold uppercase">
                    <Building2 className="w-3 h-3" />
                    <span className="truncate">{user.company}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-[10px] text-foreground font-bold uppercase">
                  <Users className="w-3 h-3" />
                  <span>{user.followers?.toLocaleString()} followers</span>
                </div>
              </div>

              {user.organizations && user.organizations.length > 0 && (
                <div className="w-full space-y-3 pt-4 border-t border-foreground">
                  <p className="text-[10px] font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                    Organizations
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {user.organizations.map((org) => (
                      <a 
                        key={org.login}
                        href={`https://github.com/${org.login}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="grayscale hover:grayscale-0 transition-all"
                        title={org.login}
                      >
                        <img 
                          src={org.avatarUrl} 
                          alt={org.login}
                          className="w-8 h-8 border border-foreground"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {user.achievements && user.achievements.length > 0 && (
                <div className="w-full space-y-3 pt-4 border-t border-foreground">
                  <p className="text-[10px] font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                    Achievements
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {user.achievements.map((achievement) => (
                      <div key={achievement.name} className="relative grayscale hover:grayscale-0 transition-all" title={achievement.name}>
                        <img 
                          src={achievement.iconUrl} 
                          alt={achievement.name}
                          className="w-10 h-10"
                        />
                        {achievement.count && achievement.count > 1 && (
                          <span className="absolute -bottom-1 -right-1 bg-foreground text-background text-[8px] font-black px-1 border border-background">
                            x{achievement.count}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <StatCard 
                label="External PRs" 
                value={externalPrs || 0} 
                icon={TrendingUp} 
              />
              <StatCard 
                label="External Projects" 
                value={stats?.externalRepos || 0} 
                icon={Globe} 
              />
              <StatCard 
                label="Owned Repos" 
                value={stats?.ownedRepos || 0} 
                icon={Milestone} 
              />
            </div>
          </div>

          <div className='flex flex-col w-full gap-6'>
            <div className="flex border-2 border-foreground w-fit bg-background p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = filter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id as FilterType)}
                    className={`px-4 py-2 text-[10px] font-black uppercase transition-colors flex items-center gap-2
                      ${isActive ? 'bg-foreground text-background' : 'text-foreground hover:bg-foreground/10'}`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`px-1 border ${isActive ? 'border-background bg-background text-foreground' : 'border-foreground bg-foreground text-background'}`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className='w-full grid grid-cols-1 xl:grid-cols-2 gap-4'>
              {filteredData.length > 0 ? (
                filteredData.map((repo, index) => (
                  <RepoCard key={repo.id} repo={repo} index={index} username={user.login} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 border-2 border-foreground bg-background">
                  <Layers className="w-12 h-12 text-foreground/20" />
                  <div className="space-y-1">
                    <p className="text-foreground font-black uppercase text-sm">No contributions found</p>
                    <p className="text-muted-foreground text-[10px] max-w-xs uppercase">Filter returned 0 results</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string, value: number, icon: any }) {
  return (
    <div className="border-2 border-foreground p-6 flex flex-col justify-between bg-background group hover:bg-foreground hover:text-background transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest">{label}</p>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-3xl font-black tabular-nums mt-4">{value.toLocaleString()}</p>
    </div>
  );
}
