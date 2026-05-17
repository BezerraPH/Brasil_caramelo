"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";
import { BcImage } from "./BcImage";
import { LocalMediaUpload } from "./LocalMediaUpload";
import { UserAvatar } from "./UserAvatar";

type StoryGroup = {
  user: { id: string; name: string; username: string; avatarUrl: string | null };
  allViewed: boolean;
  stories: {
    id: string;
    mediaUrl: string;
    mediaType: string;
    expiresAt: string;
    viewed?: boolean;
  }[];
};

export function StoriesBar({ currentUserId }: { currentUserId: string }) {
  const [groups, setGroups] = useState<StoryGroup[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [viewer, setViewer] = useState<{
    group: StoryGroup;
    index: number;
  } | null>(null);
  const load = useCallback(async () => {
    const res = await fetch("/api/stories");
    const data = await res.json();
    if (res.ok) setGroups(data.groups);
  }, []);

  useAsyncEffect(load, [load]);

  async function markViewed(storyIds: string[]) {
    await fetch("/api/stories/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyIds }),
    });
    load();
  }

  function openGroup(g: StoryGroup) {
    setViewer({ group: g, index: 0 });
    if (g.user.id !== currentUserId) {
      void markViewed([g.stories[0]?.id].filter(Boolean));
    }
  }

  return (
    <>
      <section className="bc-card bc-glass mb-4 overflow-x-auto p-3">
        <div className="flex gap-3">
          <div className="flex shrink-0 flex-col items-center gap-1">
            <div className="bc-story-ring rounded-full">
              <LocalMediaUpload
                kind="story"
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                label="+"
                className="flex h-16 w-16 items-center justify-center rounded-full bg-bc-white text-2xl font-bold text-bc-blue"
                onUploaded={async (url, mime) => {
                  setUploadError(null);
                  const isVideo = mime.startsWith("video/");
                  const postRes = await fetch("/api/stories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      mediaUrl: url,
                      mediaType: isVideo ? "VIDEO" : "IMAGE",
                    }),
                  });
                  if (!postRes.ok) {
                    const data = await postRes.json();
                    setUploadError(
                      data.error ?? "Não foi possível publicar o story.",
                    );
                    return;
                  }
                  load();
                }}
                onError={setUploadError}
              />
            </div>
            <span className="max-w-[64px] truncate text-[10px] font-medium text-bc-blue">
              Seu story
            </span>
          </div>

          {groups.map((g) => (
            <button
              key={g.user.id}
              type="button"
              onClick={() => openGroup(g)}
              className="flex shrink-0 flex-col items-center gap-1"
            >
              <div
                className={
                  g.user.id === currentUserId || !g.allViewed
                    ? "bc-story-ring"
                    : "bc-story-ring-seen"
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
        {uploadError && (
          <p className="mt-2 text-xs text-red-600">{uploadError}</p>
        )}
      </section>

      {viewer && (
        <StoryViewer
          group={viewer.group}
          index={viewer.index}
          currentUserId={currentUserId}
          onClose={() => setViewer(null)}
          onMarkViewed={markViewed}
          onNext={(nextIndex) => {
            const next = viewer.group.stories[nextIndex];
            if (next && viewer.group.user.id !== currentUserId) {
              void markViewed([next.id]);
            }
            if (nextIndex < viewer.group.stories.length) {
              setViewer({ ...viewer, index: nextIndex });
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
  currentUserId: string;
  onClose: () => void;
  onNext: (nextIndex: number) => void;
  onMarkViewed: (ids: string[]) => Promise<void>;
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
        <div className="absolute left-0 right-0 top-0 z-10 flex gap-0.5 p-2">
          {group.stories.map((s, i) => (
            <div
              key={s.id}
              className={`h-0.5 flex-1 rounded-full ${i <= index ? "bg-white" : "bg-white/30"}`}
            />
          ))}
        </div>
        <Link
          href={`/perfil/${group.user.username}`}
          className="absolute left-3 top-6 z-10 flex items-center gap-2 text-white"
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
            onEnded={() => onNext(index + 1)}
          />
        ) : (
          <div className="relative aspect-[9/16] w-full">
            <BcImage src={story.mediaUrl} alt="Story" fill className="object-contain" />
          </div>
        )}
        <button
          type="button"
          className="absolute inset-y-0 right-0 w-1/3"
          aria-label="Próximo"
          onClick={() => onNext(index + 1)}
        />
      </div>
    </div>
  );
}
