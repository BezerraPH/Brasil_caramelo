"use client";

import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";

type CommunityModsPanelProps = {
  slug: string;
  isOwner: boolean;
  themePrimary: string;
};

export function CommunityModsPanel({
  slug,
  isOwner,
  themePrimary,
}: CommunityModsPanelProps) {
  const [moderators, setModerators] = useState<
    { username: string; name: string }[]
  >([]);
  const [ownerName, setOwnerName] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/communities/${slug}/moderators`);
    const data = await res.json();
    if (res.ok) {
      setModerators(data.moderators ?? []);
      setOwnerName(data.owner?.username ?? null);
    }
  }, [slug]);

  useAsyncEffect(() => {
    if (isOwner) void load();
  }, [isOwner, load]);

  async function act(action: "promote" | "demote") {
    if (!username.trim()) return;
    setBusy(true);
    setMessage(null);
    const res = await fetch(`/api/communities/${slug}/moderators`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), action }),
    });
    const data = await res.json();
    if (res.ok) {
      setUsername("");
      setMessage(action === "promote" ? "Moderador adicionado." : "Moderador removido.");
      await load();
    } else {
      setMessage(data.error ?? "Erro.");
    }
    setBusy(false);
  }

  if (!isOwner) return null;

  return (
    <section className="bc-card mb-6 p-4 text-sm">
      <h3 className="font-bold" style={{ color: themePrimary }}>
        Moderadores
      </h3>
      {ownerName && (
        <p className="mt-1 text-xs text-bc-brown">
          Dono: <strong>@{ownerName}</strong>
        </p>
      )}
      <ul className="mt-2 space-y-1 text-xs text-bc-brown">
        {moderators.length === 0 ? (
          <li>Nenhum moderador extra.</li>
        ) : (
          moderators.map((m) => (
            <li key={m.username}>@{m.username}</li>
          ))
        )}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          type="text"
          className="bc-input flex-1 text-xs"
          placeholder="@username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          type="button"
          className="bc-btn-primary text-xs"
          disabled={busy}
          onClick={() => void act("promote")}
        >
          Promover
        </button>
        <button
          type="button"
          className="bc-btn-secondary text-xs"
          disabled={busy}
          onClick={() => void act("demote")}
        >
          Rebaixar
        </button>
      </div>
      {message && <p className="mt-2 text-xs text-bc-green">{message}</p>}
    </section>
  );
}
