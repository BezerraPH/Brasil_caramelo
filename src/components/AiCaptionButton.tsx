"use client";

type AiCaptionButtonProps = {
  onCaption: (text: string) => void;
  hint?: string;
};

export function AiCaptionButton({ onCaption, hint }: AiCaptionButtonProps) {
  async function suggest() {
    const res = await fetch("/api/ai/caption", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hint }),
    });
    const data = await res.json();
    if (res.ok && data.caption) onCaption(data.caption);
  }

  return (
    <button
      type="button"
      onClick={suggest}
      className="rounded-lg border border-bc-blue/25 bg-bc-blue/5 px-3 py-1.5 text-xs font-semibold text-bc-blue transition hover:bg-bc-blue/10"
    >
      ✨ Legenda IA
    </button>
  );
}
