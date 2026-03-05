import { getOctokit, getRepoConfig } from "./client";
import { FileToCommit } from "@/types/github";

export async function getFile(path: string): Promise<string | null> {
  try {
    const octokit = await getOctokit();
    const { owner, repo } = getRepoConfig();
    
    console.log(`[GitHub API] Fetching file: ${owner}/${repo}/${path}`);

    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    if ("content" in data && data.content) {
      return Buffer.from(data.content, "base64").toString("utf-8");
    }

    return null;
  } catch (error: any) {
    // 404 is expected when file doesn't exist yet - return null without logging
    if (error.status === 404) {
      console.log(`[GitHub API] File not found (404), returning null: ${path}`);
      return null;
    }
    // Log other errors for debugging
    console.error(`[GitHub API] Error fetching file ${path}:`, error.message, error.response?.data);
    throw error;
  }
}

export async function listFiles(directory: string): Promise<{ name: string; path: string; size: number }[]> {
  try {
    const octokit = await getOctokit();
    const { owner, repo } = getRepoConfig();
    
    console.log(`[GitHub API] Listing files in directory: ${owner}/${repo}/${directory}`);

    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: directory,
    });

    if (Array.isArray(data)) {
      return data
        .filter((item) => item.type === "file")
        .map((item) => ({
          name: item.name,
          path: item.path,
          size: item.size,
        }));
    }

    return [];
  } catch (error: any) {
    if (error.status === 404) {
      console.log(`[GitHub API] Directory not found (404), returning empty array: ${directory}`);
      return [];
    }
    console.error(`[GitHub API] Error listing directory ${directory}:`, error.message, error.response?.data);
    throw error;
  }
}

export async function commitFiles(
  files: FileToCommit[],
  message: string
): Promise<string> {
  const octokit = await getOctokit();
  const { owner, repo } = getRepoConfig();

  console.log(`[GitHub API] Starting commit for ${files.length} files: ${files.map(f => f.path).join(", ")}`);
  
  try {
    // Get the latest commit SHA
    const { data: ref } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: "heads/main",
    });

  const latestCommitSha = ref.object.sha;

  // Get the tree for the latest commit
  const { data: commit } = await octokit.rest.git.getCommit({
    owner,
    repo,
    commit_sha: latestCommitSha,
  });

    const baseTreeSha = commit.tree.sha;
    console.log(`[GitHub API] Retrieved base tree: ${baseTreeSha}`);

  // Create blobs for each file
  const blobs = await Promise.all(
    files.map(async (file) => {
      const content =
        typeof file.content === "string"
          ? file.content
          : file.content.toString("base64");
      const encoding = file.encoding || (typeof file.content === "string" ? "utf-8" : "base64");

      const { data: blob } = await octokit.rest.git.createBlob({
        owner,
        repo,
        content,
        encoding,
      });

      return {
        path: file.path,
        mode: "100644" as const,
        type: "blob" as const,
        sha: blob.sha,
      };
    })
  );

  // Create a new tree
  const { data: newTree } = await octokit.rest.git.createTree({
    owner,
    repo,
    base_tree: baseTreeSha,
    tree: blobs,
  });

  // Create a new commit
  const { data: newCommit } = await octokit.rest.git.createCommit({
    owner,
    repo,
    message,
    tree: newTree.sha,
    parents: [latestCommitSha],
  });

  // Update the reference
  await octokit.rest.git.updateRef({
    owner,
    repo,
    ref: "heads/main",
    sha: newCommit.sha,
  });

  console.log(`[GitHub API] Successfully committed ${files.length} files. New HEAD: ${newCommit.sha}`);
  return newCommit.sha;
  } catch (error) {
    console.error(`[GitHub API] Error during commit of ${files.length} files:`, error);
    throw error;
  }
}

export async function deleteFile(
  path: string,
  message: string
): Promise<void> {
  const octokit = await getOctokit();
  const { owner, repo } = getRepoConfig();

  // Get the file to get its SHA
  const { data } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
  });

  if ("sha" in data) {
    await octokit.rest.repos.deleteFile({
      owner,
      repo,
      path,
      message,
      sha: data.sha,
    });
  }
}



export async function getDownloadUrl(path: string): Promise<string | null> {
  try {
    const octokit = await getOctokit();
    const { owner, repo } = getRepoConfig();

    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    if (!Array.isArray(data) && "download_url" in data && data.download_url) {
      return data.download_url;
    }

    return null;
  } catch (error: any) {
    if (error.status === 404) {
      return null;
    }
    console.error(`Error fetching download URL for ${path}:`, error);
    throw error;
  }
}

