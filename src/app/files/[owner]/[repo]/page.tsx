import FilesClient from "./files-client";

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
