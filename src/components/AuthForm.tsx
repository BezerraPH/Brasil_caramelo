"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { safeRedirectPath } from "@/lib/safe-redirect";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const body =
      mode === "login"
        ? {
            email: String(form.get("email")).toLowerCase().trim(),
            password: form.get("password"),
          }
        : {
            name: String(form.get("name")).trim(),
            username: String(form.get("username")).toLowerCase().trim(),
            email: String(form.get("email")).toLowerCase().trim(),
            password: form.get("password"),
          };

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Algo deu errado.");
        return;
      }
      const next = safeRedirectPath(searchParams.get("next"));
      router.push(next);
      router.refresh();
    } catch {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bc-card bc-animate-in w-full max-w-md space-y-4 p-8 shadow-lg"
    >
      <h1 className="text-center text-2xl font-bold text-bc-blue">
        {mode === "login" ? "Entrar" : "Criar conta"}
      </h1>

      {mode === "register" && (
        <>
          <Field label="Nome" name="name" required />
          <Field
            label="Usuário"
            name="username"
            required
            hint="só letras minúsculas, números e _"
          />
        </>
      )}

      <Field label="E-mail" name="email" type="email" required />
      <Field label="Senha" name="password" type="password" required />

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bc-btn-primary w-full py-3 disabled:opacity-50"
      >
        {loading ? "Aguarde…" : mode === "login" ? "Entrar" : "Cadastrar"}
      </button>

      <p className="text-center text-sm text-bc-brown">
        {mode === "login" ? (
          <>
            Novo por aqui?{" "}
            <Link
              href="/cadastro"
              className="font-medium text-bc-green hover:underline"
            >
              Criar conta
            </Link>
          </>
        ) : (
          <>
            Já tem conta?{" "}
            <Link
              href="/entrar"
              className="font-medium text-bc-green hover:underline"
            >
              Entrar
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1 block text-sm font-medium text-bc-blue"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="bc-input w-full"
      />
      {hint && <p className="mt-1 text-xs text-bc-brown/70">{hint}</p>}
    </div>
  );
}
