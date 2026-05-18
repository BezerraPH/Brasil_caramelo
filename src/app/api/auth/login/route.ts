import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  getClientIp,
  rateLimitKey,
} from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const key = rateLimitKey(null, ip);
  if (!checkRateLimit(key, 20, 15 * 60_000, "auth-login")) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde alguns minutos." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const data = loginSchema.parse(body);
    const email = data.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos." },
        { status: 401 },
      );
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos." },
        { status: 401 },
      );
    }

    await createSession(user.id);
    return NextResponse.json({ ok: true, username: user.username });
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
}
