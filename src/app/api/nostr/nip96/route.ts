import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { saveUploadedFile, publicMediaUrl, type UploadKind } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  return NextResponse.json({
    api_url: `${baseUrl}/api/nostr/nip96`,
    download_url: `${baseUrl}/api/media`,
    supported_nips: [96, 94],
    plans: {
      free: {
        name: "Brasil Caramelo Sovereign Storage",
        is_active: true,
        max_byte_size: 52428800,
        file_retention: ["permanent"],
      },
    },
  });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const formData = await request.formData();
    const file = (formData.get("file") || formData.get("media")) as File | null;

    if (!file) {
      return NextResponse.json(
        { status: "error", message: "Nenhum arquivo enviado no campo 'file'." },
        { status: 400 }
      );
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { status: "error", message: "Arquivo excede o limite máximo de 50MB." },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const sha256Hash = createHash("sha256").update(buffer).digest("hex");

    const mime = file.type || "application/octet-stream";
    const isVideo = mime.startsWith("video/");
    const kind: UploadKind = isVideo ? "postVideo" : "postImage";
    const uploaderId = user?.id || "nostr_sovereign";

    const saved = await saveUploadedFile(file, uploaderId, kind);

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const fullUrl = `${protocol}://${host}${publicMediaUrl(saved.relativePath)}`;

    return NextResponse.json({
      status: "success",
      message: "Upload concluído no servidor soberano da matilha (NIP-96)!",
      nip94_event: {
        tags: [
          ["url", fullUrl],
          ["ox", sha256Hash],
          ["x", sha256Hash],
          ["m", saved.mime],
          ["size", String(file.size)],
          ["client", "brasil-caramelo"],
        ],
      },
    });
  } catch (error: unknown) {
    console.error("[NIP96_UPLOAD_ERROR]", error);
    const msg = error instanceof Error ? error.message : "Erro no processamento do upload.";
    return NextResponse.json(
      { status: "error", message: msg },
      { status: 500 }
    );
  }
}
