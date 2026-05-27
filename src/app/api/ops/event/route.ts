import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { recordOpsEvent } from "@/lib/ops-metrics";

const schema = z.object({
  type: z.string().min(1).max(64),
  detail: z.string().max(500).optional().nullable(),
});

const ALLOWED = new Set([
  "hls_error",
  "hls_fatal",
  "offline_queue_flush",
  "offline_queue_fail",
  "livekit_error",
  "livekit_disconnect",
  "pwa_push_fail",
]);

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = schema.parse(await request.json());
    if (!ALLOWED.has(body.type)) {
      return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });
    }
    recordOpsEvent(body.type, body.detail ?? null, user.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }
}
