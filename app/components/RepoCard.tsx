"use client";

import { RepoContribution } from '../actions';
import { GitPullRequest, ExternalLink, Globe, User } from 'lucide-react';

interface RepoCardProps {
  repo: RepoContribution;
  index: number;
}

export function RepoCard({ repo, index }: RepoCardProps) {
  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-indigo-500/5 blur-2xl rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative glass-panel rounded-[2rem] p-7 h-full flex flex-col justify-between overflow-hidden">
        {/* Background Accent */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/5 blur-3xl rounded-full group-hover:bg-indigo-500/10 transition-colors" />

        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-zinc-100 rounded-2xl border border-zinc-200 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/5 transition-all duration-500">
              {repo.isExternal ? (
                <Globe className="w-6 h-6 text-indigo-600" />
              ) : (
                <User className="w-6 h-6 text-amber-600" />
              )}
            </div>
            {repo.isExternal && (
              <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                External
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {repo.repoName}
            </h3>
            <p className="text-zinc-400 text-sm font-medium">
              Owned by <span className="text-zinc-600">{repo.owner}</span>
            </p>
          </div>

          <div className="pt-2">
            <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-tighter">Latest Contribution</span>
                <span className="text-[10px] text-zinc-400">
                  {new Date(repo.latestPrDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <p className="text-sm text-zinc-600 line-clamp-2 leading-relaxed italic">
                "{repo.latestPrTitle}"
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              {[...Array(Math.min(repo.prCount, 3))].map((_, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-[#FFFDF3] flex items-center justify-center">
                  <GitPullRequest className="w-3 h-3 text-indigo-600" />
                </div>
              ))}
              {repo.prCount > 3 && (
                <div className="w-6 h-6 rounded-full bg-zinc-100 border-2 border-[#FFFDF3] flex items-center justify-center text-[10px] font-bold text-zinc-400">
                  +{repo.prCount - 3}
                </div>
              )}
            </div>
            <span className="text-sm font-bold text-zinc-900">
              {repo.prCount} {repo.prCount === 1 ? 'PR' : 'PRs'}
            </span>
          </div>

          <a
            href={repo.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-zinc-100 hover:bg-zinc-200 rounded-xl border border-zinc-200 transition-all active:scale-90"
          >
            <ExternalLink className="w-4 h-4 text-zinc-500" />
          </a>
        </div>
      </div>
    </div>
  );
}
