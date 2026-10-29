import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { saveUploadedFile, publicMediaUrl } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  return handleBlossomUpload(request);
}

export async function PUT(request: Request) {
  return handleBlossomUpload(request);
}

async function handleBlossomUpload(request: Request) {
  try {
    const user = await getCurrentUser();
    const contentType = request.headers.get("content-type") || "";

    let fileBuffer: Buffer;
    let mimeType = "application/octet-stream";
    let originalName = "blossom_blob";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = (formData.get("file") || formData.get("blob")) as File | null;
      if (!file) {
        return NextResponse.json(
          { error: "Nenhum arquivo enviado no FormData." },
          { status: 400 }
        );
      }
      fileBuffer = Buffer.from(await file.arrayBuffer());
      mimeType = file.type || "application/octet-stream";
      originalName = file.name || "blossom_upload";
    } else {
      // Raw binary stream
      fileBuffer = Buffer.from(await request.arrayBuffer());
      mimeType = contentType.split(";")[0].trim() || "application/octet-stream";
    }

    if (fileBuffer.length === 0) {
      return NextResponse.json(
        { error: "Arquivo ou payload binário vazio." },
        { status: 400 }
      );
    }

    if (fileBuffer.length > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Tamanho excede o limite máximo de 50MB." },
        { status: 413 }
      );
    }

    const sha256Hash = createHash("sha256").update(fileBuffer).digest("hex");
    const uploaderId = user?.id || "blossom_client";

    const isVideo = mimeType.startsWith("video/");
    const dummyFile = new File([new Uint8Array(fileBuffer)], `${sha256Hash.slice(0, 16)}_${originalName}`, {
      type: mimeType,
    });

    const saved = await saveUploadedFile(
      dummyFile,
      uploaderId,
      isVideo ? "postVideo" : "postImage"
    );

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const fullUrl = `${protocol}://${host}${publicMediaUrl(saved.relativePath)}`;

    return NextResponse.json({
      url: fullUrl,
      sha256: sha256Hash,
      size: fileBuffer.length,
      type: saved.mime || mimeType,
      uploaded: Math.floor(Date.now() / 1000),
    });
  } catch (error: unknown) {
    console.error("[BLOSSOM_UPLOAD_ERROR]", error);
    const msg = error instanceof Error ? error.message : "Erro no upload Blossom.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
