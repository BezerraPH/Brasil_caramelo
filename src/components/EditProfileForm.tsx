"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { RelationshipStatus } from "@/generated/prisma/enums";

const RELATIONSHIP_OPTIONS: { value: RelationshipStatus | ""; label: string }[] =
  [
    { value: "", label: "Não informar" },
    { value: "SINGLE", label: "Solteiro(a)" },
    { value: "IN_RELATIONSHIP", label: "Namorando" },
    { value: "ENGAGED", label: "Noivo(a)" },
    { value: "MARRIED", label: "Casado(a)" },
    { value: "COMPLICATED", label: "É complicado" },
    { value: "NOT_SAYING", label: "Prefiro não dizer" },
  ];

type EditProfileFormProps = {
  user: {
    name: string;
    username: string;
    bio: string | null;
    birthDate: Date | null;
    relationshipStatus: RelationshipStatus | null;
  };
};

function toDateInputValue(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export function EditProfileForm({ user }: EditProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio ?? "");
  const [birthDate, setBirthDate] = useState(toDateInputValue(user.birthDate));
  const [relationshipStatus, setRelationshipStatus] = useState(
    user.relationshipStatus ?? "",
  );
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
          birthDate: birthDate || null,
          relationshipStatus: relationshipStatus || null,
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
          Quem sou eu
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={5}
          maxLength={500}
          placeholder="Conte um pouco sobre você… Use **negrito** e *itálico*."
          className="bc-input resize-none"
        />
        <p className="mt-1 text-xs text-bc-brown/70">
          Formatação básica: **negrito**, *itálico*
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="birthDate" className="bc-label">
            Aniversário
          </label>
          <input
            id="birthDate"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="bc-input"
          />
        </div>
        <div>
          <label htmlFor="relationship" className="bc-label">
            Relacionamento
          </label>
          <select
            id="relationship"
            value={relationshipStatus}
            onChange={(e) =>
              setRelationshipStatus(
                e.target.value as RelationshipStatus | "",
              )
            }
            className="bc-input"
          >
            {RELATIONSHIP_OPTIONS.map((o) => (
              <option key={o.value || "none"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
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
