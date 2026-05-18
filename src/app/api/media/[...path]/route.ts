import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { mimeFromPath, resolveSafePath } from "@/lib/storage";

type RouteContext = { params: Promise<{ path: string[] }> };

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
    const data = await readFile(filePath);
    if (isBlur) {
      return new NextResponse(data, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }
    return new NextResponse(data, {
      headers: {
        "Content-Type": mimeFromPath(absolute),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
