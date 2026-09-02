"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type FriendItem = {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
};

type MentionAutocompleteProps = {
  query: string;
  onSelect: (username: string) => void;
};

export function MentionAutocomplete({ query, onSelect }: MentionAutocompleteProps) {
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    async function searchFriends() {
      if (!query && query !== "") return;
      setLoading(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
        if (res.ok && active) {
          const data = await res.json();
          setFriends(Array.isArray(data.users) ? data.users.slice(0, 5) : []);
        }
      } catch {
        // Silencioso
      } finally {
        if (active) setLoading(false);
      }
    }

    const timer = setTimeout(searchFriends, 150);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  if (friends.length === 0 && !loading) return null;

  return (
    <div className="absolute left-0 right-0 z-30 mb-1 bottom-full rounded-2xl border border-bc-caramel/30 bg-bc-white p-2 shadow-xl backdrop-blur-md dark:bg-slate-900 dark:border-white/10 animate-fade-in">
      <div className="text-[10px] font-bold text-bc-brown/60 px-2 py-1 uppercase tracking-wider dark:text-slate-400">
        Marcar amigo da matilha:
      </div>
      <div className="space-y-1">
        {friends.map((friend) => (
          <button
            key={friend.id}
            type="button"
            onClick={() => onSelect(friend.username)}
            className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-left text-xs font-bold text-bc-brown hover:bg-bc-sand/50 dark:text-slate-200 dark:hover:bg-slate-800 transition"
          >
            <div className="relative h-6 w-6 rounded-full overflow-hidden bg-amber-500/20">
              {friend.avatarUrl ? (
                <Image
                  src={friend.avatarUrl}
                  alt={friend.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[10px] text-amber-900 font-black">
                  {friend.name[0]}
                </span>
              )}
            </div>
            <div className="flex-1 truncate">
              <span>{friend.name}</span>
              <span className="ml-1.5 text-[11px] font-normal text-bc-brown/60 dark:text-slate-400">
                @{friend.username}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
