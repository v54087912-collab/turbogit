"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useReposStore } from "@/store/repos-store";
import { getMasterHash } from "@/lib/indexed-db";
import Navbar from "@/components/navbar";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

export default function FilesIndexPage() {
  const router = useRouter();
  const { isUnlocked } = useAuthStore();
  const { repos, fetchRepos } = useReposStore();
  const [owner, setOwner] = useState("");
  const [repoName, setRepoName] = useState("");

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
    if (isUnlocked && repos.length === 0) {
      fetchRepos();
    }
  }, [isUnlocked, repos.length, fetchRepos]);

  const handleOpen = () => {
    if (owner.trim() && repoName.trim()) {
      router.push(`/files/${owner.trim()}/${repoName.trim()}`);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4 md:p-6 pb-24 md:pb-6 space-y-6">
        <h1 className="text-2xl font-bold text-text-primary">Files</h1>

        <Card>
          <h2 className="text-sm font-semibold text-text-primary mb-3">
            Open Repository
          </h2>
          <div className="flex gap-2">
            <Input
              placeholder="Owner"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Repository"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleOpen} disabled={!owner.trim() || !repoName.trim()}>
              Open
            </Button>
          </div>
        </Card>

        <div>
          <h2 className="text-sm font-semibold text-text-muted mb-3">
            Your Repositories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {repos.map((repo) => (
              <button
                key={repo.id}
                onClick={() =>
                  router.push(`/files/${repo.owner.login}/${repo.name}`)
                }
                className="text-left p-3 bg-surface border border-border rounded-[var(--radius-md)] hover:shadow-[0_0_24px_rgba(141,214,255,0.15)] hover:border-text-accent transition-all"
              >
                <p className="text-sm font-medium text-text-primary truncate">
                  {repo.full_name}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {repo.private ? "Private" : "Public"}
                </p>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
