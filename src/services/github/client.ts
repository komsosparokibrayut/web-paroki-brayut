import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";

let octokitInstance: Octokit | null = null;
let tokenExpiry: number = 0;

/**
 * Check if GitHub App credentials are configured
 * Returns false if any required env var is missing or empty
 */
export function isGitHubConfigured(): boolean {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
  const installationId = process.env.GITHUB_APP_INSTALLATION_ID;
  const owner = process.env.CONTENT_REPO_OWNER;
  const repo = process.env.CONTENT_REPO_NAME;

  return !!(
    appId && appId.trim() &&
    privateKey && privateKey.trim() &&
    installationId && installationId.trim() &&
    owner && owner.trim() &&
    repo && repo.trim()
  );
}

export async function getOctokit(): Promise<Octokit> {
  const now = Date.now();
  
  // Reuse existing instance if token is still valid (with 5 min buffer)
  if (octokitInstance && tokenExpiry > now + 5 * 60 * 1000) {
    return octokitInstance;
  }

  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
  const installationId = process.env.GITHUB_APP_INSTALLATION_ID;

  if (!appId || !privateKey || !installationId) {
    console.error("[GitHub App] Missing required credentials. Check matching env vars: GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY, GITHUB_APP_INSTALLATION_ID.");
    console.error(`[GitHub App] Found: appId=${!!appId}, privateKey=${!!privateKey}, installationId=${!!installationId}`);
    throw new Error(
      "Missing GitHub App credentials. Please set GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY, and GITHUB_APP_INSTALLATION_ID"
    );
  }

  try {
    // Create new Octokit instance with GitHub App authentication
    octokitInstance = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId,
        privateKey: privateKey.replace(/\\n/g, "\n"),
        installationId,
      },
      log: {
        debug: () => {},
        info: () => {},
        warn: (msg) => console.warn(`[GitHub App Warn] ${msg}`),
        error: (msg) => console.error(`[GitHub App Error] ${msg}`),
      },
    });

    // Test authentication quietly to make sure it works
    await octokitInstance.rest.apps.getAuthenticated();
    
    // Installation tokens expire after 1 hour
    tokenExpiry = now + 60 * 60 * 1000;
  } catch (error) {
    console.error("[GitHub App] Failed to initialize Octokit with provided app credentials:", error);
    throw error;
  }

  return octokitInstance;
}

export function getRepoConfig() {
  const owner = process.env.CONTENT_REPO_OWNER;
  const repo = process.env.CONTENT_REPO_NAME;

  if (!owner || !repo) {
    console.error(`[GitHub Repo] Missing repository config. owner=${owner}, repo=${repo}`);
    throw new Error(
      "Missing repository configuration. Please set CONTENT_REPO_OWNER and CONTENT_REPO_NAME"
    );
  }

  return { owner, repo };
}
