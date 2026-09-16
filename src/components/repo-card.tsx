"use client";

import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { useReposStore } from "@/store/repos-store";
import type { RepoInfo } from "@/lib/github";

interface RepoCardProps {
  repo: RepoInfo;
}

export default function RepoCard({ repo }: RepoCardProps) {
  const { isSelectMode, selectedIds, toggleSelect } = useReposStore();
  const isSelected = selectedIds.has(repo.id);

  return (
    <Card
      hover={!isSelectMode}
      className={`relative cursor-pointer transition-all ${
        isSelected ? "border-text-accent shadow-[0_0_24px_rgba(141,214,255,0.15)]" : ""
      }`}
      onClick={() => {
        if (isSelectMode) toggleSelect(repo.id);
      }}
    >
      {isSelectMode && (
        <div className="absolute top-3 right-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleSelect(repo.id)}
            className="w-4 h-4 rounded border-border accent-text-accent"
          />
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-text-muted text-xs font-bold shrink-0 mt-0.5">
          {repo.owner.login[0].toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-text-primary truncate">
            {repo.name}
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            {repo.owner.login}
          </p>
        </div>
      </div>

      {repo.description && (
        <p className="text-xs text-text-muted mt-3 line-clamp-2">
          {repo.description}
        </p>
      )}

      <div className="flex items-center gap-2 mt-3">
        <Badge variant={repo.private ? "danger" : "success"}>
          {repo.private ? "Private" : "Public"}
        </Badge>
        <span className="text-[11px] text-text-muted">
          Updated {new Date(repo.updated_at).toLocaleDateString()}
        </span>
      </div>
    </Card>
  );
}
