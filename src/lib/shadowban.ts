import { prisma } from "./prisma";

export const SHADOWBAN_REPORT_THRESHOLD = 5;

export async function evaluateShadowban(userId: string): Promise<boolean> {
  const reportCount = await prisma.postReport.count({
    where: { post: { authorId: userId } },
  });

  if (reportCount < SHADOWBAN_REPORT_THRESHOLD) return false;

  await prisma.user.update({
    where: { id: userId },
    data: { shadowbanned: true },
  });
  return true;
}
