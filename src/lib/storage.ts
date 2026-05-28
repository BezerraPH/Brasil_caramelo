import { randomUUID } from "crypto";
import { mkdir, writeFile, access, readdir, stat, unlink, readFile } from "fs/promises";
import { constants } from "fs";
import path from "path";
import { generateBlurDataUrl, generateGridThumbnail, optimizeImageBuffer } from "./image-optimize";
import {
  checkObjectStorageReady,
  deleteObject,
  getObject,
  getObjectRange,
  headObject,
  isObjectStorageEnabled,
  listObjectStorageStats,
  putObject,
} from "./object-storage";

export type UploadKind =
  | "avatar"
  | "postImage"
  | "postVideo"
  | "story"
  | "chatAttachment"
  | "voiceNote"
  | "albumPhoto";

export type StorageBackend = "local" | "minio";

const MIME_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/heic": ".heic",
  "image/heif": ".heif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
  "audio/webm": ".webm",
  "audio/ogg": ".ogg",
  "audio/mpeg": ".mp3",
};

const LIMITS: Record<
  UploadKind,
  { maxBytes: number; mimes: Set<string> }
> = {
  avatar: {
    maxBytes: 4 * 1024 * 1024,
    mimes: imageUploadMimes(),
  },
  postImage: {
    maxBytes: 8 * 1024 * 1024,
    mimes: imageUploadMimes(),
  },
  postVideo: {
    maxBytes: 32 * 1024 * 1024,
    mimes: new Set(["video/mp4", "video/webm", "video/quicktime"]),
  },
  story: {
    maxBytes: 16 * 1024 * 1024,
    mimes: new Set([
      ...imageUploadMimes(),
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ]),
  },
  chatAttachment: {
    maxBytes: 8 * 1024 * 1024,
    mimes: new Set([
      ...imageUploadMimes(),
      "application/pdf",
    ]),
  },
  voiceNote: {
    maxBytes: 512 * 1024,
    mimes: new Set(["audio/webm", "audio/ogg", "audio/mpeg"]),
  },
  albumPhoto: {
    maxBytes: 8 * 1024 * 1024,
    mimes: imageUploadMimes(),
  },
};

const EXT_TO_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".heic": "image/heic",
  ".heif": "image/heif",
  ".mp4": "video/mp4",
  ".m4v": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

function imageUploadMimes(): Set<string> {
  return new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic",
    "image/heif",
  ]);
}

/** Detecta vídeo pelo cabeçalho (iOS costuma enviar .mov sem MIME). */
function sniffVideoMime(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;
  if (buffer.subarray(4, 8).toString("ascii") === "ftyp") {
    return "video/mp4";
  }
  if (
    buffer[0] === 0x1a &&
    buffer[1] === 0x45 &&
    buffer[2] === 0xdf &&
    buffer[3] === 0xa3
  ) {
    return "video/webm";
  }
  return null;
}

function mimeRejectMessage(kind: UploadKind): string {
  const mimes = LIMITS[kind].mimes;
  const hasVideo = [...mimes].some((m) => m.startsWith("video/"));
  const hasPdf = mimes.has("application/pdf");
  if (hasVideo && hasPdf) {
    return "Tipo não permitido. Use JPG/PNG/WebP/GIF, MP4/WebM/MOV ou PDF.";
  }
  if (hasVideo) {
    return "Tipo não permitido. Use MP4, WebM ou MOV.";
  }
  if (hasPdf) {
    return "Tipo não permitido. Use JPG, PNG, WebP, GIF ou PDF.";
  }
  return "Tipo não permitido. Use JPG, PNG, WebP ou GIF.";
}

