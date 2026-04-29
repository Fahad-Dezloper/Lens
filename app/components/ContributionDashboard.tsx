"use client";

import { useState, useMemo } from 'react';
import { getOpenSourceContributions, RepoContribution, UserProfile } from '../actions';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Loader2, GitPullRequest, AlertCircle, 
  LayoutGrid, Globe, User, ExternalLink, Code2,
  TrendingUp, Layers, Milestone
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    setLoading(true);
    setError(null);
    setData(null);
    setUser(null);
    setFilter('all');
    setTotalPrs(null);
    
    const result = await getOpenSourceContributions(username.trim());
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
      {/* Platform Header */}
      <div className="flex flex-col items-center justify-center space-y-8 pt-16 lg:pt-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
          <div className="relative bg-white/5 p-5 rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-sm">
            <GitPullRequest className="w-14 h-14 text-indigo-400" />
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.215, 0.61, 0.355, 1] }}
          className="text-center space-y-4"
        >
          <h1 
            className="font-jersey text-5xl md:text-7xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40"
          >
            OSS Platform
          </h1>
          <p className="text-white/40 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            The professional dashboard for open-source impact. Track, filter, and analyze code contributions across the global ecosystem.
          </p>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
          onSubmit={handleSubmit}
          className="w-full max-w-xl relative group"
        >
          <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
          <div className="relative flex items-center bg-white/5 border border-white/10 rounded-[2rem] p-1.5 focus-within:border-indigo-500/40 focus-within:bg-white/10 transition-all duration-500 backdrop-blur-md">
            <div className="pl-4 pr-2">
              <Search className="w-5 h-5 text-white/30" />
            </div>
            <input
              type="text"
              placeholder="Enter GitHub username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-white text-lg py-3 placeholder:text-white/20"
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
        </motion.form>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-3 text-red-400 bg-red-400/5 px-6 py-4 rounded-2xl border border-red-400/10 max-w-lg mx-auto"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Stats Summary */}
      <AnimatePresence>
        {data && user && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* User Profile Card */}
            <div className="lg:col-span-4 glass-panel rounded-[2rem] p-8 flex flex-col items-center text-center space-y-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <img 
                  src={user.avatarUrl} 
                  alt={user.login}
                  className="w-24 h-24 rounded-full border-2 border-white/10 relative z-10"
                />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white">{user.login}</h2>
                  <a 
                    href={user.htmlUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white/40 hover:text-indigo-400 transition-colors flex items-center justify-center gap-1.5 text-sm"
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

            {/* Quick Stats Grid */}
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

            {/* Filters & Content Area */}
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
                          ${isActive ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="platformActiveTab"
                            className="absolute inset-0 bg-white/5 border border-white/10 rounded-[0.85rem] shadow-inner"
                            transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                          />
                        )}
                        <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-indigo-400' : ''}`} />
                        <span className="relative z-10">{tab.label}</span>
                        {tab.count !== undefined && (
                          <span className={`relative z-10 px-1.5 py-0.5 rounded-md text-[10px] ${isActive ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-white/30'}`}>
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                <div className="text-sm font-medium text-white/30">
                  Showing <span className="text-white">{filteredData.length}</span> contributions 
                  in <span className="text-white">{filter === 'all' ? 'total' : filter}</span> category
                </div>
              </div>

              <motion.div layout className="min-h-[400px]">
                <AnimatePresence mode="popLayout">
                  {filteredData.length > 0 ? (
                    <motion.div 
                      key={filter}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      {filteredData.map((repo, index) => (
                        <RepoCard key={repo.id} repo={repo} index={index} />
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="flex flex-col items-center justify-center py-32 text-center space-y-4 glass-panel rounded-[2rem]"
                    >
                      <div className="bg-white/5 p-4 rounded-2xl">
                        <Layers className="w-8 h-8 text-white/20" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-white/60 font-medium">No contributions found</p>
                        <p className="text-white/30 text-sm max-w-xs">We couldn't find any merged pull requests matching this specific filter.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
      className="glass-panel rounded-[2rem] p-8 flex flex-col justify-between group"
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorMap[color]} border transition-transform group-hover:scale-110 duration-500`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-1 mt-6">
        <p className="text-white/40 text-sm font-medium uppercase tracking-wider">{label}</p>
        <p className="text-4xl font-bold text-white tabular-nums">{value.toLocaleString()}</p>
      </div>
    </motion.div>
  );
}
