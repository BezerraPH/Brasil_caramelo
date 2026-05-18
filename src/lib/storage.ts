import { randomUUID } from "crypto";
import { mkdir, writeFile, access, readdir, stat, unlink } from "fs/promises";
import { constants } from "fs";
import path from "path";
import { generateBlurDataUrl, optimizeImageBuffer } from "./image-optimize";

export type UploadKind =
  | "avatar"
  | "postImage"
  | "postVideo"
  | "story"
  | "chatAttachment";

const MIME_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
};

const LIMITS: Record<
  UploadKind,
  { maxBytes: number; mimes: Set<string> }
> = {
  avatar: {
    maxBytes: 4 * 1024 * 1024,
    mimes: new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]),
  },
  postImage: {
    maxBytes: 8 * 1024 * 1024,
    mimes: new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]),
  },
  postVideo: {
    maxBytes: 32 * 1024 * 1024,
    mimes: new Set(["video/mp4", "video/webm", "video/quicktime"]),
  },
  story: {
    maxBytes: 16 * 1024 * 1024,
    mimes: new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ]),
  },
  chatAttachment: {
    maxBytes: 8 * 1024 * 1024,
    mimes: new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
    ]),
  },
};

const DEFAULT_UPLOAD_SUBDIR = "data/uploads";

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

export async function deleteMediaByUrl(url: string | null | undefined): Promise<void> {
  const relative = mediaUrlToRelativePath(url);
  if (!relative) return;
  const absolute = resolveSafePath(relative);
  if (!absolute) return;
  try {
    await unlink(absolute);
    await unlink(`${absolute}.blur`).catch(() => {});
  } catch {
    /* arquivo já removido ou inexistente */
  }
}

export function publicMediaUrl(relativePath: string): string {
  const normalized = relativePath.replace(/\\/g, "/");
  return `/api/media/${normalized}`;
}

export function resolveSafePath(relativePath: string): string | null {
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

export async function getStorageStats(): Promise<{
  files: number;
  bytes: number;
}> {
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

export async function ensureUploadDirWritable(): Promise<boolean> {
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
): Promise<{ url: string; relativePath: string; mime: string }> {
  const rules = LIMITS[kind];
  if (!rules.mimes.has(file.type)) {
    throw new Error("Tipo de arquivo não permitido.");
  }
  if (file.size > rules.maxBytes) {
    throw new Error(
      `Arquivo muito grande. Máximo: ${Math.round(rules.maxBytes / (1024 * 1024))} MB.`,
    );
  }

  let mime = file.type;
  let ext = MIME_EXT[file.type];
  if (!ext) throw new Error("Extensão não suportada.");

  let buffer: Buffer = Buffer.from(await file.arrayBuffer());

  const shouldOptimize =
    kind === "avatar" ||
    kind === "postImage" ||
    kind === "story" ||
    kind === "chatAttachment";
  if (shouldOptimize && mime !== "image/gif") {
    const optimized = await optimizeImageBuffer(buffer, mime);
    if (optimized) {
      buffer = Buffer.from(optimized.buffer);
      mime = optimized.mime;
      ext = optimized.ext;
    }
  }

  const relativePath = `${userId}/${randomUUID()}${ext}`;
  const absolutePath = resolveSafePath(relativePath);
  if (!absolutePath) throw new Error("Caminho inválido.");

  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, buffer);

  if (mime.startsWith("image/") && mime !== "image/gif") {
    const blur = await generateBlurDataUrl(buffer);
    if (blur) {
      await writeFile(`${absolutePath}.blur`, blur, "utf8");
    }
  }

  return {
    url: publicMediaUrl(relativePath),
    relativePath,
    mime,
  };
}
