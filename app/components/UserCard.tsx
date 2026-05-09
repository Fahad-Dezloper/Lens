"use client";

import { UserProfile } from "../actions";
import {
  Globe,
  Code2,
  TrendingUp,
  Milestone,
  MapPin,
  Building2,
  Users,
} from "lucide-react";

interface UserCardProps {
  user: UserProfile;
  stats: {
    totalRepos: number;
    externalRepos: number;
    ownedRepos: number;
    topRepo: string | undefined;
  } | null;
  externalPrs: number | null;
}

export function UserCard({ user, stats, externalPrs }: UserCardProps) {
  return (
    <div className="flex flex-col gap-6 w-full md:w-[350px] shrink-0">
      <div className="border border-foreground/10 p-8 flex flex-col items-center text-center space-y-6 bg-card relative hover:border-foreground/20 transition-colors">
        <div className="relative">
          <img
            src={user.avatarUrl}
            alt={user.login}
            className="w-32 h-32 border border-foreground/10 rounded-full"
          />
        </div>

        <div className="space-y-3 w-full">
          <div className="space-y-1">
            {user.name && (
              <h1 className="text-2xl font-bold text-foreground tracking-tight leading-none">
                {user.name}
              </h1>
            )}
            <h2 className="text-lg font-medium text-foreground/50">
              @{user.login}
            </h2>
          </div>

          {user.bio && (
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto px-4 border-t border-b border-border py-3">
              {user.bio}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <a
              href={user.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/70 hover:bg-foreground/10 hover:text-foreground transition-colors flex items-center justify-center gap-1.5 text-xs font-medium border border-foreground/10 rounded-lg px-3 py-1.5"
            >
              <Code2 className="w-3.5 h-3.5" />
              GitHub
            </a>

            {user.twitterUsername && (
              <a
                href={`https://x.com/${user.twitterUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/70 hover:bg-foreground/10 hover:text-foreground transition-colors flex items-center justify-center gap-1.5 text-xs font-medium border border-foreground/10 rounded-lg px-3 py-1.5"
              >
                Twitter
              </a>
            )}

            {user.blog && (
              <a
                href={
                  user.blog.startsWith("http")
                    ? user.blog
                    : `https://${user.blog}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/70 hover:bg-foreground/10 hover:text-foreground transition-colors flex items-center justify-center gap-1.5 text-xs font-medium border border-foreground/10 rounded-lg px-3 py-1.5"
              >
                Website
              </a>
            )}

            {user.email && (
              <a
                href={`mailto:${user.email}`}
                className="text-foreground/70 hover:bg-foreground/10 hover:text-foreground transition-colors flex items-center justify-center gap-1.5 text-xs font-medium border border-foreground/10 rounded-lg px-3 py-1.5"
              >
                Email
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 w-full pt-4 border-t border-border">
          {user.location && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{user.location}</span>
            </div>
          )}
          {user.company && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Building2 className="w-3.5 h-3.5" />
              <span className="truncate">{user.company}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Users className="w-3.5 h-3.5" />
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
                <div
                  key={achievement.name}
                  className="relative grayscale hover:grayscale-0 transition-all"
                  title={achievement.name}
                >
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
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: any;
}) {
  return (
    <div className="border border-border p-6 flex flex-col justify-between bg-card rounded-xl hover:border-primary/30 transition-all group">
      <div className="flex items-center justify-between text-muted-foreground">
        <p className="text-sm font-medium">{label}</p>
        <Icon className="w-5 h-5 group-hover:text-primary transition-colors" />
      </div>
      <p className="text-4xl font-bold text-primary tabular-nums mt-4">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
