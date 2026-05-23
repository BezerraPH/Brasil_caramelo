"use client";

import { useState } from "react";

export function GuardDogAssistant() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiPowered, setAiPowered] = useState(false);
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
      setAiPowered(Boolean(data.aiPowered));
      setRagUsed(Boolean(data.ragUsed));
    } else {
      setAnswer(data.error ?? "Auau… erro.");
    }
  }

  return (
    <section className="bc-card bc-guard-dog-panel p-5">
      <h2 className="font-bold text-bc-blue">🛡️ Cão de Guarda</h2>
      <p className="mt-1 text-xs text-bc-brown">
        Pergunte sobre regras, moedas, impulsionar, Tribunal ou moderação.
      </p>
      <form onSubmit={(e) => void ask(e)} className="mt-4 flex flex-col gap-2 sm:flex-row">
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
        <p className="bc-guard-dog-reply bc-animate-in mt-3 rounded-lg bg-bc-blue/5 p-3 text-sm text-bc-brown">
          {answer}
          {ragUsed && (
            <span className="mt-2 block text-[10px] text-bc-green/80">
              Resposta com contexto da sua matilha (pet, recados, tribunal).
            </span>
          )}
          {!aiPowered && (
            <span className="mt-2 block text-[10px] text-bc-brown/70">
              Modo local — configure OPENAI_API_KEY para respostas com IA.
            </span>
          )}
        </p>
      )}
    </section>
  );
}
