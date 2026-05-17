import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const q = new URL(request.url).searchParams.get("q")?.trim().toLowerCase();
  if (!q || q.length < 2) {
    return NextResponse.json({ users: [] });
  }

  const users = await prisma.user.findMany({
    where: {
      AND: [
        { id: { not: user.id } },
        {
          OR: [
            { username: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
          ],
        },
      ],
    },
    take: 20,
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      avatarUrl: true,
    },
  });

  return NextResponse.json({ users });
}
