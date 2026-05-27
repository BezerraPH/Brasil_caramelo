"use client";

import { useState } from "react";

export function GdprExportPanel() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function download() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/users/me/export");
      if (res.status === 429) {
        const data = await res.json();
        setMessage(data.error ?? "Limite atingido.");
        return;
      }
      if (!res.ok) {
        setMessage("Não foi possível gerar o arquivo.");
        return;
      }
      const blob = await res.blob();
      const disp = res.headers.get("Content-Disposition");
      const match = disp?.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? "brasil-caramelo-export.json";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      setMessage("Download iniciado — guarde o JSON em local seguro.");
    } catch {
      setMessage("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bc-card bc-gdpr-panel bc-animate-in mb-6 p-5">
      <h2 className="font-bold text-bc-blue">📤 Exportar meus dados</h2>
      <p className="mt-1 text-xs text-bc-brown">
        Baixe um JSON com perfil, recados, comentários, depoimentos, amizades,
        álbuns, Matilhas e notificações (LGPD / direito de acesso).
      </p>
      <button
        type="button"
        onClick={() => void download()}
        disabled={loading}
        className="bc-btn-primary mt-4 w-full sm:w-auto"
      >
        {loading ? "Gerando…" : "Baixar exportação JSON"}
      </button>
      {message && (
        <p className="mt-2 text-xs text-bc-green" role="status">
          {message}
        </p>
      )}
      <p className="mt-2 text-[10px] text-bc-brown/80">
        Limite: 3 exportações por hora por conta.
      </p>
    </section>
  );
}
