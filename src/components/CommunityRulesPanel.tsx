"use client";

import { useState } from "react";

type CommunityRulesPanelProps = {
  slug: string;
  initialRules: string;
  canEdit: boolean;
  themePrimary: string;
};

export function CommunityRulesPanel({
  slug,
  initialRules,
  canEdit,
  themePrimary,
}: CommunityRulesPanelProps) {
  const [rules, setRules] = useState(initialRules);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialRules);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/communities/${slug}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinnedRules: draft }),
    });
    const data = await res.json();
    if (res.ok) {
      setRules(draft.trim());
      setEditing(false);
      setMessage("Regras atualizadas.");
    } else {
      setMessage(data.error ?? "Erro ao salvar.");
    }
    setSaving(false);
  }

  if (!rules && !canEdit) return null;

  return (
    <section
      className="bc-community-rules bc-card bc-animate-in-up mb-6 border-2 p-5"
      style={{ borderColor: `${themePrimary}44` }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold" style={{ color: themePrimary }}>
          📌 Regras da comunidade
        </h2>
        {canEdit && !editing && (
          <button
            type="button"
            className="text-xs text-bc-blue hover:underline"
            onClick={() => {
              setDraft(rules);
              setEditing(true);
            }}
          >
            Editar
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-3 space-y-2">
          <textarea
            className="bc-input min-h-[100px] w-full text-sm"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={2000}
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="bc-btn-primary text-sm"
              disabled={saving}
              onClick={() => void save()}
            >
              {saving ? "Salvando…" : "Salvar regras"}
            </button>
            <button
              type="button"
              className="bc-btn-secondary text-sm"
              onClick={() => setEditing(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-2 whitespace-pre-wrap text-sm text-bc-brown">{rules}</p>
      )}
      {message && <p className="mt-2 text-xs text-bc-green">{message}</p>}
    </section>
  );
}
