import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { validationMessage } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema, viewModeSchema, privacySchema, profileThemeSchema, locationSchema, interestsSchema } from "@/lib/validators";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (body.viewMode !== undefined) {
      const { viewMode } = viewModeSchema.parse(body);
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { viewMode, profileVibe: viewMode },
        select: { id: true, viewMode: true, profileVibe: true },
      });
      return NextResponse.json(updated);
    }

    if (body.showVisits !== undefined) {
      const { showVisits } = privacySchema.parse(body);
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { showVisits },
        select: { id: true, showVisits: true },
      });
      return NextResponse.json(updated);
    }

    if (body.profileTheme !== undefined) {
      const { profileTheme } = profileThemeSchema.parse(body);
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { profileTheme },
        select: { id: true, profileTheme: true },
      });
      return NextResponse.json(updated);
    }

    if (
      body.locationCity !== undefined ||
      body.locationArea !== undefined ||
      body.showLocation !== undefined
    ) {
      const data = locationSchema.parse(body);
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(data.locationCity !== undefined
            ? { locationCity: data.locationCity?.trim() || null }
            : {}),
          ...(data.locationArea !== undefined
            ? { locationArea: data.locationArea?.trim() || null }
            : {}),
          ...(data.showLocation !== undefined ? { showLocation: data.showLocation } : {}),
        },
        select: {
          id: true,
          locationCity: true,
          locationArea: true,
          showLocation: true,
        },
      });
      return NextResponse.json(updated);
    }

    if (body.interests !== undefined && body.name === undefined) {
      const { interests } = interestsSchema.parse(body);
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          interests: interests.map((t) => t.trim().toLowerCase()).filter(Boolean),
        },
        select: { id: true, interests: true },
      });
      return NextResponse.json(updated);
    }

    const data = updateProfileSchema.parse(body);

    if (data.username && data.username !== user.username) {
      const taken = await prisma.user.findUnique({
        where: { username: data.username },
      });
      if (taken) {
        return NextResponse.json(
          { error: "Este nome de usuário já está em uso." },
          { status: 409 },
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name,
        bio: data.bio ?? null,
        ...(data.username ? { username: data.username } : {}),
        ...(data.birthDate !== undefined
          ? {
              birthDate: data.birthDate
                ? new Date(`${data.birthDate}T12:00:00.000Z`)
                : null,
            }
          : {}),
        ...(data.relationshipStatus !== undefined
          ? { relationshipStatus: data.relationshipStatus }
          : {}),
        ...(data.interests !== undefined
          ? {
              interests: data.interests
                .map((t) => t.trim().toLowerCase())
                .filter(Boolean),
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        email: true,
        birthDate: true,
        relationshipStatus: true,
        interests: true,
      },
    });

    void import("@/lib/meilisearch-index").then((m) =>
      m.indexUserDocument(user.id),
    );
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: validationMessage(error) },
        { status: 400 },
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Erro ao atualizar perfil." }, { status: 500 });
  }
}
