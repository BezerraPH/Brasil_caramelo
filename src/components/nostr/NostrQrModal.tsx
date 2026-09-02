"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: string;
  description?: string;
};

export function NostrQrModal({ isOpen, onClose, title, data, description }: Props) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !data) return null;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
    data,
  )}&margin=10`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bc-card relative w-full max-w-sm rounded-3xl border border-bc-caramel/30 bg-bc-white p-6 text-center shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-bc-brown/60 hover:bg-black/5 hover:text-bc-brown"
          title="Fechar"
        >
          ✕
        </button>

        <h3 className="text-lg font-bold text-bc-blue">{title}</h3>
        {description && <p className="mt-1 text-xs text-bc-brown/70">{description}</p>}

        <div className="my-4 flex justify-center">
          <div className="relative h-64 w-64 overflow-hidden rounded-2xl border-2 border-bc-caramel/30 bg-white p-2 shadow-inner">
            <Image
              src={qrUrl}
              alt="QR Code"
              fill
              className="object-contain p-2"
              unoptimized
            />
          </div>
        </div>

        <div className="mt-2">
          <p className="font-mono text-[11px] text-bc-brown/80 break-all line-clamp-2 px-2 bg-bc-sand/30 py-1.5 rounded-xl border border-bc-caramel/20">
            {data}
          </p>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 rounded-xl bg-bc-blue py-2 text-xs font-bold text-white hover:bg-bc-blue/90 transition-colors"
          >
            {copied ? "✓ Copiado!" : "Copiar Texto / Chave"}
          </button>
        </div>
      </div>
    </div>
  );
}
