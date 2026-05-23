import { prisma } from "./prisma";
import { mediaUrlToRelativePath, resolveSafePath } from "./storage";
import { maybeTranscodeToHls } from "./video-pipeline";

/** Transcodifica vídeo do post em background (não bloqueia o upload). */
export function schedulePostVideoTranscode(
  postId: string,
  videoUrl: string,
): void {
  void transcodePostVideo(postId, videoUrl).catch(() => {});
}

async function transcodePostVideo(postId: string, videoUrl: string) {
  const relative = mediaUrlToRelativePath(videoUrl);
  if (!relative) return;

  const absolute = resolveSafePath(relative);
  if (!absolute) return;

  const hlsUrl = await maybeTranscodeToHls(absolute, relative);
  if (!hlsUrl) return;

  await prisma.post.update({
    where: { id: postId },
    data: { videoHlsUrl: hlsUrl },
  });
}
