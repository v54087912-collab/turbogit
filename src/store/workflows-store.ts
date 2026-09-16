import { create } from "zustand";

export interface WorkflowInfo {
  id: number;
  name: string;
  path: string;
  state: string;
  created_at: string;
  updated_at: string;
}

interface WorkflowsState {
  workflows: WorkflowInfo[];
  isLoading: boolean;
  error: string | null;
  currentRepo: { owner: string; repo: string } | null;

  setRepo: (owner: string, repo: string) => void;
  fetchWorkflows: () => Promise<void>;
  runWorkflow: (workflowId: number) => Promise<void>;
}

export const useWorkflowsStore = create<WorkflowsState>((set, get) => ({
  workflows: [],
  isLoading: false,
  error: null,
  currentRepo: null,

  setRepo: (owner: string, repo: string) => {
    set({ currentRepo: { owner, repo }, workflows: [] });
  },

  fetchWorkflows: async () => {
    const { useAuthStore } = await import("./auth-store");
    const octokit = useAuthStore.getState().octokit;
    const { currentRepo } = get();
    if (!octokit || !currentRepo) return;

    set({ isLoading: true, error: null });
    try {
      const o = octokit as {
        rest: {
          actions: {
            listRepoWorkflows: (opts: {
              owner: string;
              repo: string;
              per_page: number;
            }) => Promise<{ data: { workflows: unknown[] } }>;
          };
        };
      };
      const { data } = await o.rest.actions.listRepoWorkflows({
        owner: currentRepo.owner,
        repo: currentRepo.repo,
        per_page: 50,
      });
      set({ workflows: data.workflows as WorkflowInfo[], isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch workflows",
      });
    }
  },

  runWorkflow: async (workflowId: number) => {
    const { useAuthStore } = await import("./auth-store");
    const octokit = useAuthStore.getState().octokit;
    const { currentRepo } = get();
    if (!octokit || !currentRepo) return;

    try {
      const o = octokit as {
        rest: {
          actions: {
            createWorkflowDispatch: (opts: {
              owner: string;
              repo: string;
              workflow_id: number;
              ref: string;
            }) => Promise<void>;
          };
        };
      };
      await o.rest.actions.createWorkflowDispatch({
        owner: currentRepo.owner,
        repo: currentRepo.repo,
        workflow_id: workflowId,
        ref: "main",
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to trigger workflow",
      });
    }
  },
}));
