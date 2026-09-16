"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useReposStore } from "@/store/repos-store";
import { getMasterHash } from "@/lib/indexed-db";
import Navbar from "@/components/navbar";
import RepoCard from "@/components/repo-card";
import BulkDeleteDialog from "@/components/bulk-delete-dialog";
import CommandPalette from "@/components/command-palette";
import Button from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();
  const { isUnlocked } = useAuthStore();
  const {
    repos,
    isLoading,
    error,
    isSelectMode,
    toggleSelectMode,
    fetchRepos,
  } = useReposStore();

  useEffect(() => {
    const check = async () => {
      const hash = await getMasterHash();
      if (!hash) {
        router.push("/setup");
      } else if (!isUnlocked) {
        router.push("/setup?mode=unlock");
      }
    };
    check();
  }, [isUnlocked, router]);

  useEffect(() => {
    if (isUnlocked) {
      fetchRepos();
    }
  }, [isUnlocked, fetchRepos]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <CommandPalette />
      <main className="max-w-6xl mx-auto p-4 md:p-6 pb-24 md:pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Repositories
            </h1>
            <p className="text-sm text-text-muted mt-1">
              {repos.length} repositories
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSelectMode}
          >
            {isSelectMode ? "Cancel" : "Select"}
          </Button>
        </div>

        {isLoading && repos.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-text-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-danger-bg border border-danger/30 rounded-[var(--radius-md)] p-4 mb-6">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        {!isLoading && repos.length === 0 && !error && (
          <div className="text-center py-20">
            <p className="text-text-muted">No repositories found</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {repos.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      </main>
      <BulkDeleteDialog />
    </div>
  );
}
