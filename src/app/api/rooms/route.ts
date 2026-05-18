import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ensureCasinhaRooms } from "@/lib/casinha-rooms";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  await ensureCasinhaRooms();

  const rooms = await prisma.casinhaRoom.findMany({
    orderBy: { lastMessageAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          sender: {
            select: { id: true, name: true, username: true },
          },
        },
      },
    },
  });

  return NextResponse.json({
    rooms: rooms.map((r) => {
      const last = r.messages[0];
      return {
        id: r.id,
        slug: r.slug,
        name: r.name,
        emoji: r.emoji,
        communityLevel: r.communityLevel,
        lastMessage: last
          ? {
              content: last.content,
              attachmentUrl: last.attachmentUrl,
              senderName: last.sender.name,
              createdAt: last.createdAt.toISOString(),
            }
          : null,
        lastMessageAt: r.lastMessageAt.toISOString(),
      };
    }),
  });
}
