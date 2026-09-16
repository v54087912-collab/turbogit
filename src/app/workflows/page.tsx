"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useWorkflowsStore } from "@/store/workflows-store";
import { getMasterHash } from "@/lib/indexed-db";
import Navbar from "@/components/navbar";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Input from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import { toast } from "sonner";

export default function WorkflowsPage() {
  const router = useRouter();
  const { isUnlocked } = useAuthStore();
  const {
    workflows,
    isLoading,
    error,
    currentRepo,
    setRepo,
    fetchWorkflows,
    runWorkflow,
  } = useWorkflowsStore();

  const [owner, setOwner] = useState("");
  const [repoName, setRepoName] = useState("");
  const [editModal, setEditModal] = useState<{
    open: boolean;
    content: string;
    path: string;
  }>({ open: false, content: "", path: "" });

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

  const handleLoad = () => {
    if (!owner.trim() || !repoName.trim()) return;
    setRepo(owner.trim(), repoName.trim());
  };

  useEffect(() => {
    if (currentRepo) {
      fetchWorkflows();
    }
  }, [currentRepo, fetchWorkflows]);

  const handleRun = async (workflowId: number, name: string) => {
    await runWorkflow(workflowId);
    toast.success(`Workflow "${name}" triggered`);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4 md:p-6 pb-24 md:pb-6 space-y-6">
        <h1 className="text-2xl font-bold text-text-primary">Workflows</h1>

        <Card>
          <h2 className="text-sm font-semibold text-text-primary mb-3">
            Select Repository
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
            <Button
              onClick={handleLoad}
              disabled={!owner.trim() || !repoName.trim()}
            >
              Load
            </Button>
          </div>
        </Card>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-text-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-danger-bg border border-danger/30 rounded-[var(--radius-md)] p-4">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        {!isLoading && workflows.length === 0 && currentRepo && !error && (
          <div className="text-center py-12">
            <p className="text-text-muted">No workflows found</p>
          </div>
        )}

        <div className="space-y-2">
          {workflows.map((wf) => (
            <Card key={wf.id} className="flex items-center justify-between !p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-text-primary truncate">
                    {wf.name}
                  </h3>
                  <Badge
                    variant={
                      wf.state === "active" ? "success" : "default"
                    }
                  >
                    {wf.state}
                  </Badge>
                </div>
                <p className="text-xs text-text-muted mt-0.5 truncate">
                  {wf.path}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <Button
                  size="sm"
                  onClick={() => handleRun(wf.id, wf.name)}
                  disabled={wf.state !== "active"}
                >
                  Run
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Modal
          open={editModal.open}
          onClose={() =>
            setEditModal({ open: false, content: "", path: "" })
          }
        >
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            Edit {editModal.path}
          </h2>
          <textarea
            value={editModal.content}
            onChange={(e) =>
              setEditModal((prev) => ({
                ...prev,
                content: e.target.value,
              }))
            }
            className="w-full h-96 bg-background text-text-primary font-mono text-sm p-3 border border-border rounded-[var(--radius-sm)] resize-none focus:outline-none focus:border-text-accent"
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="ghost"
              onClick={() =>
                setEditModal({ open: false, content: "", path: "" })
              }
            >
              Cancel
            </Button>
            <Button>Save Changes</Button>
          </div>
        </Modal>
      </main>
    </div>
  );
}
