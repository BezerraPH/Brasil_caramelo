import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { attachSavedFlags } from "@/lib/feed-posts";
import { fetchCinelarFeed } from "@/lib/cinelar-fyp";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");

  const { posts, nextCursor } = await fetchCinelarFeed(user.id, cursor);
  const withSaved = await attachSavedFlags(user.id, posts);

  return NextResponse.json({ posts: withSaved, nextCursor, fyp: true });
}
