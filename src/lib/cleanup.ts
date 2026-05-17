import { prisma } from "./prisma";

/** Remove stories expirados (chamado no feed e na API de stories). */
export async function purgeExpiredStories() {
  const result = await prisma.story.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return result.count;
}
