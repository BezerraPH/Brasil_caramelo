import type { DogReputationLevel } from "@/generated/prisma/enums";
import { CASINHAS } from "./casinhas";
import { prisma } from "./prisma";

export { ROOM_CHANNEL_PREFIX, roomChannelName } from "./casinha-rooms-constants";

export async function ensureCasinhaRooms() {
  for (const c of CASINHAS) {
    await prisma.casinhaRoom.upsert({
      where: { slug: c.slug },
      create: {
        slug: c.slug,
        communityLevel: c.level as DogReputationLevel,
        name: c.name,
        emoji: c.emoji,
      },
      update: {
        name: c.name,
        emoji: c.emoji,
      },
    });
  }
}

export async function getRoomBySlug(slug: string) {
  await ensureCasinhaRooms();
  return prisma.casinhaRoom.findUnique({ where: { slug } });
}
