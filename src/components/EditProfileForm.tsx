"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type EditProfileFormProps = {
  user: {
    name: string;
    username: string;
    bio: string | null;
  };
};

export function EditProfileForm({ user }: EditProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          username: username.toLowerCase().trim(),
          bio: bio.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível salvar.");
        return;
      }
      router.push(`/perfil/${data.username}`);
      router.refresh();
    } catch {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bc-card space-y-5 p-6">
      <div>
        <label htmlFor="name" className="bc-label">
          Nome exibido
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={80}
          className="bc-input"
        />
      </div>

      <div>
        <label htmlFor="username" className="bc-label">
          Usuário (@)
        </label>
        <input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          required
          pattern="[a-z0-9_]+"
          className="bc-input"
        />
        <p className="mt-1 text-xs text-bc-brown/80">
          Mudar o usuário altera o link do seu perfil.
        </p>
      </div>

      <div>
        <label htmlFor="bio" className="bc-label">
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          maxLength={300}
          placeholder="Conte um pouco sobre você..."
          className="bc-input resize-none"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={loading} className="bc-btn-primary">
          {loading ? "Salvando…" : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
