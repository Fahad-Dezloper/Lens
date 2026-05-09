"use client";

import { RepoContribution } from "../actions";
import { GitPullRequest, ExternalLink, Globe, User, Star } from "lucide-react";

interface RepoCardProps {
  repo: RepoContribution;
  index: number;
  username: string;
}

export function RepoCard({ repo, index, username }: RepoCardProps) {
  return (
    <div className="group border border-foreground/10 bg-card  p-6 flex flex-col justify-between hover:border-foreground/20 transition-all hover:shadow-md">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-primary tracking-tight line-clamp-1">
              {repo.repoName}
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                {/* <User className="w-3.5 h-3.5" /> */}
                {repo.owner}
              </p>
              {repo.stars > 0 && (
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5" />
                  {repo.stars >= 1000
                    ? `${(repo.stars / 1000).toFixed(1)}K`
                    : repo.stars}
                </p>
              )}
            </div>
          </div>
          {/* <div className="text-[10px] font-semibold text-foreground/60 bg-foreground/5 border border-foreground/10 rounded-full px-2.5 py-1">
            {repo.isExternal ? 'External' : 'Owned'}
          </div> */}
        </div>

        {repo.description && (
          <p className="text-sm font-medium text-muted-foreground leading-relaxed line-clamp-2">
            {repo.description}
          </p>
        )}

        <div className="pt-2">
          <div className="border border-foreground/5 p-4 rounded-lg space-y-2 bg-foreground/[0.02]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Latest PR
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">
                {new Date(repo.latestPrDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <p className="text-sm font-medium text-foreground leading-snug">
              {repo.latestPrTitle}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1.5">
            {[...Array(Math.min(repo.prCount, 3))].map((_, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border border-foreground/10 bg-muted/50 flex items-center justify-center relative z-10"
              >
                <GitPullRequest className="w-3.5 h-3.5 text-foreground/60" />
              </div>
            ))}
          </div>
          <span className="text-sm font-medium text-muted-foreground ml-1">
            {repo.prCount}{" "}
            {repo.prCount === 1 ? "Pull Request" : "Pull Requests"}
          </span>
        </div>

        <a
          href={
            repo.hasOpenPrs
              ? `https://github.com/${repo.id}/pulls/${username}`
              : `https://github.com/${repo.id}/pulls?q=is:pr+author:${username}+is:closed`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-lg border border-border hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
