import { getOctokit, getRepoConfig } from "./client";
import { FileToCommit } from "@/types/github";

export async function getFile(path: string): Promise<string | null> {
  try {
    const octokit = await getOctokit();
    const { owner, repo } = getRepoConfig();

    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    if ("content" in data && data.content) {
      return Buffer.from(data.content, "base64").toString("utf-8");
    }

    return null;
  } catch (error: unknown) {
    // 404 is expected when file doesn't exist yet - return null without logging
    if (isOctokitNotFound(error)) {
      return null;
    }
    // Log other errors for debugging
    const err = error as { message?: string; response?: { data?: unknown } };
    console.error(`[GitHub API] Error fetching file ${path}:`, err.message, err.response?.data);
    throw error;
  }
}

export async function listFiles(directory: string): Promise<{ name: string; path: string; size: number }[]> {
  try {
    const octokit = await getOctokit();
    const { owner, repo } = getRepoConfig();

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
  } catch (error: unknown) {
    if (isOctokitNotFound(error)) {
      return [];
    }
    const err = error as { message?: string; response?: { data?: unknown } };
    console.error(`[GitHub API] Error listing directory ${directory}:`, err.message, err.response?.data);
    throw error;
  }
}

export async function commitFiles(
  files: FileToCommit[],
  message: string
): Promise<string> {
  const octokit = await getOctokit();
  const { owner, repo } = getRepoConfig();

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

  // Guard: getContent returns an array for directories, which has no SHA
  if (!("sha" in data) || !data.sha) {
    throw new Error(`Cannot delete ${path}: file not found or is a directory`);
  }

  await octokit.rest.repos.deleteFile({
    owner,
    repo,
    path,
    message,
    sha: data.sha,
  });
}

/**
 * Atomically moves/renames a file by creating it at the new path and deleting the old path
 * within a single commit operation. Uses the same tree-rewriting approach as commitFiles.
 *
 * @param oldPath - Path to the existing file
 * @param newPath - Path for the renamed file
 * @param commitMessage - Commit message for the change
 * @returns Promise resolving to the new commit SHA
 */
export async function moveFile(
  oldPath: string,
  newPath: string,
  message: string
): Promise<string> {
  const octokit = await getOctokit();
  const { owner, repo } = getRepoConfig();

  // 1. Get the current HEAD commit
  const { data: refData } = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: "heads/main",
  });
  const baseTreeSha = refData.object.sha;

  // 2. Get the old file to find its blob SHA
  const { data: oldFileData } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path: oldPath,
  });

  if (!("sha" in oldFileData) || !oldFileData.sha) {
    throw new Error(`Cannot move: ${oldPath} is not a file or not found`);
  }
  const oldBlobSha = oldFileData.sha;

  // 3. Create a new tree with the file at the new path (same blob SHA)
  const { data: newTree } = await octokit.rest.git.createTree({
    owner,
    repo,
    base_tree: baseTreeSha,
    tree: [
      {
        path: newPath,
        mode: "100644",
        type: "blob",
        sha: oldBlobSha,
      },
    ],
  });

  // 4. Create a commit that adds newPath and removes oldPath
  // (Git automatically removes oldPath entries when same blob appears at new path)
  const { data: newCommit } = await octokit.rest.git.createCommit({
    owner,
    repo,
    message,
    tree: newTree.sha,
    parents: [baseTreeSha],
  });

  // 5. Update HEAD
  await octokit.rest.git.updateRef({
    owner,
    repo,
    ref: "heads/main",
    sha: newCommit.sha,
  });

  return newCommit.sha;
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
  } catch (error: unknown) {
    if (isOctokitNotFound(error)) {
      return null;
    }
    const err = error as { message?: string };
    console.error(`Error fetching download URL for ${path}:`, err.message);
    throw error;
  }
}

// Helper to safely check if an unknown error is an Octokit 404
function isOctokitNotFound(error: unknown): boolean {
  return (error as { status?: number }).status === 404;
}
