"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";
import { PageContainer } from "@/components/PageContainer";
import { UserAvatar } from "@/components/UserAvatar";

type User = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
};

type Pending = {
  id: string;
  requester?: User;
  addressee?: User;
};

export default function AmigosPage() {
  const [friends, setFriends] = useState<User[]>([]);
  const [pendingReceived, setPendingReceived] = useState<Pending[]>([]);
  const [pendingSent, setPendingSent] = useState<Pending[]>([]);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/friends");
    const data = await res.json();
    if (res.ok) {
      setFriends(data.friends ?? []);
      setPendingReceived(data.pendingReceived ?? []);
      setPendingSent(data.pendingSent ?? []);
    }
    setLoading(false);
  }, []);

  useAsyncEffect(load, [load]);

  async function sendRequest(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Pedido enviado!");
      setUsername("");
      load();
    } else {
      setMessage(data.error);
    }
  }

  async function respond(id: string, action: "accept" | "reject") {
    await fetch(`/api/friends/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    load();
  }

  return (
    <PageContainer narrow>
      <header className="bc-animate-in mb-6">
        <h1 className="text-2xl font-bold text-bc-blue">Amigos</h1>
        <p className="text-sm text-bc-brown">Sua rede no Brasil Caramelo</p>
      </header>

      <form
        onSubmit={sendRequest}
        className="bc-card bc-animate-in bc-stagger-1 mb-6 flex gap-2 p-4"
      >
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Usuário para adicionar"
          className="bc-input flex-1"
        />
        <button type="submit" className="bc-btn-primary shrink-0">
          Adicionar
        </button>
      </form>
      {message && (
        <p className="mb-4 text-center text-sm text-bc-green">{message}</p>
      )}

      {loading ? (
        <p className="text-center text-bc-brown">Carregando…</p>
      ) : (
        <div className="space-y-6">
          {pendingReceived.length > 0 && (
            <section className="bc-card bc-animate-in p-4">
              <h2 className="mb-3 font-bold text-bc-green">Pedidos recebidos</h2>
              <ul className="space-y-3">
                {pendingReceived.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-2"
                  >
                    {p.requester && (
                      <>
                        <Link
                          href={`/perfil/${p.requester.username}`}
                          className="flex items-center gap-2"
                        >
                          <UserAvatar
                            name={p.requester.name}
                            avatarUrl={p.requester.avatarUrl}
                          />
                          <span className="text-sm font-medium text-bc-blue">
                            {p.requester.name}
                          </span>
                        </Link>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => respond(p.id, "accept")}
                            className="bc-btn-primary px-3 py-1 text-xs"
                          >
                            Aceitar
                          </button>
                          <button
                            type="button"
                            onClick={() => respond(p.id, "reject")}
                            className="bc-btn-secondary px-3 py-1 text-xs"
                          >
                            Recusar
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="bc-card bc-animate-in bc-stagger-2 p-4">
            <h2 className="mb-3 font-bold text-bc-blue">
              Meus amigos ({friends.length})
            </h2>
            {friends.length === 0 ? (
              <p className="text-sm text-bc-brown">Nenhum amigo ainda.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {friends.map((f) => (
                  <li key={f.id}>
                    <div className="flex items-center justify-between gap-2 rounded-xl p-2 transition hover:bg-bc-green/5">
                      <Link
                        href={`/perfil/${f.username}`}
                        className="flex min-w-0 flex-1 items-center gap-3"
                      >
                        <UserAvatar name={f.name} avatarUrl={f.avatarUrl} />
                        <div>
                          <p className="font-medium text-bc-blue">{f.name}</p>
                          <p className="text-xs text-bc-brown">@{f.username}</p>
                        </div>
                      </Link>
                      <Link
                        href={`/mensagens?with=${f.username}`}
                        className="bc-btn-ghost shrink-0 text-sm"
                        title="Enviar mensagem"
                      >
                        💬
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {pendingSent.length > 0 && (
            <section className="bc-card p-4">
              <h2 className="mb-2 text-sm font-bold text-bc-brown">
                Aguardando resposta ({pendingSent.length})
              </h2>
              <ul className="text-sm text-bc-brown">
                {pendingSent.map((p) => (
                  <li key={p.id}>@{p.addressee?.username}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </PageContainer>
  );
}
