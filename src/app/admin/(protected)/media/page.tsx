import { listImages } from "@/actions/media";
import MediaManager from "@/components/admin/MediaManager";

export default async function MediaPage() {
  const { inline } = await listImages();
  // listImages returns everything in 'inline' (or whatever key we chose in valid refactor)
  // Check actions/media.ts: It returns { banners: [], inline: uniquePaths }
  
  return (
    <div>
        <MediaManager initialImages={inline} />
    </div>
  );
}
