import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { expireStaleCallsForUsers } from "@/lib/call-sessions";
import { areFriends } from "@/lib/friendship";
import { createNotification } from "@/lib/notifications";
import { pushCallSignal } from "@/lib/pusher-server";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  getClientIp,
  rateLimitKey,
} from "@/lib/rate-limit";
import { callSignalSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const ip = getClientIp(request);
  const key = rateLimitKey(user.id, ip);
  if (!checkRateLimit(key, 60, 60_000, "calls")) {
    return NextResponse.json(
      { error: "Muitas sinalizações de chamada." },
      { status: 429 },
    );
  }

  try {
    const body = callSignalSchema.parse(await request.json());

    if (body.type === "invite") {
      if (!body.targetUserId) {
        return NextResponse.json({ error: "Destino inválido." }, { status: 400 });
      }
      if (body.targetUserId === user.id) {
        return NextResponse.json({ error: "Destino inválido." }, { status: 400 });
      }
      if (!(await areFriends(user.id, body.targetUserId))) {
        return NextResponse.json(
          { error: "Só é possível ligar para amigos." },
          { status: 403 },
        );
      }

      await expireStaleCallsForUsers(user.id, body.targetUserId);

      const active = await prisma.callSession.findFirst({
        where: {
          status: { in: ["RINGING", "ACTIVE"] },
          OR: [
            { callerId: user.id, calleeId: body.targetUserId },
            { callerId: body.targetUserId, calleeId: user.id },
          ],
        },
      });
      if (active) {
        return NextResponse.json(
          { error: "Já existe uma chamada em andamento." },
          { status: 409 },
        );
      }

      const call = await prisma.callSession.create({
        data: {
          callerId: user.id,
          calleeId: body.targetUserId,
          status: "RINGING",
        },
      });

      await pushCallSignal(body.targetUserId, {
        type: "invite",
        callId: call.id,
        fromUserId: user.id,
        fromUserName: user.name,
      });

      await createNotification(
        body.targetUserId,
        "INCOMING_CALL",
        `${user.name} está te chamando`,
        "/mensagens",
      );

      return NextResponse.json({ callId: call.id });
    }

    if (!body.callId) {
      return NextResponse.json({ error: "callId obrigatório." }, { status: 400 });
    }

    const call = await prisma.callSession.findUnique({
      where: { id: body.callId },
    });
    if (!call) {
      return NextResponse.json({ error: "Chamada não encontrada." }, { status: 404 });
    }

    const isCaller = call.callerId === user.id;
    const isCallee = call.calleeId === user.id;
    if (!isCaller && !isCallee) {
      return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    }

    const peerId = isCaller ? call.calleeId : call.callerId;

    if (body.type === "offer" && body.sdp && isCaller) {
      await prisma.callSession.update({
        where: { id: call.id },
        data: { offerSdp: body.sdp, status: "RINGING" },
      });
      await pushCallSignal(peerId, {
        type: "offer",
        callId: call.id,
        sdp: body.sdp,
        fromUserId: user.id,
      });
      return NextResponse.json({ ok: true });
    }

    if (body.type === "answer" && body.sdp && isCallee) {
      await prisma.callSession.update({
        where: { id: call.id },
        data: { answerSdp: body.sdp, status: "ACTIVE" },
      });
      await pushCallSignal(peerId, {
        type: "answer",
        callId: call.id,
        sdp: body.sdp,
        fromUserId: user.id,
      });
      return NextResponse.json({ ok: true });
    }

    if (body.type === "ice" && body.candidate) {
      await pushCallSignal(peerId, {
        type: "ice",
        callId: call.id,
        candidate: body.candidate,
        fromUserId: user.id,
      });
      return NextResponse.json({ ok: true });
    }

    if (body.type === "decline" && isCallee) {
      await prisma.callSession.update({
        where: { id: call.id },
        data: { status: "DECLINED", endedAt: new Date() },
      });
      await pushCallSignal(peerId, {
        type: "decline",
        callId: call.id,
        fromUserId: user.id,
      });
      return NextResponse.json({ ok: true });
    }

    if (body.type === "hangup") {
      await prisma.callSession.update({
        where: { id: call.id },
        data: {
          status: call.status === "RINGING" ? "MISSED" : "ENDED",
          endedAt: new Date(),
        },
      });
      await pushCallSignal(peerId, {
        type: "hangup",
        callId: call.id,
        fromUserId: user.id,
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Sinal inválido." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }
}
