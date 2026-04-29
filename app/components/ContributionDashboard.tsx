"use client";

import { useState } from 'react';
import { getOpenSourceContributions, RepoContribution } from '../actions';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, GitPullRequest, AlertCircle, LayoutGrid, Globe, User } from 'lucide-react';
import { RepoCard } from './RepoCard';

type FilterType = 'all' | 'external' | 'owned';

export function ContributionDashboard() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RepoContribution[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [totalPrs, setTotalPrs] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    setLoading(true);
    setError(null);
    setData(null);
    setFilter('all');
    setTotalPrs(null);
    
    const result = await getOpenSourceContributions(username.trim());
    if (result.success && result.data) {
      setData(result.data);
      setTotalPrs(result.totalPrs || null);
    } else {
      setError(result.error || 'Something went wrong');
    }
    setLoading(false);
  };

  const filteredData = data?.filter(repo => {
    if (filter === 'external') return repo.isExternal;
    if (filter === 'owned') return !repo.isExternal;
    return true;
  });

  const tabs = [
    { id: 'all', label: 'All Contributions', icon: LayoutGrid },
    { id: 'external', label: 'External Repos', icon: Globe },
    { id: 'owned', label: 'My Projects', icon: User },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12">
      {/* Search Header */}
      <div className="flex flex-col items-center justify-center space-y-6 pt-12 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.215, 0.61, 0.355, 1] }}
          className="bg-white/5 p-4 rounded-3xl mb-2"
        >
          <GitPullRequest className="w-12 h-12 text-indigo-400" />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.215, 0.61, 0.355, 1] }}
          className="text-center space-y-4"
        >
          <h1 
            className="font-jersey text-4xl md:text-5xl tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60"
          >
            Open Source Impact
          </h1>
          <p className="text-white/50 text-lg max-w-lg mx-auto">
            Discover the global reach of a developer's open-source contributions. Enter a GitHub username to see their merged PRs.
          </p>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
          onSubmit={handleSubmit}
          className="w-full max-w-md relative group"
        >
          <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2 focus-within:border-indigo-500/50 focus-within:bg-white/10 transition-all duration-300">
            <Search className="w-5 h-5 text-white/40 ml-2" />
            <input
              type="text"
              placeholder="e.g. torvalds"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-white px-4 py-2 placeholder:text-white/20"
              spellCheck={false}
            />
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
            </button>
          </div>
        </motion.form>
      </div>

      {/* Error State */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-2 text-red-400 bg-red-400/10 px-6 py-4 rounded-xl border border-red-400/20 max-w-md mx-auto"
          >
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Grid & Tabs */}
      {filteredData && data && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 pb-20"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
            
            {/* Filter Tabs */}
            <div className="flex p-1 space-x-1 bg-white/5 rounded-xl border border-white/10 w-fit">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id as FilterType)}
                    className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors outline-none flex items-center gap-2
                      ${filter === tab.id ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
                  >
                    {filter === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-indigo-500/20 border border-indigo-500/30 rounded-lg"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                      />
                    )}
                    <Icon className="w-4 h-4 relative z-10" />
                    <span className="relative z-10 hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="text-sm text-white/50">
              Showing <span className="text-white font-medium">{filteredData.length}</span> {filteredData.length === 1 ? 'repository' : 'repositories'}
              {totalPrs && totalPrs > 0 ? ` (${totalPrs} total PRs)` : ''}
            </div>
          </div>
          
          <motion.div layout className="min-h-[200px]">
            {filteredData.length > 0 ? (
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredData.map((repo, index) => (
                    <RepoCard key={repo.id} repo={repo} index={index} />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-center py-20 text-white/40"
              >
                <p>No open-source merged PRs found for this filter.</p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
