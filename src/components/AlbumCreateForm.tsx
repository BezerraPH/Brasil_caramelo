"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AlbumCreateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao criar álbum.");
        return;
      }
      router.push(`/fotos/${data.album.id}`);
      router.refresh();
    } catch {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="bc-card space-y-3 p-4">
      <h2 className="text-sm font-bold text-bc-blue">Novo álbum</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={80}
        required
        placeholder="Ex.: Viagem 2026, Pets da matilha…"
        className="bc-input text-sm"
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={300}
        placeholder="Descrição (opcional)"
        className="bc-input text-sm"
      />
      <button type="submit" disabled={loading} className="bc-btn-primary text-sm">
        {loading ? "Criando…" : "Criar álbum"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}
