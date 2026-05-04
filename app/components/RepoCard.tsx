"use client";

import { RepoContribution } from '../actions';
import { GitPullRequest, ExternalLink, Globe, User } from 'lucide-react';

interface RepoCardProps {
  repo: RepoContribution;
  index: number;
  username: string;
}

export function RepoCard({ repo, index, username }: RepoCardProps) {
  return (
    <div className="group border-2 border-foreground bg-background p-6 flex flex-col justify-between hover:bg-foreground hover:text-background transition-colors">
      <div className="space-y-4">

        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-lg font-black uppercase tracking-tighter line-clamp-1">
              <span className="opacity-30 mr-2">[{String(index + 1).padStart(2, '0')}]</span>
              {repo.repoName}
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 flex items-center gap-1.5">
                <User className="w-2.5 h-2.5" />
                {repo.owner}
              </p>
              {repo.stars > 0 && (
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 flex items-center gap-1.5">
                  <Globe className="w-2.5 h-2.5" />
                  {repo.stars >= 1000 ? `${(repo.stars / 1000).toFixed(1)}K` : repo.stars} STARS
                </p>
              )}
            </div>
          </div>
          <div className="text-[8px] font-black uppercase tracking-[0.2em] border border-foreground/30 px-2 py-0.5">
            {repo.isExternal ? 'EXT' : 'OWN'}
          </div>
        </div>

        {repo.description && (
          <p className="text-[10px] font-medium leading-tight opacity-50 line-clamp-2 uppercase">
            {repo.description}
          </p>
        )}

        <div className="pt-2">
          <div className="border border-foreground/10 p-4 space-y-3 bg-foreground/[0.02]">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-black uppercase tracking-widest opacity-40">ENTRY:LOG</span>
              <span className="text-[8px] font-black uppercase">
                [{new Date(repo.latestPrDate).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' })}]
              </span>
            </div>
            <p className="text-xs font-bold leading-tight uppercase tracking-tight italic">
              "{repo.latestPrTitle}"
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            {[...Array(Math.min(repo.prCount, 3))].map((_, i) => (
              <div key={i} className="w-5 h-5 border border-foreground bg-background flex items-center justify-center group-hover:bg-foreground">
                <GitPullRequest className="w-3 h-3 group-hover:text-background" />
              </div>
            ))}
          </div>
          <span className="text-xs font-black uppercase">
            {repo.prCount} {repo.prCount === 1 ? 'PR' : 'PRs'}
          </span>
        </div>

        <a
          href={repo.hasOpenPrs 
            ? `https://github.com/${repo.id}/pulls/${username}`
            : `https://github.com/${repo.id}/pulls?q=is:pr+author:${username}+is:closed`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 border border-foreground hover:bg-background hover:text-foreground transition-colors bg-foreground text-background group-hover:bg-background group-hover:text-foreground"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
