"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { UploadButton } from "@/lib/uploadthing";
import { BcImage } from "./BcImage";
import { UserAvatar } from "./UserAvatar";

type StoryGroup = {
  user: { id: string; name: string; username: string; avatarUrl: string | null };
  stories: {
    id: string;
    mediaUrl: string;
    mediaType: string;
    expiresAt: string;
  }[];
};

export function StoriesBar({ currentUserId }: { currentUserId: string }) {
  const [groups, setGroups] = useState<StoryGroup[]>([]);
  const [viewer, setViewer] = useState<{
    group: StoryGroup;
    index: number;
  } | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/stories");
    const data = await res.json();
    if (res.ok) setGroups(data.groups);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <section className="bc-card bc-glass mb-4 overflow-x-auto p-3">
        <div className="flex gap-3">
          <div className="flex shrink-0 flex-col items-center gap-1">
            <UploadButton
              endpoint="storyMedia"
              onClientUploadComplete={async (res) => {
                const file = res?.[0];
                const url = file?.ufsUrl ?? file?.url;
                if (!url) return;
                const isVideo = file?.type?.startsWith("video");
                await fetch("/api/stories", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    mediaUrl: url,
                    mediaType: isVideo ? "VIDEO" : "IMAGE",
                  }),
                });
                load();
              }}
              appearance={{
                button:
                  "bc-story-ring flex h-16 w-16 items-center justify-center rounded-full bg-bc-white text-2xl ut-ready:bg-bc-white",
              }}
              content={{ button: "+" }}
            />
            <span className="max-w-[64px] truncate text-[10px] font-medium text-bc-blue">
              Seu story
            </span>
          </div>

          {groups.map((g) => (
            <button
              key={g.user.id}
              type="button"
              onClick={() => setViewer({ group: g, index: 0 })}
              className="flex shrink-0 flex-col items-center gap-1"
            >
              <div
                className={
                  g.user.id === currentUserId
                    ? "bc-story-ring"
                    : "bc-story-ring"
                }
              >
                <div className="rounded-full bg-bc-white p-0.5">
                  <UserAvatar
                    name={g.user.name}
                    avatarUrl={g.user.avatarUrl}
                    size="sm"
                  />
                </div>
              </div>
              <span className="max-w-[64px] truncate text-[10px] text-bc-brown">
                {g.user.id === currentUserId ? "Você" : g.user.name.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>
      </section>

      {viewer && (
        <StoryViewer
          group={viewer.group}
          index={viewer.index}
          onClose={() => setViewer(null)}
          onNext={() => {
            const next = viewer.index + 1;
            if (next < viewer.group.stories.length) {
              setViewer({ ...viewer, index: next });
            } else setViewer(null);
          }}
        />
      )}
    </>
  );
}

function StoryViewer({
  group,
  index,
  onClose,
  onNext,
}: {
  group: StoryGroup;
  index: number;
  onClose: () => void;
  onNext: () => void;
}) {
  const story = group.stories[index];
  if (!story) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4">
      <button
        type="button"
        className="absolute right-4 top-4 z-10 text-2xl text-white"
        onClick={onClose}
      >
        ✕
      </button>
      <div className="relative max-h-[85vh] w-full max-w-md overflow-hidden rounded-2xl bg-black">
        <Link
          href={`/perfil/${group.user.username}`}
          className="absolute left-3 top-3 z-10 flex items-center gap-2 text-white"
        >
          <UserAvatar name={group.user.name} avatarUrl={group.user.avatarUrl} size="sm" />
          <span className="text-sm font-semibold">{group.user.name}</span>
        </Link>
        {story.mediaType === "VIDEO" ? (
          <video
            src={story.mediaUrl}
            className="max-h-[85vh] w-full object-contain"
            autoPlay
            muted
            playsInline
            onEnded={onNext}
          />
        ) : (
          <div className="relative aspect-[9/16] w-full">
            <BcImage src={story.mediaUrl} alt="" fill className="object-contain" />
          </div>
        )}
        <button
          type="button"
          className="absolute inset-y-0 right-0 w-1/3"
          aria-label="Próximo"
          onClick={onNext}
        />
      </div>
    </div>
  );
}
