"use client";

import { RepoContribution } from '../actions';
import { motion } from 'framer-motion';
import { GitPullRequest, ExternalLink, Globe, User } from 'lucide-react';

interface RepoCardProps {
  repo: RepoContribution;
  index: number;
}

export function RepoCard({ repo, index }: RepoCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.05,
        ease: [0.23, 1, 0.32, 1] 
      }}
      className="group relative"
    >
      <div className="absolute inset-0 bg-indigo-500/5 blur-2xl rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative glass-panel rounded-[2rem] p-7 h-full flex flex-col justify-between overflow-hidden">
        {/* Background Accent */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/5 blur-3xl rounded-full group-hover:bg-indigo-500/10 transition-colors" />

        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/5 transition-all duration-500">
              {repo.isExternal ? (
                <Globe className="w-6 h-6 text-indigo-400" />
              ) : (
                <User className="w-6 h-6 text-amber-400" />
              )}
            </div>
            {repo.isExternal && (
              <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                External
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
              {repo.repoName}
            </h3>
            <p className="text-white/40 text-sm font-medium">
              Owned by <span className="text-white/60">{repo.owner}</span>
            </p>
          </div>

          <div className="pt-2">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/30 uppercase tracking-tighter">Latest Contribution</span>
                <span className="text-[10px] text-white/20">
                  {new Date(repo.latestPrDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <p className="text-sm text-white/70 line-clamp-2 leading-relaxed italic">
                "{repo.latestPrTitle}"
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              {[...Array(Math.min(repo.prCount, 3))].map((_, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-indigo-500/20 border-2 border-[#030305] flex items-center justify-center">
                  <GitPullRequest className="w-3 h-3 text-indigo-400" />
                </div>
              ))}
              {repo.prCount > 3 && (
                <div className="w-6 h-6 rounded-full bg-white/5 border-2 border-[#030305] flex items-center justify-center text-[10px] font-bold text-white/40">
                  +{repo.prCount - 3}
                </div>
              )}
            </div>
            <span className="text-sm font-bold text-white">
              {repo.prCount} {repo.prCount === 1 ? 'PR' : 'PRs'}
            </span>
          </div>

          <a
            href={repo.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all active:scale-90"
          >
            <ExternalLink className="w-4 h-4 text-white/60" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
