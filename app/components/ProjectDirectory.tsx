"use client";

import { RepoContribution } from "../actions";
import { RepoCard } from "./RepoCard";
import { Layers } from "lucide-react";

type FilterType = "all" | "external" | "owned";

interface ProjectDirectoryProps {
  filteredData: RepoContribution[];
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  tabs: {
    id: string;
    label: string;
    icon: any;
    count: number | undefined;
  }[];
  username: string;
}

export function ProjectDirectory({
  filteredData,
  filter,
  setFilter,
  tabs,
  username,
}: ProjectDirectoryProps) {
  return (
    <div className="flex flex-col w-full gap-6">
      <div className="flex bg-muted/50 border border-foreground/10 w-fit p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as FilterType)}
              className={`px-4 py-2 text-xs font-medium transition-colors flex items-center gap-2 
                ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? "bg-primary text-primary-foreground" : "bg-border text-muted-foreground"}`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-2">
        {filteredData.length > 0 ? (
          filteredData.map((repo, index) => (
            <RepoCard
              key={repo.id}
              repo={repo}
              index={index}
              username={username}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 border-2 border-foreground bg-background">
            <Layers className="w-12 h-12 text-foreground/20" />
            <div className="space-y-1">
              <p className="text-foreground font-black uppercase text-sm">
                No contributions found
              </p>
              <p className="text-muted-foreground text-[10px] max-w-xs uppercase">
                Filter returned 0 results
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
