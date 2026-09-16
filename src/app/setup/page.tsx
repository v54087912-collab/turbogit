"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { getMasterHash } from "@/lib/indexed-db";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

function SetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlMode = searchParams.get("mode");
  const { isUnlocked, setMasterPassword, unlock } = useAuthStore();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isUnlockMode, setIsUnlockMode] = useState(urlMode === "unlock");

  useEffect(() => {
    if (isUnlocked) {
      router.push("/dashboard");
    }
  }, [isUnlocked, router]);

  useEffect(() => {
    const check = async () => {
      const hash = await getMasterHash();
      if (hash) {
        useAuthStore.setState({ hasMasterPassword: true });
        setIsUnlockMode(true);
      }
    };
    check();
  }, []);

  const handleCreate = async () => {
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    await setMasterPassword(password);
    await unlock(password);
    router.push("/settings");
  };

  const handleUnlock = async () => {
    setError("");
    const success = await unlock(password);
    if (success) {
      router.push("/dashboard");
    } else {
      setError("Invalid master password");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-sm w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary">
            {isUnlockMode ? "Unlock TurboGit" : "Create Master Password"}
          </h1>
          <p className="text-sm text-text-muted mt-2">
            {isUnlockMode
              ? "Enter your master password to unlock the app"
              : "This password encrypts all your local data. It cannot be recovered."}
          </p>
        </div>

        <div className="space-y-4">
          <Input
            label="Master Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />

          {!isUnlockMode && (
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
            />
          )}

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button
            className="w-full"
            onClick={isUnlockMode ? handleUnlock : handleCreate}
            disabled={
              isUnlockMode ? !password : !password || !confirmPassword
            }
          >
            {isUnlockMode ? "Unlock" : "Create & Continue"}
          </Button>
        </div>
      </div>
    </main>
  );
}

export default function SetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-text-accent border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SetupContent />
    </Suspense>
  );
}
