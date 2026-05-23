import { NextResponse } from "next/server";
import { unlockAchievement } from "@/lib/achievements";
import { getCurrentUser } from "@/lib/auth";
import { CASINHAS } from "@/lib/casinhas";
import {
  createLiveKitToken,
  getLiveKitRoomName,
  isLiveKitConfigured,
} from "@/lib/livekit";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  if (!isLiveKitConfigured()) {
    return NextResponse.json(
      { error: "LiveKit não configurado no servidor." },
      { status: 503 },
    );
  }

  const slug = new URL(request.url).searchParams.get("room")?.trim();
  const casinha = CASINHAS.find((c) => c.slug === slug);
  if (!casinha) {
    return NextResponse.json({ error: "Sala inválida." }, { status: 400 });
  }

  const roomName = getLiveKitRoomName(casinha.slug);
  const { token, url } = await createLiveKitToken(user.id, user.name, roomName);
  const unlocked = await unlockAchievement(user.id, "LATIDOS_FIRST");

  return NextResponse.json({
    token,
    url,
    roomName,
    newAchievement: unlocked ? "LATIDOS_FIRST" : null,
  });
}
