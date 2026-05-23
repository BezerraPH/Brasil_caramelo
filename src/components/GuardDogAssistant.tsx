"use client";

import { useState } from "react";
import type { GuardDogProvider } from "@/lib/guard-dog";

const PROVIDER_LABEL: Record<GuardDogProvider, string> = {
  ollama: "IA local (Ollama) na sua rede",
  openai: "IA via OpenAI",
  local: "Modo local — regras da matilha + seus dados",
};

export function GuardDogAssistant() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<GuardDogProvider | null>(null);
  const [ragUsed, setRagUsed] = useState(false);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setAnswer(null);
    const res = await fetch("/api/ai/guard-dog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: question.trim() }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setAnswer(data.answer);
      setProvider(data.provider ?? (data.aiPowered ? "openai" : "local"));
      setRagUsed(Boolean(data.ragUsed));
    } else {
      setAnswer(data.error ?? "Auau… erro.");
      setProvider(null);
    }
  }

  return (
    <section className="bc-card bc-guard-dog-panel p-5">
      <h2 className="font-bold text-bc-blue">🛡️ Cão de Guarda</h2>
      <p className="mt-1 text-xs text-bc-brown">
        Pergunte sobre regras, moedas, impulsionar, Tribunal ou moderação.
      </p>
      <form
        onSubmit={(e) => void ask(e)}
        className="mt-4 flex flex-col gap-2 sm:flex-row"
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Por que meu recado sumiu?"
          className="bc-input flex-1 text-sm"
          maxLength={500}
        />
        <button type="submit" disabled={loading} className="bc-btn-primary shrink-0">
          {loading ? "Farejando…" : "Latir"}
        </button>
      </form>
      {answer && (
        <div className="bc-guard-dog-reply bc-animate-in mt-3 rounded-lg bg-bc-blue/5 p-3 text-sm text-bc-brown">
          <p className="whitespace-pre-wrap">{answer}</p>
          {ragUsed && provider && (
            <span className="mt-2 block text-[10px] text-bc-green/80">
              {PROVIDER_LABEL[provider]}
            </span>
          )}
        </div>
      )}
    </section>
  );
}
