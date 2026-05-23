"use client";

import Link from "next/link";

export function TurnHintBanner() {
  if (process.env.NEXT_PUBLIC_TURN_URL?.trim()) return null;

  return (
    <aside className="bc-card bc-animate-in mb-4 border-bc-caramel/25 bg-bc-caramel/5 p-3 text-xs text-bc-brown">
      <p>
        <strong className="text-bc-blue">📡 Chamadas fora da LAN:</strong> sem
        servidor TURN configurado, vídeo/áudio pode falhar em redes diferentes.
        Consulte <code className="text-[10px]">COTURN.md</code> no repositório ou
        configure{" "}
        <Link href="/configuracoes" className="font-medium text-bc-blue hover:underline">
          variáveis TURN
        </Link>
        .
      </p>
    </aside>
  );
}
