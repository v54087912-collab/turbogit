"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { getMasterHash } from "@/lib/indexed-db";
import Button from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const { isUnlocked, hasMasterPassword } = useAuthStore();

  useEffect(() => {
    if (isUnlocked) {
      router.push("/dashboard");
    }
  }, [isUnlocked, router]);

  useEffect(() => {
    const checkSetup = async () => {
      const hash = await getMasterHash();
      if (!hash) {
        // No master password set, go to setup
      }
    };
    checkSetup();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            TurboGit
          </h1>
          <p className="text-text-muted">
            A clean, minimal GitHub client with super-fast caching
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/setup">
            <Button size="lg" className="w-full">
              Get Started
            </Button>
          </Link>
          {hasMasterPassword && (
            <Link href="/setup?mode=unlock">
              <Button variant="ghost" size="lg" className="w-full">
                Unlock
              </Button>
            </Link>
          )}
        </div>

        <div className="text-xs text-text-muted space-y-1">
          <p>Client-side encrypted. No backend server.</p>
          <p>Uses Telegram Saved Messages as a private cache.</p>
        </div>
      </div>
    </main>
  );
}
