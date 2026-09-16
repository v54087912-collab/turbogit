import { create } from "zustand";

export interface RepoInfo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  updated_at: string;
  html_url: string;
  default_branch: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

interface ReposState {
  repos: RepoInfo[];
  isLoading: boolean;
  error: string | null;
  selectedIds: Set<number>;
  isSelectMode: boolean;

  fetchRepos: () => Promise<void>;
  deleteSelected: () => Promise<void>;
  toggleSelectMode: () => void;
  toggleSelect: (id: number) => void;
  selectAll: () => void;
  clearSelection: () => void;
}

export const useReposStore = create<ReposState>((set, get) => ({
  repos: [],
  isLoading: false,
  error: null,
  selectedIds: new Set(),
  isSelectMode: false,

  fetchRepos: async () => {
    const { useAuthStore } = await import("./auth-store");
    const octokit = useAuthStore.getState().octokit;
    if (!octokit) return;

    set({ isLoading: true, error: null });
    try {
      const o = octokit as { rest: { repos: { listForAuthenticatedUser: (opts: Record<string, unknown>) => Promise<{ data: unknown[] }> } } };
      const repos: RepoInfo[] = [];
      let page = 1;

      while (true) {
        const { data } = await o.rest.repos.listForAuthenticatedUser({
          per_page: 100,
          page,
          sort: "updated",
        });
        repos.push(...(data as RepoInfo[]));
        if (data.length < 100) break;
        page++;
      }

      set({ repos, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch repos",
      });
    }
  },

  deleteSelected: async () => {
    const { useAuthStore } = await import("./auth-store");
    const octokit = useAuthStore.getState().octokit;
    const { selectedIds, repos } = get();
    if (!octokit || selectedIds.size === 0) return;

    set({ isLoading: true });
    const selectedRepos = repos.filter((r) => selectedIds.has(r.id));
    const o = octokit as { rest: { repos: { delete: (opts: { owner: string; repo: string }) => Promise<void> } } };

    await Promise.allSettled(
      selectedRepos.map(async (repo) => {
        const [owner, name] = repo.full_name.split("/");
        return o.rest.repos.delete({ owner, repo: name });
      })
    );

    set({
      repos: repos.filter((r) => !selectedIds.has(r.id)),
      selectedIds: new Set(),
      isSelectMode: false,
      isLoading: false,
    });
  },

  toggleSelectMode: () => {
    const { isSelectMode } = get();
    set({
      isSelectMode: !isSelectMode,
      selectedIds: isSelectMode ? new Set() : get().selectedIds,
    });
  },

  toggleSelect: (id: number) => {
    const { selectedIds } = get();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    set({ selectedIds: next });
  },

  selectAll: () => {
    const { repos } = get();
    set({ selectedIds: new Set(repos.map((r) => r.id)) });
  },

  clearSelection: () => {
    set({ selectedIds: new Set(), isSelectMode: false });
  },
}));
