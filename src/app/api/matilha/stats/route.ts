import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getMatilhaStats } from "@/lib/matilha-stats";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  return NextResponse.json(await getMatilhaStats());
}
