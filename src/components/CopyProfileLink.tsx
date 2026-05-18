"use client";

import { useState } from "react";
type CopyProfileLinkProps = {
  username: string;
};

export function CopyProfileLink({ username }: CopyProfileLinkProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}/perfil/${username}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard indisponível */
    }
  }

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="bc-btn-ghost text-sm"
    >
      {copied ? "✓ Link copiado" : "🔗 Copiar link"}
    </button>
  );
}
