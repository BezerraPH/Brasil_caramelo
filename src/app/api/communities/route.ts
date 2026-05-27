import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listCommunities } from "@/lib/communities";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const filtered =
    category && category !== "todos" ? category : undefined;

  const communities = await listCommunities(user?.id ?? null, filtered);
  return NextResponse.json({ communities });
}
