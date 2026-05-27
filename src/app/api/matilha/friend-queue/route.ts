import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getMatilhaFriendQueue } from "@/lib/friend-queue";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const queue = await getMatilhaFriendQueue(user.id);
  return NextResponse.json(queue);
}
