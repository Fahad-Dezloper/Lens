"use client";

import { RepoContribution } from '../actions';
import { motion } from 'framer-motion';
import { Calendar, ExternalLink, GitMerge } from 'lucide-react';

export function RepoCard({ repo, index }: { repo: RepoContribution; index: number }) {
  // Format the date nicely
  const formattedDate = new Date(repo.latestPrDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ 
        duration: 0.3, 
        ease: [0.215, 0.61, 0.355, 1], // ease-out-cubic
        layout: { type: "spring", bounce: 0.1, duration: 0.4 }
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="glass-panel p-6 rounded-2xl flex flex-col gap-4 relative group cursor-pointer"
      onClick={() => window.open(repo.repoUrl, '_blank')}
    >
      {/* Background gradient hint */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />

      <div className="flex justify-between items-start z-10">
        <div>
          <h3 className="text-xl font-semibold text-white/90 group-hover:text-indigo-400 transition-colors duration-200 line-clamp-1">
            {repo.repoName}
          </h3>
          <div className="flex items-center text-sm text-white/40 mt-1 gap-1">
            <GitMerge className="w-4 h-4" />
            <span>{repo.prCount} {repo.prCount === 1 ? 'Merged PR' : 'Merged PRs'}</span>
          </div>
        </div>
        <div className="bg-indigo-500/10 p-2 rounded-full text-indigo-400 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
          <ExternalLink className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-auto z-10 border-t border-white/10 pt-4">
        <p className="text-sm text-white/70 line-clamp-2 mb-3 h-10">
          <span className="text-white/40 font-mono text-xs mr-2">Latest:</span>
          {repo.latestPrTitle}
        </p>
        <div className="flex items-center justify-between text-xs text-white/40">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            <span>{formattedDate}</span>
          </div>
          {repo.isExternal && (
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/20">
              External
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
