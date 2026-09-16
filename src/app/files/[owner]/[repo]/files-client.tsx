"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import {
  getFileTree,
  getFileContent,
  createOrUpdateFile,
  deleteFile,
  type FileInfo,
} from "@/lib/github";
import { getMasterHash } from "@/lib/indexed-db";
import Navbar from "@/components/navbar";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Modal from "@/components/ui/modal";
import Input from "@/components/ui/input";
import { toast } from "sonner";

interface FilesClientProps {
  initialOwner: string;
  initialRepo: string;
}

export default function FilesClient({ initialOwner, initialRepo }: FilesClientProps) {
  const router = useRouter();
  const { isUnlocked, octokit } = useAuthStore();

  const [owner, setOwner] = useState(initialOwner !== "_" ? initialOwner : "");
  const [repo, setRepo] = useState(initialRepo !== "_" ? initialRepo : "");

  // Fallback for Cloudflare Pages SPA rewrite: parse owner and repo from pathname if placeholder "_"
  useEffect(() => {
    if (initialOwner === "_" || !owner || !repo) {
      if (typeof window !== "undefined") {
        const parts = window.location.pathname.split("/").filter(Boolean);
        // /files/:owner/:repo -> parts: ['files', ':owner', ':repo']
        if (parts[0] === "files" && parts[1] && parts[2]) {
          setOwner(decodeURIComponent(parts[1]));
          setRepo(decodeURIComponent(parts[2]));
        }
      }
    }
  }, [initialOwner, owner, repo]);

  const [files, setFiles] = useState<FileInfo[]>([]);
  const [currentPath, setCurrentPath] = useState("");
  const [isPending, startTransition] = useTransition();
  const [selectedFile, setSelectedFile] = useState<{
    content: string;
    sha: string;
    path: string;
  } | null>(null);
  const [editContent, setEditContent] = useState("");
  const [newFileModal, setNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileContent, setNewFileContent] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    file: FileInfo | null;
  }>({ open: false, file: null });

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

  const loadFiles = useCallback(async (path: string) => {
    if (!octokit || !owner || !repo) return null;
    try {
      const data = await getFileTree(octokit, owner, repo, path);
      return data.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === "dir" ? -1 : 1;
      });
    } catch {
      toast.error("Failed to load files");
      return null;
    }
  }, [octokit, owner, repo]);

  useEffect(() => {
    if (!isUnlocked || !owner || !repo) return;

    let cancelled = false;

    startTransition(async () => {
      const data = await loadFiles(currentPath);
      if (!cancelled && data) {
        setFiles(data);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isUnlocked, currentPath, loadFiles, startTransition, owner, repo]);

  const handleFileClick = async (file: FileInfo) => {
    if (file.type === "dir") {
      setCurrentPath(file.path);
      setSelectedFile(null);
      return;
    }

    if (!octokit || !owner || !repo) return;

    try {
      const data = await getFileContent(octokit, owner, repo, file.path);
      setSelectedFile({ ...data, path: file.path });
      setEditContent(data.content);
    } catch {
      toast.error("Failed to load file content");
    }
  };

  const handleSave = async () => {
    if (!octokit || !selectedFile || !owner || !repo) return;

    try {
      await createOrUpdateFile(
        octokit,
        owner,
        repo,
        selectedFile.path,
        editContent,
        commitMessage || `Update ${selectedFile.path}`,
        selectedFile.sha
      );
      toast.success("File saved");
      setCommitMessage("");
    } catch {
      toast.error("Failed to save file");
    }
  };

  const handleCreateFile = async () => {
    if (!octokit || !newFileName.trim() || !owner || !repo) return;

    const filePath = currentPath
      ? `${currentPath}/${newFileName.trim()}`
      : newFileName.trim();

    try {
      await createOrUpdateFile(
        octokit,
        owner,
        repo,
        filePath,
        newFileContent,
        commitMessage || `Create ${filePath}`
      );
      toast.success("File created");
      setNewFileModal(false);
      setNewFileName("");
      setNewFileContent("");
      setCommitMessage("");
      startTransition(async () => {
        const data = await loadFiles(currentPath);
        if (data) setFiles(data);
      });
    } catch {
      toast.error("Failed to create file");
    }
  };

  const handleDelete = async () => {
    if (!octokit || !deleteModal.file || !owner || !repo) return;

    try {
      await deleteFile(
        octokit,
        owner,
        repo,
        deleteModal.file.path,
        deleteModal.file.sha,
        commitMessage || `Delete ${deleteModal.file.name}`
      );
      toast.success("File deleted");
      setDeleteModal({ open: false, file: null });
      setCommitMessage("");
      if (selectedFile?.path === deleteModal.file.path) {
        setSelectedFile(null);
      }
      startTransition(async () => {
        const data = await loadFiles(currentPath);
        if (data) setFiles(data);
      });
    } catch {
      toast.error("Failed to delete file");
    }
  };

  const pathParts = currentPath ? currentPath.split("/") : [];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto p-4 md:p-6 pb-24 md:pb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-text-primary">
              {owner && repo ? `${owner}/${repo}` : "Loading repository..."}
            </h1>
            <nav className="flex items-center gap-1 text-sm mt-1">
              <button
                onClick={() => {
                  setCurrentPath("");
                  setSelectedFile(null);
                }}
                className="text-text-accent hover:underline"
              >
                root
              </button>
              {pathParts.map((part, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="text-text-muted">/</span>
                  <button
                    onClick={() => {
                      setCurrentPath(pathParts.slice(0, i + 1).join("/"));
                      setSelectedFile(null);
                    }}
                    className="text-text-accent hover:underline"
                  >
                    {part}
                  </button>
                </span>
              ))}
            </nav>
          </div>
          <Button size="sm" onClick={() => setNewFileModal(true)} disabled={!owner || !repo}>
            + New File
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="w-full md:w-64 shrink-0">
            <Card className="!p-2">
              {isPending ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-text-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-0.5">
                  {pathParts.length > 0 && (
                    <button
                      onClick={() => {
                        setCurrentPath(pathParts.slice(0, -1).join("/"));
                        setSelectedFile(null);
                      }}
                      className="w-full text-left px-2 py-1.5 text-sm text-text-muted hover:bg-surface-hover rounded-[var(--radius-sm)] transition-colors"
                    >
                      ..
                    </button>
                  )}
                  {files.map((file) => (
                    <button
                      key={file.path}
                      onClick={() => handleFileClick(file)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        if (file.type === "file") {
                          setDeleteModal({ open: true, file });
                        }
                      }}
                      className={`w-full text-left px-2 py-1.5 text-sm rounded-[var(--radius-sm)] transition-colors flex items-center gap-2 ${
                        selectedFile?.path === file.path
                          ? "bg-surface-hover text-text-primary"
                          : "text-text-primary hover:bg-surface-hover"
                      }`}
                    >
                      <span className="text-text-muted">
                        {file.type === "dir" ? "📁" : "📄"}
                      </span>
                      <span className="truncate">{file.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="flex-1 min-w-0">
            {selectedFile ? (
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-text-primary truncate">
                    {selectedFile.path}
                  </h3>
                  <div className="flex gap-2 shrink-0">
                    <Input
                      placeholder="Commit message"
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      className="w-48"
                    />
                    <Button size="sm" onClick={handleSave}>
                      Save
                    </Button>
                  </div>
                </div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-[500px] bg-background text-text-primary font-mono text-sm p-3 border border-border rounded-[var(--radius-sm)] resize-none focus:outline-none focus:border-text-accent"
                  spellCheck={false}
                />
              </Card>
            ) : (
              <Card className="flex items-center justify-center py-20">
                <p className="text-text-muted">Select a file to view or edit</p>
              </Card>
            )}
          </div>
        </div>

        <Modal open={newFileModal} onClose={() => setNewFileModal(false)}>
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Create New File
          </h2>
          <div className="space-y-4">
            <Input
              label="Filename"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="example.ts"
            />
            <div>
              <label className="text-sm font-medium text-text-primary block mb-1.5">
                Content
              </label>
              <textarea
                value={newFileContent}
                onChange={(e) => setNewFileContent(e.target.value)}
                className="w-full h-40 bg-background text-text-primary font-mono text-sm p-3 border border-border rounded-[var(--radius-sm)] resize-none focus:outline-none focus:border-text-accent"
                spellCheck={false}
              />
            </div>
            <Input
              label="Commit Message"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Create new file"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setNewFileModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFile} disabled={!newFileName.trim()}>
                Create File
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          open={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, file: null })}
        >
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            Delete File
          </h2>
          <p className="text-sm text-text-muted mb-4">
            Are you sure you want to delete{" "}
            <span className="text-text-primary font-medium">
              {deleteModal.file?.name}
            </span>
            ? This action cannot be undone.
          </p>
          <Input
            label="Commit Message"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder={`Delete ${deleteModal.file?.name || ""}`}
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => setDeleteModal({ open: false, file: null })}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </Modal>
      </main>
    </div>
  );
}
