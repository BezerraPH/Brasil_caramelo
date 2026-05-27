import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { validationMessage } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { albumSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  let userId = user.id;
  if (username && username !== user.username) {
    const owner = await prisma.user.findUnique({
      where: { username },
      select: { id: true, shadowbanned: true },
    });
    if (!owner || owner.shadowbanned) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }
    userId = owner.id;
  }

  const albums = await prisma.album.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { photos: true } },
    },
  });

  return NextResponse.json({
    albums: albums.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
      photoCount: a._count.photos,
    })),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = albumSchema.parse(body);

    const album = await prisma.album.create({
      data: {
        userId: user.id,
        name: data.name.trim(),
        description: data.description?.trim() || null,
      },
    });

    return NextResponse.json({
      album: {
        ...album,
        createdAt: album.createdAt.toISOString(),
        updatedAt: album.updatedAt.toISOString(),
        photoCount: 0,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: validationMessage(error) },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Erro ao criar álbum." }, { status: 500 });
  }
}
