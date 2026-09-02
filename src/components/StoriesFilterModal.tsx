"use client";

import { useState } from "react";

type StoriesFilterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectFilter: (filterClass: string, frameLabel: string) => void;
};

const FILTERS = [
  { id: "none", name: "Normal (Sem Filtro)", css: "", emoji: "📷" },
  { id: "orkut-sepia", name: "Orkut 2004 (Sépia Vintage)", css: "sepia contrast-125", emoji: "📜" },
  { id: "cyber-caramelo", name: "Caramelo Neon (Vibrante)", css: "saturate-200 hue-rotate-15", emoji: "🐕" },
  { id: "nostalgia-bnw", name: "Retrô Preto e Branco", css: "grayscale contrast-150", emoji: "🎞️" },
  { id: "dreamy-glow", name: "Sonho Canino (Glow Suave)", css: "brightness-110 contrast-105", emoji: "✨" },
];

export function StoriesFilterModal({
  isOpen,
  onClose,
  onSelectFilter,
}: StoriesFilterModalProps) {
  const [selected, setSelected] = useState("none");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl border border-bc-caramel/30 bg-bc-white p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-bc-caramel/20 pb-2">
          <h3 className="text-sm font-black text-bc-blue flex items-center gap-1.5">
            <span>🎨</span> Filtros Nostálgicos para Stories
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-bc-brown/60 hover:text-bc-brown text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setSelected(f.id);
                onSelectFilter(f.css, f.name);
                onClose();
              }}
              className={`flex w-full items-center justify-between rounded-xl p-3 text-left transition ${
                selected === f.id
                  ? "bg-bc-green/15 border border-bc-green/30 font-black text-bc-green"
                  : "hover:bg-bc-sand/20 text-bc-brown font-semibold"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{f.emoji}</span>
                <span className="text-xs">{f.name}</span>
              </div>
              {selected === f.id && <span className="text-xs font-bold text-bc-green">✓</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
