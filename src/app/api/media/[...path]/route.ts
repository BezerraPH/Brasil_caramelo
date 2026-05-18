import { readFile, stat } from "fs/promises";
import { NextResponse } from "next/server";
import { mimeFromPath, resolveSafePath } from "@/lib/storage";

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

  if (!relativePath || relativePath.includes("..")) {
    return new NextResponse(null, { status: 404 });
  }

  const absolute = resolveSafePath(relativePath);
  if (!absolute) {
    return new NextResponse(null, { status: 404 });
  }

  const isBlur = new URL(request.url).searchParams.get("blur") === "1";

  try {
    const filePath = isBlur ? `${absolute}.blur` : absolute;
    const fileStat = await stat(filePath);
    const mime = isBlur
      ? "text/plain; charset=utf-8"
      : mimeFromPath(absolute);
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
          const data = await readFile(filePath);
          const chunk = data.subarray(start, end + 1);
          return new NextResponse(chunk, {
            status: 206,
            headers: {
              "Content-Type": mime,
              "Content-Length": String(chunk.length),
              "Content-Range": `bytes ${start}-${end}/${fileStat.size}`,
              "Accept-Ranges": "bytes",
              "Cache-Control": cacheControl,
            },
          });
        }
      }
    }

    const data = await readFile(filePath);
    const headers: Record<string, string> = {
      "Content-Type": mime,
      "Cache-Control": cacheControl,
    };
    if (isVideo) {
      headers["Accept-Ranges"] = "bytes";
      headers["Content-Length"] = String(fileStat.size);
    }

    return new NextResponse(data, { headers });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
