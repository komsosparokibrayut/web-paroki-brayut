import sharp from "sharp";

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
  size: number;
}

export async function processImage(
  input: Buffer,
  type: "banner" | "inline"
): Promise<ProcessedImage> {
  const maxDimensions = type === "banner" 
    ? { width: 1920, height: 1080 }
    : { width: 1200, height: 1200 };

  const processed = sharp(input)
    .resize(maxDimensions.width, maxDimensions.height, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 85 });

  const buffer = await processed.toBuffer();
  const metadata = await sharp(buffer).metadata();

  return {
    buffer,
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: "webp",
    size: buffer.length,
  };
}

export function generateImageFilename(originalName: string, type: "banner" | "inline"): string {
  const timestamp = Date.now();
  const hash = Math.random().toString(36).substring(2, 8);
  const baseName = originalName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${type === "inline" ? "inline-" : ""}${baseName}-${timestamp}-${hash}.webp`;
}
