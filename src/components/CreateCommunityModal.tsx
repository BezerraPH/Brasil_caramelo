"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COMMUNITY_CATEGORIES } from "@/lib/communities-types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (slug: string) => void;
};

const SUGGESTED_EMOJIS = ["🐕", "🐾", "🐺", "🍖", "⚽", "🎵", "🎮", "😂", "📸", "🏝️", "🇧🇷", "☕"];

export function CreateCommunityModal({ isOpen, onClose, onCreated }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("outros");
  const [emoji, setEmoji] = useState("🐕");
  const [themePrimary, setThemePrimary] = useState("#005f38");
  const [themeAccent, setThemeAccent] = useState("#ffc72c");
  const [pinnedRules, setPinnedRules] = useState(
    "Seja gentil com a matilha. Sem spam, sem preconceito. Zoeira sim, ofensa não.",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      setError("Preencha o nome e a descrição da comunidade.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          category,
          emoji,
          themePrimary,
          themeAccent,
          pinnedRules: pinnedRules.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar comunidade.");
      }

      onClose();
      if (onCreated) {
        onCreated(data.community.slug);
      } else {
        router.push(`/comunidades/${data.community.slug}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Falha ao criar comunidade.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bc-card max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-bc-caramel/30 bg-bc-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-bc-caramel/20 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏘️</span>
            <div>
              <h2 className="text-lg font-bold text-bc-blue">Criar Nova Comunidade</h2>
              <p className="text-xs text-bc-brown/70">Reúna a matilha em torno de um tema especial.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-bc-brown/60 hover:bg-black/5 hover:text-bc-brown"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-bc-blue mb-1">Nome da Comunidade *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Eu Amo Vira-Lata Caramelo"
              maxLength={60}
              required
              className="bc-input w-full"
            />
          </div>

          <div>
            <label className="block font-bold text-bc-blue mb-1">Descrição / Sobre *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explique o propósito da comunidade, quem deve participar..."
              rows={3}
              maxLength={300}
              required
              className="bc-input w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-bc-blue mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bc-input w-full"
              >
                {COMMUNITY_CATEGORIES.filter((c) => c.id !== "todos").map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-bc-blue mb-1">Ícone Emoji</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  maxLength={4}
                  className="bc-input w-16 text-center text-lg"
                />
                <div className="flex flex-wrap gap-1">
                  {SUGGESTED_EMOJIS.slice(0, 6).map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setEmoji(em)}
                      className="rounded-lg p-1 hover:bg-bc-cream"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-bc-blue mb-1">Cor Primária (Tema)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={themePrimary}
                  onChange={(e) => setThemePrimary(e.target.value)}
                  className="h-8 w-12 cursor-pointer rounded border border-bc-caramel/30"
                />
                <span className="font-mono text-[11px] text-bc-brown/70">{themePrimary}</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-bc-blue mb-1">Cor Secundária (Acento)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={themeAccent}
                  onChange={(e) => setThemeAccent(e.target.value)}
                  className="h-8 w-12 cursor-pointer rounded border border-bc-caramel/30"
                />
                <span className="font-mono text-[11px] text-bc-brown/70">{themeAccent}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-bc-blue mb-1">Regras Fixadas no Topo</label>
            <textarea
              value={pinnedRules}
              onChange={(e) => setPinnedRules(e.target.value)}
              rows={2}
              maxLength={200}
              className="bc-input w-full"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-bc-caramel/20 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-bc-caramel/30 px-4 py-2 font-bold text-bc-brown hover:bg-black/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="bc-btn-primary rounded-xl px-5 py-2 font-bold disabled:opacity-50"
            >
              {submitting ? "Criando Comunidade..." : "Criar Comunidade 🏘️"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