/** MIME do File (Safari/iOS às veis envia type vazio). */
async function resolveUploadMime(file: File, buffer: Buffer): Promise<string> {
  const declared = file.type?.trim();
  if (declared && declared !== "application/octet-stream") return declared;

  const ext = path.extname(file.name ?? "").toLowerCase();
  if (ext && EXT_TO_MIME[ext]) return EXT_TO_MIME[ext];

  const video = sniffVideoMime(buffer);
  if (video) return video;

  try {
    const sharp = (await import("sharp")).default;
    const format = (await sharp(buffer).metadata()).format;
    const fromSharp: Record<string, string> = {
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
      heif: "image/heic",
    };
    if (format && fromSharp[format]) return fromSharp[format];
  } catch {
    /* não é imagem raster */
  }

  return declared || "application/octet-stream";
}

const DEFAULT_UPLOAD_SUBDIR = "data/uploads";

export function getStorageBackend(): StorageBackend {
  return isObjectStorageEnabled() ? "minio" : "local";
}

export function isSafeRelativePath(relativePath: string): boolean {
  if (!relativePath || relativePath.includes("..")) return false;
  const normalized = relativePath.replace(/\\/g, "/");
  return !normalized.startsWith("/") && !normalized.includes("//");
}

export function getUploadRoot(): string {
  const custom = process.env.UPLOAD_DIR?.trim();
  if (custom) return custom;
  return path.join(
    /* turbopackIgnore: true */ process.cwd(),
    ...DEFAULT_UPLOAD_SUBDIR.split("/"),
  );
}

export function mediaUrlToRelativePath(url: string | null | undefined): string | null {
  if (!url?.startsWith("/api/media/")) return null;
  return url.slice("/api/media/".length);
}

async function deleteRelativePath(relative: string): Promise<void> {
  if (!isSafeRelativePath(relative)) return;
  if (isObjectStorageEnabled()) {
    await deleteObject(relative);
    await deleteObject(`${relative}.blur`);
    return;
  }
  const absolute = resolveSafePath(relative);
  if (!absolute) return;
  try {
    await unlink(absolute);
    await unlink(`${absolute}.blur`).catch(() => {});
  } catch {
    /* arquivo já removido */
  }
}

export async function deleteMediaByUrl(url: string | null | undefined): Promise<void> {
  const relative = mediaUrlToRelativePath(url);
  if (!relative) return;
  await deleteRelativePath(relative);
}

export async function deletePhotoMedia(
  url: string | null | undefined,
  thumbUrl: string | null | undefined,
): Promise<void> {
  await Promise.all([deleteMediaByUrl(url), deleteMediaByUrl(thumbUrl)]);
}

export function publicMediaUrl(relativePath: string): string {
  const normalized = relativePath.replace(/\\/g, "/");
  return `/api/media/${normalized}`;
}

export function resolveSafePath(relativePath: string): string | null {
  if (!isSafeRelativePath(relativePath)) return null;
  const root = path.resolve(getUploadRoot());
  const resolved = path.resolve(root, relativePath);
  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    return null;
  }
  return resolved;
}

export function mimeFromPath(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".m3u8": "application/vnd.apple.mpegurl",
    ".ts": "video/mp2t",
  };
  return map[ext] ?? "application/octet-stream";
}

export async function readMediaBytes(relativePath: string): Promise<Buffer | null> {
  if (!isSafeRelativePath(relativePath)) return null;
  if (isObjectStorageEnabled()) {
    return getObject(relativePath);
  }
  const absolute = resolveSafePath(relativePath);
  if (!absolute) return null;
  try {
    return await readFile(absolute);
  } catch {
    return null;
  }
}

export async function statMediaFile(
  relativePath: string,
): Promise<{ size: number } | null> {
  if (!isSafeRelativePath(relativePath)) return null;
  if (isObjectStorageEnabled()) {
    const meta = await headObject(relativePath);
    return meta ? { size: meta.size } : null;
  }
  const absolute = resolveSafePath(relativePath);
  if (!absolute) return null;
  try {
    const s = await stat(absolute);
    return { size: s.size };
  } catch {
    return null;
  }
}

