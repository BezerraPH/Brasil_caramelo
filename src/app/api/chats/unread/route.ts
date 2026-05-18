import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { countUnreadMessages } from "@/lib/chat";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const unreadTotal = await countUnreadMessages(user.id);
  return NextResponse.json({ unreadTotal });
}
