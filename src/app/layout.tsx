import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "TurboGit Web",
  description: "A clean, minimal, browser-based GitHub client with MTProto caching",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TurboGit",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d1117",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-text-primary">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1f2328",
              border: "1px solid #484f58",
              color: "#f0f6fc",
              borderRadius: "8px",
            },
          }}
        />
      </body>
    </html>
  );
}
