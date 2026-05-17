import type { NotificationType } from "@/generated/prisma/enums";
import { pushNotificationEvent } from "./pusher-server";
import { prisma } from "./prisma";

export async function createNotification(
  userId: string,
  type: NotificationType,
  message: string,
  link?: string,
) {
  const notification = await prisma.notification.create({
    data: { userId, type, message, link },
  });

  await pushNotificationEvent(userId, {
    id: notification.id,
    message: notification.message,
    link: notification.link,
    type: notification.type,
    createdAt: notification.createdAt.toISOString(),
  });

  return notification;
}
