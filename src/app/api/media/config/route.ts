import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { diagnoseUploadthingToken } from "@/lib/uploadthing-token";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const diagnosis = diagnoseUploadthingToken();
  return NextResponse.json({
    uploadReady: diagnosis.ok,
    issue: diagnosis.issue ?? null,
    hint: diagnosis.hint ?? null,
  });
}
