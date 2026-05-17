"use client";

import Link from "next/link";
import { useState } from "react";
import { PageContainer } from "@/components/PageContainer";
import { UserAvatar } from "@/components/UserAvatar";

type User = {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
};

export default function BuscarPage() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [searched, setSearched] = useState(false);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim().length < 2) return;
    setSearched(true);
    const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setUsers(data.users ?? []);
  }

  return (
    <PageContainer narrow>
      <header className="bc-animate-in mb-6">
        <h1 className="text-2xl font-bold text-bc-blue">Buscar pessoas</h1>
        <p className="text-sm text-bc-brown">Encontre amigos na comunidade</p>
      </header>

      <form onSubmit={search} className="bc-card bc-animate-in bc-stagger-1 mb-6 p-4">
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nome ou @usuário"
            className="bc-input flex-1"
          />
          <button type="submit" className="bc-btn-primary shrink-0">
            Buscar
          </button>
        </div>
      </form>

      <ul className="space-y-3">
        {searched && users.length === 0 && (
          <li className="bc-card p-6 text-center text-bc-brown">
            Ninguém encontrado.
          </li>
        )}
        {users.map((u, i) => (
          <li
            key={u.id}
            className={`bc-card bc-card-interactive bc-animate-in p-4 ${i < 5 ? `bc-stagger-${i + 1}` : ""}`}
          >
            <Link href={`/perfil/${u.username}`} className="flex gap-3">
              <UserAvatar name={u.name} avatarUrl={u.avatarUrl} size="md" />
              <div>
                <p className="font-semibold text-bc-blue">{u.name}</p>
                <p className="text-sm text-bc-brown">@{u.username}</p>
                {u.bio && (
                  <p className="mt-1 line-clamp-2 text-xs text-gray-600">{u.bio}</p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
