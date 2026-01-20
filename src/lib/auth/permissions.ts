import { isCollaborator } from "@/services/github/content";

export async function checkPermissions(username: string): Promise<boolean> {
  return isCollaborator(username);
}
