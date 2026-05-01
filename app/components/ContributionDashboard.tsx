"use client";

import { useEffect, useState, useMemo, useRef } from 'react';
import { getOpenSourceContributions, searchUsers, RepoContribution, UserProfile } from '../actions';
import { 
  Search, Loader2, GitPullRequest, AlertCircle, 
  LayoutGrid, Globe, User, ExternalLink, Code2,
  TrendingUp, Layers, Milestone, UserCircle
} from 'lucide-react';
import { RepoCard } from './RepoCard';

type FilterType = 'all' | 'external' | 'owned';

export function ContributionDashboard() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RepoContribution[] | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [totalPrs, setTotalPrs] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLFormElement>(null);

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
    
    setLoading(true);
    setError(null);
    setData(null);
    setUser(null);
    setFilter('all');
    setTotalPrs(null);
    setSuggestions([]);
    setShowSuggestions(false);
    if (selectedUsername) setUsername(selectedUsername);
    
    const result = await getOpenSourceContributions(finalUsername.trim());
    if (result.success && result.data) {
      setData(result.data);
      setUser(result.user || null);
      setTotalPrs(result.totalPrs || null);
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
    { id: 'all', label: 'Overview', icon: LayoutGrid, count: data?.length },
    { id: 'external', label: 'Contributions', icon: Globe, count: stats?.externalRepos },
    { id: 'owned', label: 'My Projects', icon: User, count: stats?.ownedRepos },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 px-4 sm:px-6">
      <div className="flex flex-col items-center justify-center space-y-8 pt-16 lg:pt-32">
        
        <div className="text-center space-y-4">
          <h1 
            className="font-pixel text-5xl md:text-7xl  font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-600"
          >
           Open Source Contributions
          </h1>
          <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto font-light leading-tight">
            Track people's open source contributions. <br /> Bringing peace through code.
          </p>
        </div>

        <form 
          onSubmit={(e) => handleSubmit(e)}
          className="w-full max-w-xl relative group"
          ref={searchRef}
        >
          <div className="relative flex items-center bg-white border border-zinc-200 rounded-[2rem] p-1.5 focus-within:border-indigo-500/40 transition-all duration-500 shadow-sm z-50">
            <div className="pl-4 pr-2">
              <Search className="w-5 h-5 text-zinc-400" />
            </div>
            <input
              type="text"
              placeholder="Enter GitHub username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => username.length >= 2 && setShowSuggestions(true)}
              className="w-full bg-transparent border-none outline-none text-zinc-900 text-lg py-3 placeholder:text-zinc-300"
              spellCheck={false}
            />
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-full font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg shadow-indigo-500/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze'}
            </button>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-200 rounded-3xl shadow-xl overflow-hidden z-40">
              <div className="p-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.login}
                    type="button"
                    onClick={() => handleSubmit(undefined, suggestion.login)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-zinc-50 rounded-2xl transition-colors group text-left"
                  >
                    <img 
                      src={suggestion.avatarUrl} 
                      alt={suggestion.login} 
                      className="w-10 h-10 rounded-full border border-zinc-200"
                    />
                    <div className="flex-1">
                      <p className="text-zinc-900 font-semibold">{suggestion.login}</p>
                      <p className="text-zinc-400 text-xs">View contributions</p>
                    </div>
                    <UserCircle className="w-5 h-5 text-zinc-300 group-hover:text-indigo-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>

      {error && (
        <div className="flex items-center gap-3 text-red-400 bg-red-400/5 px-6 py-4 rounded-2xl border border-red-400/10 max-w-lg mx-auto">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {data && user && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 glass-panel rounded-[2rem] p-8 flex flex-col items-center text-center space-y-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-10 group-hover:opacity-20 transition-opacity" />
                <img 
                  src={user.avatarUrl} 
                  alt={user.login}
                  className="w-24 h-24 rounded-full border-2 border-white relative z-10 shadow-md"
                />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-zinc-900">{user.login}</h2>
                  <a 
                    href={user.htmlUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1.5 text-sm"
                  >
                    <Code2 className="w-4 h-4" />
                    github.com/{user.login}
                    <ExternalLink className="w-3 h-3" />
                  </a>
              </div>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  Open Source Explorer
                </span>
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <StatCard 
                label="Merged PRs" 
                value={totalPrs || 0} 
                icon={TrendingUp} 
                color="indigo" 
                delay={0.2} 
              />
              <StatCard 
                label="External Projects" 
                value={stats?.externalRepos || 0} 
                icon={Globe} 
                color="emerald" 
                delay={0.3} 
              />
              <StatCard 
                label="Owned Repos" 
                value={stats?.ownedRepos || 0} 
                icon={Milestone} 
                color="amber" 
                delay={0.4} 
              />
            </div>

            <div className="lg:col-span-12 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
                <div className="flex p-1.5 space-x-1 bg-white/5 rounded-2xl border border-white/5 w-fit">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = filter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id as FilterType)}
                        className={`relative px-6 py-2.5 text-sm font-semibold rounded-[0.85rem] transition-all outline-none flex items-center gap-3
                          ${isActive ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
                      >
                        {isActive && (
                          <div
                            className="absolute inset-0 bg-white border border-zinc-200 rounded-[0.85rem] shadow-sm"
                          />
                        )}
                        <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-indigo-600' : ''}`} />
                        <span className="relative z-10">{tab.label}</span>
                        {tab.count !== undefined && (
                          <span className={`relative z-10 px-1.5 py-0.5 rounded-md text-[10px] ${isActive ? 'bg-indigo-50 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                <div className="text-sm font-medium text-zinc-400">
                  Showing <span className="text-zinc-900">{filteredData.length}</span> contributions 
                  in <span className="text-zinc-900">{filter === 'all' ? 'total' : filter}</span> category
                </div>
              </div>

              <div className="min-h-[400px]">
                {filteredData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredData.map((repo, index) => (
                      <RepoCard key={repo.id} repo={repo} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-32 text-center space-y-4 glass-panel rounded-[2rem]">
                    <div className="bg-zinc-100 p-4 rounded-2xl">
                      <Layers className="w-8 h-8 text-zinc-300" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-zinc-600 font-medium">No contributions found</p>
                      <p className="text-zinc-400 text-sm max-w-xs">We couldn't find any merged pull requests matching this specific filter.</p>
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

function StatCard({ label, value, icon: Icon, color, delay }: { label: string, value: number, icon: any, color: string, delay: number }) {
  const colorMap: Record<string, string> = {
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  };

  return (
    <div className="glass-panel rounded-[2rem] p-8 flex flex-col justify-between group">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorMap[color]} border transition-transform group-hover:scale-110 duration-500`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-1 mt-6">
        <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider">{label}</p>
        <p className="text-4xl font-bold text-zinc-900 tabular-nums">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}
