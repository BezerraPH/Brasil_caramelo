import sharp from "sharp";

const MAX_WIDTH = 1200;
const WEBP_QUALITY = 82;

const OPTIMIZE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

/** Redimensiona e converte imagens raster para WebP (GIF animado não é alterado). */
export async function optimizeImageBuffer(
  buffer: Buffer,
  mime: string,
): Promise<{ buffer: Buffer; mime: string; ext: string } | null> {
  if (!OPTIMIZE_MIMES.has(mime)) return null;

  try {
    const out = await sharp(buffer)
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    return { buffer: out, mime: "image/webp", ext: ".webp" };
  } catch {
    return null;
  }
}
