"use client";

import { useEffect, useState } from "react";

type ShareMatilhaLinkProps = {
  className?: string;
};

export function ShareMatilhaLink({ className = "" }: ShareMatilhaLinkProps) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/matilha/connection")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const app = (data?.appUrl as string | undefined)?.trim();
        setUrl(app || window.location.origin);
      })
      .catch(() => setUrl(window.location.origin));
  }, []);

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback silencioso */
    }
  }

  return (
    <section className={`bc-card bc-animate-in p-4 ${className}`}>
      <h2 className="text-sm font-bold text-bc-blue">Compartilhar matilha</h2>
      <p className="mt-1 text-xs text-bc-brown">
        Envie este link para amigos na mesma rede ou Tailscale.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <code className="bc-share-url flex-1 truncate rounded-lg bg-bc-blue/5 px-3 py-2 text-xs text-bc-brown">
          {url || "…"}
        </code>
        <button
          type="button"
          onClick={copy}
          className="bc-btn bc-share-btn shrink-0 px-4 py-2 text-sm"
          disabled={!url}
        >
          {copied ? "Copiado!" : "Copiar link"}
        </button>
      </div>
    </section>
  );
}
