import { mkdir, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import {
  isObjectStorageEnabled,
  uploadLocalDirectoryToObjectStorage,
} from "./object-storage";
import { prisma } from "./prisma";
import {
  mediaUrlToRelativePath,
  readMediaBytes,
  resolveSafePath,
} from "./storage";
import { maybeTranscodeToHls } from "./video-pipeline";

/** Transcodifica vídeo do post em background (não bloqueia o upload). */
export function schedulePostVideoTranscode(
  postId: string,
  videoUrl: string,
): void {
  void transcodePostVideo(postId, videoUrl).catch(() => {});
}

async function materializeVideoForFfmpeg(
  relative: string,
): Promise<string | null> {
  if (isObjectStorageEnabled()) {
    const buf = await readMediaBytes(relative);
    if (!buf) return null;
    const tmpDir = path.join(os.tmpdir(), "bc-transcode", path.dirname(relative));
    await mkdir(tmpDir, { recursive: true });
    const tmpFile = path.join(tmpDir, path.basename(relative));
    await writeFile(tmpFile, buf);
    return tmpFile;
  }
  return resolveSafePath(relative);
}

async function transcodePostVideo(postId: string, videoUrl: string) {
  const relative = mediaUrlToRelativePath(videoUrl);
  if (!relative) return;

  const absolute = await materializeVideoForFfmpeg(relative);
  if (!absolute) return;

  const hlsUrl = await maybeTranscodeToHls(absolute, relative);
  if (!hlsUrl) return;

  if (isObjectStorageEnabled()) {
    const base = path.basename(absolute, path.extname(absolute));
    const outDir = path.join(path.dirname(absolute), `${base}_hls`);
    const relDir = path.dirname(relative);
    const s3Prefix = `${relDir}/${base}_hls`;
    await uploadLocalDirectoryToObjectStorage(outDir, s3Prefix);
  }

  await prisma.post.update({
    where: { id: postId },
    data: { videoHlsUrl: hlsUrl },
  });
}
