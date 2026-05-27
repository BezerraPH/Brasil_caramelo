import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { buildUserDataExport } from "@/lib/user-data-export";
import {
  checkRateLimit,
  getClientIp,
  rateLimitKey,
} from "@/lib/rate-limit";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const ip = getClientIp(request);
  const key = rateLimitKey(user.id, ip);
  if (!(await checkRateLimit(key, 3, 60 * 60_000, "gdpr-export"))) {
    return NextResponse.json(
      {
        error:
          "Limite de exportações atingido. Tente de novo em cerca de uma hora.",
      },
      { status: 429 },
    );
  }

  try {
    const data = await buildUserDataExport(user.id);
    const filename = `brasil-caramelo-${user.username}-${new Date().toISOString().slice(0, 10)}.json`;
    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Falha ao gerar exportação." },
      { status: 500 },
    );
  }
}
