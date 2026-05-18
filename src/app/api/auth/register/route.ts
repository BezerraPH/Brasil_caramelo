import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { validationMessage } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  getClientIp,
  rateLimitKey,
} from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const key = rateLimitKey(null, ip);
  if (!checkRateLimit(key, 8, 60 * 60_000, "auth-register")) {
    return NextResponse.json(
      { error: "Muitas contas criadas deste IP. Tente mais tarde." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const parsed = registerSchema.parse(body);
    const data = {
      ...parsed,
      username: parsed.username.toLowerCase().trim(),
      name: parsed.name.trim(),
      email: parsed.email.toLowerCase().trim(),
    };

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "E-mail ou nome de usuário já em uso." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        username: data.username,
        email: data.email,
        passwordHash,
        pet: { create: {} },
      },
    });

    await createSession(user.id);
    return NextResponse.json({ ok: true, username: user.username });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: validationMessage(error) },
        { status: 400 },
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar conta." }, { status: 500 });
  }
}