export async function readMediaRange(
  relativePath: string,
  start: number,
  end: number,
): Promise<{ data: Buffer; size: number } | null> {
  if (!isSafeRelativePath(relativePath)) return null;
  if (isObjectStorageEnabled()) {
    const chunk = await getObjectRange(relativePath, start, end);
    if (!chunk) return null;
    return { data: chunk.data, size: chunk.size };
  }
  const absolute = resolveSafePath(relativePath);
  if (!absolute) return null;
  try {
    const fileStat = await stat(absolute);
    const data = await readFile(absolute);
    const chunk = data.subarray(start, end + 1);
    return { data: chunk, size: fileStat.size };
  } catch {
    return null;
  }
}

async function writeMediaBytes(
  relativePath: string,
  buffer: Buffer,
  mime: string,
): Promise<void> {
  if (!isSafeRelativePath(relativePath)) throw new Error("Caminho inválido.");
  if (isObjectStorageEnabled()) {
    await putObject(relativePath, buffer, mime);
    return;
  }
  const absolutePath = resolveSafePath(relativePath);
  if (!absolutePath) throw new Error("Caminho inválido.");
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, buffer);
}

export async function getStorageStats(): Promise<{
  files: number;
  bytes: number;
}> {
  if (isObjectStorageEnabled()) {
    return listObjectStorageStats();
  }
  const root = getUploadRoot();
  let files = 0;
  let bytes = 0;

  async function walk(dir: string) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile()) {
        files += 1;
        const s = await stat(full);
        bytes += s.size;
      }
    }
  }

  await walk(root);
  return { files, bytes };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/** Pasta local gravável ou MinIO acessível. */
export async function ensureUploadDirWritable(): Promise<boolean> {
  if (isObjectStorageEnabled()) {
    return checkObjectStorageReady();
  }
  const root = getUploadRoot();
  try {
    await mkdir(root, { recursive: true });
    await access(root, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

export async function saveUploadedFile(
  file: File,
  userId: string,
  kind: UploadKind,
): Promise<{
  url: string;
  relativePath: string;
  mime: string;
  thumbUrl?: string;
  buffer: Buffer;
}> {
  const rules = LIMITS[kind];
  if (file.size > rules.maxBytes) {
    throw new Error(
      `Arquivo muito grande. Máximo: ${Math.round(rules.maxBytes / (1024 * 1024))} MB.`,
    );
  }

  let buffer: Buffer = Buffer.from(await file.arrayBuffer());
  let mime = await resolveUploadMime(file, buffer);

  if (!rules.mimes.has(mime)) {
    throw new Error(mimeRejectMessage(kind));
  }

  let ext = MIME_EXT[mime];
  if (!ext) throw new Error("Extensão não suportada.");

  const shouldOptimize =
    kind === "avatar" ||
    kind === "postImage" ||
    kind === "story" ||
    kind === "chatAttachment" ||
    kind === "albumPhoto";
  if (shouldOptimize && mime !== "image/gif") {
    const optimized = await optimizeImageBuffer(buffer, mime);
    if (optimized) {
      buffer = Buffer.from(optimized.buffer);
      mime = optimized.mime;
      ext = optimized.ext;
    }
  }

  const fileId = randomUUID();
  const relativePath = `${userId}/${fileId}${ext}`;

  await writeMediaBytes(relativePath, buffer, mime);

  let thumbUrl: string | undefined;
  if (kind === "albumPhoto" && mime.startsWith("image/") && mime !== "image/gif") {
    const thumbBuf = await generateGridThumbnail(buffer);
    if (thumbBuf) {
      const thumbRelative = `${userId}/${fileId}_thumb.webp`;
      await writeMediaBytes(thumbRelative, thumbBuf, "image/webp");
      thumbUrl = publicMediaUrl(thumbRelative);
    }
  }

  if (mime.startsWith("image/") && mime !== "image/gif") {
    const blur = await generateBlurDataUrl(buffer);
    if (blur) {
      await writeMediaBytes(`${relativePath}.blur`, Buffer.from(blur, "utf8"), "text/plain");
    }
  }

  return {
    url: publicMediaUrl(relativePath),
    relativePath,
    mime,
    thumbUrl,
    buffer,
  };
}
