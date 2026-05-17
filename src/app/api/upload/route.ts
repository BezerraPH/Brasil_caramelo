import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ensureUploadDirWritable,
  saveUploadedFile,
  type UploadKind,
} from "@/lib/storage";

const KINDS = new Set<UploadKind>([
  "avatar",
  "postImage",
  "postVideo",
  "story",
]);

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const writable = await ensureUploadDirWritable();
  if (!writable) {
    return NextResponse.json(
      {
        error:
          "Pasta de uploads indisponível. Verifique UPLOAD_DIR e permissões no servidor.",
      },
      { status: 503 },
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    const kindRaw = String(form.get("kind") ?? "postImage");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    if (!KINDS.has(kindRaw as UploadKind)) {
      return NextResponse.json({ error: "Tipo de upload inválido." }, { status: 400 });
    }

    const kind = kindRaw as UploadKind;
    const saved = await saveUploadedFile(file, user.id, kind);

    if (kind === "avatar") {
      await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl: saved.url },
      });
    }

    return NextResponse.json({
      url: saved.url,
      mime: saved.mime,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Falha ao salvar o arquivo.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
