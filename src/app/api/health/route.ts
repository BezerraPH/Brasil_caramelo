import { NextResponse } from "next/server";
import { diagnoseUploadthingToken } from "@/lib/uploadthing-token";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const upload = diagnoseUploadthingToken();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      database: "connected",
      upload: upload.ok ? "ready" : upload.issue,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        database: "disconnected",
        upload: upload.ok ? "ready" : upload.issue,
      },
      { status: 503 },
    );
  }
}
