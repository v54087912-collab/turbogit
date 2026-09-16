export interface RepoInfo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  updated_at: string;
  html_url: string;
  default_branch: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface WorkflowInfo {
  id: number;
  name: string;
  path: string;
  state: string;
  created_at: string;
  updated_at: string;
}

export interface FileInfo {
  name: string;
  path: string;
  type: "file" | "dir";
  size: number;
  sha: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyOctokit = any;

export async function getFileTree(
  octokit: AnyOctokit,
  owner: string,
  repo: string,
  path: string = ""
): Promise<FileInfo[]> {
  const { data } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
  });

  if (Array.isArray(data)) {
    return data.map((item: Record<string, unknown>) => ({
      name: item.name as string,
      path: item.path as string,
      type: item.type as "file" | "dir",
      size: item.size as number,
      sha: item.sha as string,
    }));
  }

  const d = data as Record<string, unknown>;
  return [
    {
      name: d.name as string,
      path: d.path as string,
      type: d.type as "file" | "dir",
      size: d.size as number,
      sha: d.sha as string,
    },
  ];
}

export async function getFileContent(
  octokit: AnyOctokit,
  owner: string,
  repo: string,
  path: string
): Promise<{ content: string; sha: string }> {
  const { data } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
  });

  if (Array.isArray(data)) {
    throw new Error("Path does not point to a file");
  }

  const d = data as Record<string, unknown>;
  if (d.type !== "file") {
    throw new Error("Path does not point to a file");
  }

  const content = atob(d.content as string);
  return { content, sha: d.sha as string };
}

export async function createOrUpdateFile(
  octokit: AnyOctokit,
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  sha?: string
): Promise<void> {
  await octokit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: btoa(content),
    sha,
  });
}

export async function deleteFile(
  octokit: AnyOctokit,
  owner: string,
  repo: string,
  path: string,
  sha: string,
  message: string
): Promise<void> {
  await octokit.rest.repos.deleteFile({
    owner,
    repo,
    path,
    message,
    sha,
  });
}
