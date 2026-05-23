import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVersionDisplay, RELEASE_STAGE } from "@/lib/app-version";
import { getStackHealth } from "@/lib/stack-health";
import { ensureUploadDirWritable } from "@/lib/storage";

export async function GET() {
  const uploadsWritable = await ensureUploadDirWritable();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      database: "connected",
      storage: uploadsWritable ? "ready" : "unavailable",
      version: getVersionDisplay(),
      stage: RELEASE_STAGE,
      stack: getStackHealth(),
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        database: "disconnected",
        storage: uploadsWritable ? "ready" : "unavailable",
        stack: getStackHealth(),
      },
      { status: 503 },
    );
  }
}
