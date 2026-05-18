import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureUploadDirWritable } from "@/lib/storage";

export async function GET() {
  const uploadsWritable = await ensureUploadDirWritable();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      database: "connected",
      storage: uploadsWritable ? "ready" : "unavailable",
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        database: "disconnected",
        storage: uploadsWritable ? "ready" : "unavailable",
      },
      { status: 503 },
    );
  }
}
