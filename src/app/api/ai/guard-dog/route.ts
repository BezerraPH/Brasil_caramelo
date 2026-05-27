import { NextResponse } from "next/server";
import { z } from "zod";
import { askGuardDog } from "@/lib/guard-dog";
import { getCurrentUser } from "@/lib/auth";
import {
  checkRateLimit,
  getClientIp,
  rateLimitKey,
} from "@/lib/rate-limit";

const schema = z.object({
  question: z.string().min(3).max(500),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const ip = getClientIp(request);
  const key = rateLimitKey(user.id, ip);
  if (!(await checkRateLimit(key, 8, 60_000, "guard-dog"))) {
    return NextResponse.json(
      { error: "O Cão de Guarda precisa descansar. Aguarde um minuto." },
      { status: 429 },
    );
  }

  try {
    const { question } = schema.parse(await request.json());
    const result = await askGuardDog(user.id, question);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Pergunta inválida." }, { status: 400 });
  }
}
