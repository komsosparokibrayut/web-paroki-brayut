export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: string;
  content?: string;
  encoding?: string;
}

export interface GitHubCommit {
  sha: string;
  url: string;
  message: string;
}

export interface FileToCommit {
  path: string;
  content: string | Buffer;
  encoding?: "utf-8" | "base64";
}
