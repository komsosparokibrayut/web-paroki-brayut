import { getOctokit, getRepoConfig } from "@/lib/github/client";

export async function checkPermissions(username: string): Promise<boolean> {
  try {
    const octokit = await getOctokit();
    const { owner, repo } = getRepoConfig();

    await octokit.rest.repos.checkCollaborator({
      owner,
      repo,
      username,
    });

    return true;
  } catch (error: any) {
    if (error.status === 404) {
      return false;
    }
    throw error;
  }
}
