import { NextResponse } from "next/server";
import {
  isSafeRelativePath,
  mimeFromPath,
  readMediaBytes,
  readMediaRange,
  statMediaFile,
} from "@/lib/storage";

type RouteContext = { params: Promise<{ path: string[] }> };

function cacheControlForPath(relativePath: string): string {
  if (relativePath.includes("_hls/")) {
    return "public, max-age=300";
  }
  if (relativePath.endsWith(".m3u8")) {
    return "public, max-age=60";
  }
  return "public, max-age=31536000, immutable";
}

export async function GET(request: Request, context: RouteContext) {
  const { path: segments } = await context.params;
  const relativePath = segments.join("/");

  if (!isSafeRelativePath(relativePath)) {
    return new NextResponse(null, { status: 404 });
  }

  const isBlur = new URL(request.url).searchParams.get("blur") === "1";
  const mediaPath = isBlur ? `${relativePath}.blur` : relativePath;

  const fileStat = await statMediaFile(mediaPath);
  if (!fileStat || fileStat.size === 0) {
    return new NextResponse(null, { status: 404 });
  }

  const mime = isBlur
    ? "text/plain; charset=utf-8"
    : mimeFromPath(relativePath);
  const cacheControl = cacheControlForPath(relativePath);
  const isVideo = mime.startsWith("video/") || mime.includes("mpegurl");

  const range = request.headers.get("range");
  if (range && isVideo && !isBlur && fileStat.size > 0) {
    const match = /^bytes=(\d+)-(\d*)$/.exec(range);
    if (match) {
      const start = parseInt(match[1], 10);
      const end = match[2]
        ? parseInt(match[2], 10)
        : Math.min(start + 1024 * 1024 - 1, fileStat.size - 1);
      if (start < fileStat.size && end >= start) {
        const chunk = await readMediaRange(mediaPath, start, end);
        if (!chunk) {
          return new NextResponse(null, { status: 404 });
        }
        return new NextResponse(new Uint8Array(chunk.data), {
          status: 206,
          headers: {
            "Content-Type": mime,
            "Content-Length": String(chunk.data.length),
            "Content-Range": `bytes ${start}-${end}/${chunk.size}`,
            "Accept-Ranges": "bytes",
            "Cache-Control": cacheControl,
          },
        });
      }
    }
  }

  const data = await readMediaBytes(mediaPath);
  if (!data) {
    return new NextResponse(null, { status: 404 });
  }

  const headers: Record<string, string> = {
    "Content-Type": mime,
    "Cache-Control": cacheControl,
  };
  if (isVideo) {
    headers["Accept-Ranges"] = "bytes";
    headers["Content-Length"] = String(fileStat.size);
  }

  return new NextResponse(new Uint8Array(data), { headers });
}
