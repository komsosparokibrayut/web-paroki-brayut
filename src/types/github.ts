
export interface FileToCommit {
  path: string;
  content: string | Buffer;
  encoding?: "utf-8" | "base64";
}
