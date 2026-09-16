"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/workflows", label: "Workflows" },
  { href: "/files", label: "Files" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isUnlocked, lock } = useAuthStore();

  if (!isUnlocked) return null;

  return (
    <>
      <nav className="sticky top-0 z-40 bg-surface border-b border-border px-4 md:px-6 h-14 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-lg font-bold text-text-primary hover:no-underline"
        >
          TurboGit
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 text-sm rounded-[var(--radius-sm)] transition-colors hover:bg-surface-hover hover:no-underline ${
                pathname.startsWith(item.href)
                  ? "text-text-primary bg-surface-hover"
                  : "text-text-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="p-2 text-text-muted hover:text-text-primary rounded-[var(--radius-sm)] hover:bg-surface-hover transition-colors"
            title="Settings"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </Link>
          <button
            onClick={lock}
            className="text-xs text-text-muted hover:text-danger transition-colors hidden md:block"
          >
            Lock
          </button>
        </div>
      </nav>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border md:hidden flex items-center justify-around h-14">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] rounded-[var(--radius-sm)] transition-colors hover:no-underline ${
              pathname.startsWith(item.href)
                ? "text-text-accent"
                : "text-text-muted"
            }`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {item.href === "/dashboard" && (
                <>
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </>
              )}
              {item.href === "/workflows" && (
                <>
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </>
              )}
              {item.href === "/files" && (
                <>
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </>
              )}
            </svg>
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
