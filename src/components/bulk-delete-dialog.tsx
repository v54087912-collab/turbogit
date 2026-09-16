"use client";

import { useState } from "react";
import Modal from "@/components/ui/modal";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useReposStore } from "@/store/repos-store";

export default function BulkDeleteDialog() {
  const { isSelectMode, selectedIds, deleteSelected, clearSelection, repos } =
    useReposStore();
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const selectedRepos = repos.filter((r) => selectedIds.has(r.id));
  const isConfirmed = confirmText === "DELETE";

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setIsDeleting(true);
    await deleteSelected();
    setIsDeleting(false);
    setIsOpen(false);
    setConfirmText("");
  };

  return (
    <>
      {isSelectMode && selectedIds.size > 0 && (
        <div className="fixed bottom-16 md:bottom-4 left-0 right-0 z-30 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-[var(--radius-md)] px-4 py-3 flex items-center gap-4 shadow-[0_0_24px_rgba(141,214,255,0.15)]">
            <span className="text-sm text-text-primary">
              {selectedIds.size} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsOpen(true)}
            >
              Delete Selected ({selectedIds.size})
            </Button>
          </div>
        </div>
      )}

      <Modal open={isOpen} onClose={() => { setIsOpen(false); setConfirmText(""); }}>
        <h2 className="text-lg font-semibold text-text-primary mb-2">
          Confirm Bulk Delete
        </h2>
        <p className="text-sm text-text-muted mb-4">
          This will permanently delete {selectedIds.size} repositories. This
          action cannot be undone.
        </p>

        <div className="max-h-40 overflow-y-auto border border-border rounded-[var(--radius-sm)] p-3 mb-4">
          {selectedRepos.map((repo) => (
            <div
              key={repo.id}
              className="text-sm text-text-primary py-1 border-b border-border-muted last:border-0"
            >
              {repo.full_name}
            </div>
          ))}
        </div>

        <Input
          label='Type "DELETE" to confirm'
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE"
        />

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="ghost"
            onClick={() => { setIsOpen(false); setConfirmText(""); }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={!isConfirmed || isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? "Deleting..." : "Delete Permanently"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
