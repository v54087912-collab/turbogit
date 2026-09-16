"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/modal";
import { useReposStore } from "@/store/repos-store";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { repos } = useReposStore();

  const filteredRepos = repos.filter(
    (r) =>
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.full_name.toLowerCase().includes(query.toLowerCase())
  );

  const commands = [
    { label: "Dashboard", action: () => router.push("/dashboard") },
    { label: "Workflows", action: () => router.push("/workflows") },
    { label: "Files", action: () => router.push("/files") },
    { label: "Settings", action: () => router.push("/settings") },
  ];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleSelect = (action: () => void) => {
    action();
    setOpen(false);
    setQuery("");
  };

  return (
    <Modal
      open={open}
      onClose={() => { setOpen(false); setQuery(""); }}
      className="max-w-md"
    >
      <div className="flex items-center border border-border rounded-[var(--radius-sm)] px-3 bg-background">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-text-muted shrink-0"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search repos, commands..."
          className="flex-1 h-10 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none ml-2"
        />
        <kbd className="text-[10px] text-text-muted bg-surface px-1.5 py-0.5 rounded border border-border">
          ESC
        </kbd>
      </div>

      <div className="mt-3 max-h-60 overflow-y-auto">
        {query === "" ? (
          <div>
            <p className="text-[11px] text-text-muted uppercase tracking-wider px-2 mb-1">
              Commands
            </p>
            {commands.map((cmd) => (
              <button
                key={cmd.label}
                onClick={() => handleSelect(cmd.action)}
                className="w-full text-left px-2 py-1.5 text-sm text-text-primary hover:bg-surface-hover rounded-[var(--radius-sm)] transition-colors"
              >
                {cmd.label}
              </button>
            ))}
          </div>
        ) : (
          <div>
            <p className="text-[11px] text-text-muted uppercase tracking-wider px-2 mb-1">
              Repositories
            </p>
            {filteredRepos.length === 0 ? (
              <p className="text-sm text-text-muted px-2 py-4">
                No repositories found
              </p>
            ) : (
              filteredRepos.slice(0, 10).map((repo) => (
                <button
                  key={repo.id}
                  onClick={() =>
                    handleSelect(() =>
                      router.push(`/files/${repo.owner.login}/${repo.name}`)
                    )
                  }
                  className="w-full text-left px-2 py-1.5 text-sm text-text-primary hover:bg-surface-hover rounded-[var(--radius-sm)] transition-colors"
                >
                  {repo.full_name}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
