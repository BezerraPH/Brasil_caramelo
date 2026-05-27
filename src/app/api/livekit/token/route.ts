import { NextResponse } from "next/server";
import { unlockAchievement } from "@/lib/achievements";
import { getCurrentUser } from "@/lib/auth";
import { CASINHAS } from "@/lib/casinhas";
import {
  createLiveKitToken,
  getLiveKitRoomName,
  isLiveKitConfigured,
} from "@/lib/livekit";
import {
  canJoinMatilhaLatidos,
  getMatilhaLatidosRoomName,
} from "@/lib/matilha-latidos";

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

  const roomParam = new URL(request.url).searchParams.get("room")?.trim();
  if (!roomParam) {
    return NextResponse.json({ error: "Sala inválida." }, { status: 400 });
  }

  let roomName: string;
  let displayName: string;

  if (roomParam.startsWith("matilha:")) {
    const packSlug = roomParam.slice("matilha:".length);
    const access = await canJoinMatilhaLatidos(user.id, packSlug);
    if (!access.ok) {
      return NextResponse.json(
        { error: "Entre na Matilha para acessar esta sala." },
        { status: 403 },
      );
    }
    roomName = getMatilhaLatidosRoomName(packSlug);
    displayName = access.packName ?? packSlug;
  } else {
    const casinha = CASINHAS.find((c) => c.slug === roomParam);
    if (!casinha) {
      return NextResponse.json({ error: "Sala inválida." }, { status: 400 });
    }
    roomName = getLiveKitRoomName(casinha.slug);
    displayName = casinha.name;
  }

  const { token, url } = await createLiveKitToken(user.id, user.name, roomName);
  const unlocked = await unlockAchievement(user.id, "LATIDOS_FIRST");

  return NextResponse.json({
    token,
    url,
    roomName,
    displayName,
    newAchievement: unlocked ? "LATIDOS_FIRST" : null,
  });
}
