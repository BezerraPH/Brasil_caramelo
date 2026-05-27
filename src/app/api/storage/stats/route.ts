import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getObjectStorageConfig } from "@/lib/object-storage";
import {
  ensureUploadDirWritable,
  formatBytes,
  getStorageBackend,
  getStorageStats,
} from "@/lib/storage";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const backend = getStorageBackend();
  const writable = await ensureUploadDirWritable();
  if (!writable) {
    return NextResponse.json({
      ready: false,
      backend,
      bucket: getObjectStorageConfig()?.bucket ?? null,
      files: 0,
      bytes: 0,
      formatted: "0 B",
    });
  }

  const { files, bytes } = await getStorageStats();
  return NextResponse.json({
    ready: true,
    backend,
    bucket: getObjectStorageConfig()?.bucket ?? null,
    files,
    bytes,
    formatted: formatBytes(bytes),
  });
}
