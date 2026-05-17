import type { NotificationType } from "@/generated/prisma/enums";
import { prisma } from "./prisma";

export async function createNotification(
  userId: string,
  type: NotificationType,
  message: string,
  link?: string,
) {
  return prisma.notification.create({
    data: { userId, type, message, link },
  });
}
