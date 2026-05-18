import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  getClientIp,
  rateLimitKey,
} from "@/lib/rate-limit";
import {
  moderateImageMeta,
  moderateImageWithOpenAI,
  moderateText,
} from "@/lib/content-moderation";
import { resolveSafePath } from "@/lib/storage";
import { maybeTranscodeToHls } from "@/lib/video-pipeline";
import {
  deleteMediaByUrl,
  ensureUploadDirWritable,
  saveUploadedFile,
  type UploadKind,
} from "@/lib/storage";
import sharp from "sharp";

const KINDS = new Set<UploadKind>([
  "avatar",
  "postImage",
  "postVideo",
  "story",
  "chatAttachment",
]);

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const ip = getClientIp(request);
  const key = rateLimitKey(user.id, ip);
  if (!checkRateLimit(key, 15, 60_000, "upload")) {
    return NextResponse.json(
      { error: "Muitos uploads. Aguarde um minuto." },
      { status: 429 },
    );
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
    const caption = String(form.get("caption") ?? "");
    if (caption) {
      const modCaption = moderateText(caption);
      if (!modCaption.ok) {
        return NextResponse.json({ error: modCaption.reason }, { status: 400 });
      }
    }

    const saved = await saveUploadedFile(file, user.id, kind);

    if (saved.mime.startsWith("image/") && saved.mime !== "image/gif") {
      const abs = resolveSafePath(saved.relativePath);
      if (abs) {
        try {
          const meta = await sharp(abs).metadata();
          const modMeta = moderateImageMeta(meta.width ?? 0, meta.height ?? 0);
          if (!modMeta.ok) {
            await deleteMediaByUrl(saved.url);
            return NextResponse.json({ error: modMeta.reason }, { status: 400 });
          }
        } catch {
          /* ignore */
        }
        const appUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL;
        if (appUrl) {
          const modAi = await moderateImageWithOpenAI(
            `${appUrl.replace(/\/$/, "")}${saved.url}`,
          );
          if (!modAi.ok) {
            await deleteMediaByUrl(saved.url);
            return NextResponse.json({ error: modAi.reason }, { status: 400 });
          }
        }
      }
    }

    let hlsUrl: string | null = null;
    if (kind === "postVideo") {
      const abs = resolveSafePath(saved.relativePath);
      if (abs) {
        hlsUrl = await maybeTranscodeToHls(abs, saved.relativePath);
      }
    }

    if (kind === "avatar") {
      const current = await prisma.user.findUnique({
        where: { id: user.id },
        select: { avatarUrl: true },
      });
      await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl: saved.url },
      });
      await deleteMediaByUrl(current?.avatarUrl);
    }

    return NextResponse.json({
      url: saved.url,
      mime: saved.mime,
      hlsUrl,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Falha ao salvar o arquivo.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
