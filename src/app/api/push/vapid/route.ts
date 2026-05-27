import { NextResponse } from "next/server";
import { isWebPushConfigured } from "@/lib/web-push-server";

export async function GET() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  if (!isWebPushConfigured() || !publicKey) {
    return NextResponse.json({ enabled: false, publicKey: null });
  }
  return NextResponse.json({ enabled: true, publicKey });
}
