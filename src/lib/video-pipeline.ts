import { execFile } from "child_process";
import { access, mkdir } from "fs/promises";
import path from "path";
import { promisify } from "util";
import { headObject, isObjectStorageEnabled } from "./object-storage";

const exec = promisify(execFile);

/**
 * Transcodificação opcional via ffmpeg (FFMPEG_PATH ou ffmpeg no PATH).
 * Gera HLS básico em subpasta {basename}_hls/playlist.m3u8
 */
export async function maybeTranscodeToHls(
  absoluteVideoPath: string,
  mediaRelativePath: string,
): Promise<string | null> {
  const ffmpeg =
    process.env.FFMPEG_PATH?.trim() ||
    (process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg");

  try {
    await access(absoluteVideoPath);
  } catch {
    return null;
  }

  const dir = path.dirname(absoluteVideoPath);
  const base = path.basename(absoluteVideoPath, path.extname(absoluteVideoPath));
  const outDir = path.join(dir, `${base}_hls`);
  const playlist = path.join(outDir, "playlist.m3u8");
  const rel = path.dirname(mediaRelativePath);
  const hlsRelative = `${rel}/${base}_hls/playlist.m3u8`;

  if (isObjectStorageEnabled()) {
    const existing = await headObject(hlsRelative);
    if (existing) return `/api/media/${hlsRelative}`;
  } else {
    try {
      await access(playlist);
      return `/api/media/${hlsRelative}`;
    } catch {
      /* gerar */
    }
  }

  try {
    await mkdir(outDir, { recursive: true });
    await exec(
      ffmpeg,
      [
        "-y",
        "-i",
        absoluteVideoPath,
        "-vf",
        "scale=-2:720",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "28",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-hls_time",
        "4",
        "-hls_playlist_type",
        "vod",
        "-hls_segment_filename",
        path.join(outDir, "seg_%03d.ts"),
        playlist,
      ],
      { timeout: 120_000 },
    );
    return `/api/media/${hlsRelative}`;
  } catch {
    return null;
  }
}
