import dynamic from "next/dynamic";

const FilesClient = dynamic(() => import("./files-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-text-accent border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export function generateStaticParams() {
  return [{ owner: "_", repo: "_" }];
}

interface FilesPageProps {
  params: Promise<{ owner: string; repo: string }>;
}

export default async function FilesPage({ params }: FilesPageProps) {
  const resolvedParams = await params;
  return (
    <FilesClient
      initialOwner={resolvedParams.owner}
      initialRepo={resolvedParams.repo}
    />
  );
}
