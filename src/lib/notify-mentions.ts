import { createNotification } from "./notifications";
import { extractMentions } from "./mentions";
import { prisma } from "./prisma";

export async function notifyMentions(
  content: string,
  authorId: string,
  authorName: string,
  postId: string,
) {
  const usernames = extractMentions(content);
  if (usernames.length === 0) return;

  const users = await prisma.user.findMany({
    where: {
      username: { in: usernames },
      id: { not: authorId },
    },
    select: { id: true },
  });

  const link = `/feed?post=${postId}`;
  await Promise.all(
    users.map((u) =>
      createNotification(
        u.id,
        "POST_MENTION",
        `${authorName} mencionou você em um recado`,
        link,
      ),
    ),
  );
}
