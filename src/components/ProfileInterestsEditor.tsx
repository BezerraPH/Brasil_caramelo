"use client";

import { useState } from "react";

type ProfileInterestsEditorProps = {
  initialInterests: string[];
};

export function ProfileInterestsEditor({
  initialInterests,
}: ProfileInterestsEditorProps) {
  const [interests, setInterests] = useState(initialInterests);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function addTag() {
    const tag = draft.trim().toLowerCase().replace(/\s+/g, "-");
    if (!tag || interests.includes(tag) || interests.length >= 15) return;
    setInterests((prev) => [...prev, tag]);
    setDraft("");
  }

  function removeTag(tag: string) {
    setInterests((prev) => prev.filter((t) => t !== tag));
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests }),
      });
      if (!res.ok) {
        setMessage("Não foi possível salvar.");
        return;
      }
      setMessage("Interesses atualizados.");
    } catch {
      setMessage("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="bc-card mb-6 space-y-3 p-5">
      <h2 className="font-bold text-bc-blue">Interesses</h2>
      <p className="text-sm text-bc-brown">
        Tags estilo Orkut — tecnologia, música, culinária… (até 15)
      </p>
      <div className="flex flex-wrap gap-1.5">
        {interests.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full border border-bc-blue/20 bg-bc-blue/5 px-2.5 py-0.5 text-xs font-medium text-bc-blue"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-bc-brown/60 hover:text-red-600"
              aria-label={`Remover ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          maxLength={30}
          placeholder="Nova tag…"
          className="bc-input flex-1 text-sm"
          disabled={interests.length >= 15}
        />
        <button
          type="button"
          onClick={addTag}
          disabled={interests.length >= 15 || !draft.trim()}
          className="bc-btn-secondary shrink-0 text-sm"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="bc-btn-primary text-sm"
      >
        {saving ? "Salvando…" : "Salvar interesses"}
      </button>
      {message && <p className="text-xs text-bc-green">{message}</p>}
    </section>
  );
}
