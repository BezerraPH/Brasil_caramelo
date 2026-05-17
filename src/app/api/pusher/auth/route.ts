import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPusherServer, isPusherEnabled, userChannelName } from "@/lib/pusher-server";

export async function POST(request: Request) {
  if (!isPusherEnabled()) {
    return NextResponse.json({ error: "Pusher não configurado." }, { status: 503 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = await request.formData();
  const socketId = body.get("socket_id") as string;
  const channel = body.get("channel_name") as string;

  const expected = userChannelName(user.id);
  if (channel !== expected) {
    return NextResponse.json({ error: "Canal inválido." }, { status: 403 });
  }

  const pusher = getPusherServer();
  if (!pusher) {
    return NextResponse.json({ error: "Pusher indisponível." }, { status: 503 });
  }

  const auth = pusher.authorizeChannel(socketId, channel);
  return NextResponse.json(auth);
}
