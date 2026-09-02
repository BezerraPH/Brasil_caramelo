"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { playBarkSound } from "@/lib/sound-fx";

type StoryItem = {
  id: string;
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  user: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
  hasViewed: boolean;
};

export function StoriesOrkutBar() {
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [activeStory, setActiveStory] = useState<StoryItem | null>(null);

  useEffect(() => {
    async function loadStories() {
      try {
        const res = await fetch("/api/stories");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.stories)) {
            setStories(data.stories);
          }
        }
      } catch {
        // Fallback silencioso
      }
    }
    loadStories();
  }, []);

  function handleOpenStory(story: StoryItem) {
    playBarkSound();
    setActiveStory(story);
  }

  return (
    <div className="rounded-3xl border border-bc-caramel/25 bg-bc-sand/30 p-3 shadow-xs dark:border-white/10 dark:bg-slate-900/40">
      <div className="flex items-center justify-between px-1 mb-2">
        <h3 className="text-xs font-black text-bc-blue flex items-center gap-1.5 dark:text-amber-400">
          <span>🐕</span> Stories da Matilha (Estilo Orkut)
        </h3>
        <Link
          href="/fotos"
          className="text-[11px] font-bold text-bc-brown/70 hover:text-bc-brown dark:text-slate-400"
        >
          Álbuns 📸
        </Link>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
        {/* Botão de Adicionar Story */}
        <Link
          href="/feed"
          className="flex flex-col items-center gap-1 shrink-0 group"
          title="Publicar no feed / story"
        >
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-bc-caramel bg-amber-500/10 text-bc-brown font-black transition group-hover:scale-105 dark:border-amber-400 dark:bg-amber-400/10 dark:text-amber-400">
            <span className="text-xl">+</span>
          </div>
          <span className="text-[10px] font-bold text-bc-brown/80 dark:text-slate-300">Meu Story</span>
        </Link>

        {/* Lista de Stories */}
        {stories.map((story) => (
          <button
            key={story.id}
            type="button"
            onClick={() => handleOpenStory(story)}
            className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none"
          >
            <div
              className={`p-0.5 rounded-full transition group-hover:scale-105 ${
                story.hasViewed
                  ? "border border-bc-caramel/30 bg-transparent"
                  : "bg-gradient-to-tr from-amber-500 via-bc-caramel to-bc-blue p-0.5"
              }`}
            >
              <div className="relative h-13 w-13 rounded-full overflow-hidden border-2 border-white dark:border-slate-900 bg-bc-sand">
                {story.user.avatarUrl ? (
                  <Image
                    src={story.user.avatarUrl}
                    alt={story.user.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-amber-500/20 text-xs font-black text-amber-900">
                    {story.user.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <span className="max-w-[60px] truncate text-[10px] font-bold text-bc-brown/90 dark:text-slate-300">
              {story.user.name}
            </span>
          </button>
        ))}

        {stories.length === 0 && (
          <div className="flex items-center gap-2 text-xs text-bc-brown/60 px-2 dark:text-slate-400">
            <span>🐾 Nenhuma história nova no momento.</span>
          </div>
        )}
      </div>

      {/* Modal Visualizador de Story */}
      {activeStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/20">
            {/* Barra de progresso */}
            <div className="absolute top-3 inset-x-3 z-20 flex gap-1">
              <div className="h-1 flex-1 rounded-full bg-white animate-pulse" />
            </div>

            {/* Cabeçalho do Story */}
            <div className="absolute top-6 inset-x-3 z-20 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <div className="relative h-8 w-8 rounded-full overflow-hidden border border-white">
                  {activeStory.user.avatarUrl ? (
                    <Image
                      src={activeStory.user.avatarUrl}
                      alt={activeStory.user.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-amber-500 font-bold text-xs">
                      {activeStory.user.name[0]}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-black drop-shadow-md">{activeStory.user.name}</p>
                  <p className="text-[10px] text-white/80">@{activeStory.user.username}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveStory(null)}
                className="rounded-full bg-black/40 p-1.5 text-white hover:bg-black/60"
              >
                ✕
              </button>
            </div>

            {/* Mídia */}
            <div className="relative h-[480px] w-full bg-slate-900 flex items-center justify-center">
              {activeStory.mediaType === "VIDEO" ? (
                <video
                  src={activeStory.mediaUrl}
                  autoPlay
                  playsInline
                  className="h-full w-full object-contain"
                />
              ) : (
                <Image
                  src={activeStory.mediaUrl}
                  alt="Story"
                  fill
                  className="object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
