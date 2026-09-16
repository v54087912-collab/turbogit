"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { getMasterHash } from "@/lib/indexed-db";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Navbar from "@/components/navbar";
import SessionWizard from "@/components/session-wizard/session-wizard";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const {
    isUnlocked,
    hasCredentials,
    hasPermanentSession,
    saveGitHubToken,
    saveTelegramApi,
    testConnections,
  } = useAuthStore();

  const [githubToken, setGithubToken] = useState("");
  const [tgApiId, setTgApiId] = useState("");
  const [tgApiHash, setTgApiHash] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

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

  const handleSaveGitHub = async () => {
    if (!githubToken.trim()) return;
    try {
      await saveGitHubToken(githubToken.trim());
      toast.success("GitHub token saved");
      setGithubToken("");
    } catch {
      toast.error("Failed to save GitHub token");
    }
  };

  const handleSaveTelegram = async () => {
    const apiId = parseInt(tgApiId);
    if (!apiId || !tgApiHash.trim()) return;
    try {
      await saveTelegramApi(apiId, tgApiHash.trim());
      toast.success("Telegram API credentials saved");
      setTgApiId("");
      setTgApiHash("");
    } catch {
      toast.error("Failed to save Telegram credentials");
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const result = await testConnections();
      if (result.github && result.telegram) {
        toast.success("All systems green");
      } else {
        const failures = [];
        if (!result.github) failures.push("GitHub");
        if (!result.telegram) failures.push("Telegram");
        toast.error(`Invalid credentials: ${failures.join(", ")}`);
      }
    } catch {
      toast.error("Connection test failed");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto p-4 md:p-6 pb-24 md:pb-6 space-y-6">
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>

        <Card>
          <h2 className="text-base font-semibold text-text-primary mb-4">
            GitHub Configuration
          </h2>
          <div className="space-y-4">
            <Input
              label="GitHub Personal Access Token"
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
              helperText="Create a token at github.com/settings/tokens with 'repo' scope"
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={handleSaveGitHub} disabled={!githubToken.trim()}>
                Save Token
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-text-primary mb-4">
            Telegram API Configuration
          </h2>
          <div className="space-y-4">
            <Input
              label="API ID"
              type="number"
              value={tgApiId}
              onChange={(e) => setTgApiId(e.target.value)}
              placeholder="12345678"
            />
            <Input
              label="API Hash"
              value={tgApiHash}
              onChange={(e) => setTgApiHash(e.target.value)}
              placeholder="0123456789abcdef0123456789abcdef"
            />
            <p className="text-xs text-text-muted">
              Get these from{" "}
              <a
                href="https://my.telegram.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-accent hover:underline"
              >
                my.telegram.org
              </a>
            </p>
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleSaveTelegram}
                disabled={!tgApiId || !tgApiHash.trim()}
              >
                Save Credentials
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-text-primary mb-4">
            Test Connection
          </h2>
          <Button
            onClick={handleTest}
            disabled={isTesting || !hasCredentials}
          >
            {isTesting ? "Testing..." : "Test All Connections"}
          </Button>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-text-primary mb-2">
            Permanent Session
          </h2>
          <p className="text-sm text-text-muted mb-4">
            {hasPermanentSession
              ? "A permanent session has been created. Your data is cached via Telegram Saved Messages."
              : "Create a permanent session to enable MTProto caching. This is a required step."}
          </p>
          {!hasPermanentSession && (
            <Button
              onClick={() => setShowWizard(true)}
              disabled={!hasCredentials}
            >
              Create Permanent Session
            </Button>
          )}
          {hasPermanentSession && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm text-primary">Active</span>
            </div>
          )}
        </Card>

        <SessionWizard
          open={showWizard}
          onClose={() => setShowWizard(false)}
        />
      </main>
    </div>
  );
}
