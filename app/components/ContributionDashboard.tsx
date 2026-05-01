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
import { motion } from "motion/react"

type FilterType = 'all' | 'external' | 'owned';

export function ContributionDashboard() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RepoContribution[] | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [totalPrs, setTotalPrs] = useState<number | null>(null);
  const [externalPrs, setExternalPrs] = useState<number | null>(null);
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
    { id: 'all', label: 'Overview', icon: LayoutGrid, count: data?.length },
    { id: 'external', label: 'Contributions', icon: Globe, count: stats?.externalRepos },
    { id: 'owned', label: 'My Projects', icon: User, count: stats?.ownedRepos },
  ];

  return (
    <div className="w-full ">

      <div className='flex justify-between mb-8 items-center w-full'>
          <p className="text-zinc-500 text-lg md:text-xl font-light leading-tight">
            Track people's open source contributions.
          </p>

 <form 
          onSubmit={(e) => handleSubmit(e)}
          className="w-full max-w-md relative group"
          ref={searchRef}
        >
          <div className="relative flex items-center bg-card border border-border pr-4 pl-2 rounded-sm focus-within:border-primary/40 transition-all duration-500 shadow-sm z-50">
            <div className="pl-2 pr-4">
              <Search className="w-5 h-5 text-zinc-400" />
            </div>
            <input
              type="text"
              placeholder="Enter GitHub username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => username.length >= 2 && setShowSuggestions(true)}
              className="w-full bg-transparent border-none outline-none text-zinc-900 text-lg py-2 placeholder:text-zinc-300"
              spellCheck={false}
            />
            {/* <button
              type="submit"
              disabled={loading || !username.trim()}
              className="bg-primary hover:bg-primary/90 whitespace-nowrap text-primary-foreground px-4 py-2 rounded-sm font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg shadow-primary/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Fetch'}
            </button> */}

            <kbd className="bg-muted pointer-events-none hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex"><span className="text-xs">⌘</span>F</kbd>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-3xl shadow-xl overflow-hidden z-40">
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

      {/* <motion.div className="flex flex-col items-center space-y-8 mb-12 pt-16 lg:pt-14">
        
        <div className="text-center space-y-4">
          <h1 
            className="font-pixel text-5xl md:text-7xl  font-bold tracking-tighter dark:text-[#FDFBF2]"
          >
           Open Source Contributions
          </h1>
          <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto font-light leading-tight">
            Track people's open source contributions.
          </p>
        </div>

        <form 
          onSubmit={(e) => handleSubmit(e)}
          className="w-full max-w-lg relative group"
          ref={searchRef}
        >
          <div className="relative flex items-center bg-card border border-border rounded-sm p-1 focus-within:border-primary/40 transition-all duration-500 shadow-sm z-50">
            <div className="pl-2 pr-4">
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
              className="bg-primary hover:bg-primary/90 whitespace-nowrap text-primary-foreground px-4 py-2 rounded-sm font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg shadow-primary/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Fetch'}
            </button>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-3xl shadow-xl overflow-hidden z-40">
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
      </motion.div> */}

      {error && (
        <div className="flex items-center gap-3 text-red-400 bg-red-400/5 px-6 py-4 rounded-2xl border border-red-400/10 max-w-lg mx-auto">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {data && user && (
        <div className="flex gap-6">
          <div className='flex flex-col gap-6 w-[35vw]'>
            <div className="lg:col-span-4 glass-panel rounded-[2.5rem] p-8 flex flex-col items-center text-center space-y-6 relative overflow-hidden group">
              {/* Background gradient effect */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
              
              <div className="relative group">
                <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
                <img 
                  src={user.avatarUrl} 
                  alt={user.login}
                  className="w-32 h-32 rounded-full border-4 border-white relative z-10 shadow-2xl transition-transform duration-700 "
                />
              </div>

              <div className="space-y-3 w-full">
                <div className="space-y-1">
                  {user.name && <h1 className="text-3xl font-black text-zinc-900 tracking-tight leading-none">{user.name}</h1>}
                  <h2 className="text-xl font-medium text-zinc-500">@{user.login}</h2>
                </div>

                {user.bio && (
                  <p className="text-sm text-zinc-600 leading-relaxed max-w-xs mx-auto italic px-4">
                    "{user.bio}"
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <a 
                    href={user.htmlUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group/link text-zinc-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-1.5 text-xs font-medium bg-zinc-50 hover:bg-indigo-50 px-3 py-1.5 rounded-full border border-zinc-100 hover:border-indigo-100"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    GitHub
                    <ExternalLink className="w-2.5 h-2.5 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                  </a>

                  {user.twitterUsername && (
                    <a 
                      href={`https://x.com/${user.twitterUsername}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group/link text-zinc-400 hover:text-sky-500 transition-all flex items-center justify-center gap-1.5 text-xs font-medium bg-zinc-50 hover:bg-sky-50 px-3 py-1.5 rounded-full border border-zinc-100 hover:border-sky-100"
                    >
                      {/* <Twitter className="w-3.5 h-3.5" /> */}
                      Twitter
                      <ExternalLink className="w-2.5 h-2.5 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                    </a>
                  )}

                  {user.blog && (
                    <a 
                      href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group/link text-zinc-400 hover:text-emerald-500 transition-all flex items-center justify-center gap-1.5 text-xs font-medium bg-zinc-50 hover:bg-emerald-50 px-3 py-1.5 rounded-full border border-zinc-100 hover:border-emerald-100"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      Website
                      <ExternalLink className="w-2.5 h-2.5 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                    </a>
                  )}

                  {user.email && (
                    <a 
                      href={`mailto:${user.email}`}
                      className="group/link text-zinc-400 hover:text-amber-500 transition-all flex items-center justify-center gap-1.5 text-xs font-medium bg-zinc-50 hover:bg-amber-50 px-3 py-1.5 rounded-full border border-zinc-100 hover:border-amber-100"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Email
                      <ExternalLink className="w-2.5 h-2.5 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Profile Metadata */}
              <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-zinc-100/50">
                {user.location && (
                  <div className="flex items-center gap-2 text-xs text-zinc-500 justify-center">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="truncate">{user.location}</span>
                  </div>
                )}
                {user.company && (
                  <div className="flex items-center gap-2 text-xs text-zinc-500 justify-center">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="truncate">{user.company}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-zinc-500 justify-center">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>{user.followers?.toLocaleString()} followers</span>
                </div>
              </div>

              {/* Organizations */}
              {user.organizations && user.organizations.length > 0 && (
                <div className="w-full space-y-3 pt-4 border-t border-zinc-100/50">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 px-2">
                    <Building2 className="w-3 h-3" />
                    Organizations
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 px-2">
                    {user.organizations.map((org) => (
                      <a 
                        key={org.login}
                        href={`https://github.com/${org.login}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/org relative"
                        title={org.login}
                      >
                        <div className="absolute -inset-1 bg-indigo-500/20 rounded-lg blur opacity-0 group-hover/org:opacity-100 transition-opacity" />
                        <img 
                          src={org.avatarUrl} 
                          alt={org.login}
                          className="w-10 h-10 rounded-lg border border-zinc-100 bg-white relative z-10 transition-transform group-hover/org:scale-110"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* GitHub Achievements */}
              {user.achievements && user.achievements.length > 0 && (
                <div className="w-full space-y-3 pt-4 border-t border-zinc-100/50">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 px-2">
                    <Award className="w-3 h-3" />
                    Achievements
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 px-2">
                    {user.achievements.map((achievement) => (
                      <div key={achievement.name} className="relative group/achievement" title={achievement.name}>
                        <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-md opacity-0 group-hover/achievement:opacity-100 transition-opacity" />
                        <img 
                          src={achievement.iconUrl} 
                          alt={achievement.name}
                          className="w-14 h-14 relative z-10 transition-transform duration-500 group-hover/achievement:scale-115 group-hover/achievement:-rotate-6"
                        />
                        {achievement.count && achievement.count > 1 && (
                          <span className="absolute -bottom-1 -right-1 bg-zinc-900 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-lg z-20">
                            x{achievement.count}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <StatCard 
                label="External PRs" 
                value={externalPrs || 0} 
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
            </div>

             <div className='flex flex-col w-full'>
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
             <div className='w-full grid grid-cols-2 gap-2 h-fit'>
                  {filteredData.length > 0 ? (
                    filteredData.map((repo, index) => (
                      <RepoCard key={repo.id} repo={repo} index={index} />
                    ))
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
