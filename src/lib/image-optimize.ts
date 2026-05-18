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

/** Miniatura ~20px para blur-up (LQIP). */
export async function generateBlurDataUrl(buffer: Buffer): Promise<string | null> {
  try {
    const tiny = await sharp(buffer)
      .rotate()
      .resize(20, 20, { fit: "inside" })
      .webp({ quality: 40 })
      .toBuffer();
    return `data:image/webp;base64,${tiny.toString("base64")}`;
  } catch {
    return null;
  }
}
