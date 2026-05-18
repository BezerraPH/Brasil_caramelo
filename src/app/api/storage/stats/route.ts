import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  ensureUploadDirWritable,
  formatBytes,
  getStorageStats,
} from "@/lib/storage";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const writable = await ensureUploadDirWritable();
  if (!writable) {
    return NextResponse.json({
      ready: false,
      files: 0,
      bytes: 0,
      formatted: "0 B",
    });
  }

  const { files, bytes } = await getStorageStats();
  return NextResponse.json({
    ready: true,
    files,
    bytes,
    formatted: formatBytes(bytes),
  });
}
