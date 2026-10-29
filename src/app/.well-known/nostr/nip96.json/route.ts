import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  return NextResponse.json({
    api_url: `${baseUrl}/api/nostr/nip96`,
    download_url: `${baseUrl}/api/media`,
    supported_nips: [96, 94],
    tos_url: `${baseUrl}/termos`,
    plans: {
      free: {
        name: "Brasil Caramelo Sovereign Storage",
        is_active: true,
        max_byte_size: 52428800, // 50MB
        file_retention: ["permanent"],
      },
    },
  });
}
