"use client";

import { useCallback, useEffect, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";
import {
  createPusherClient,
  isPusherClientConfigured,
} from "@/lib/pusher-client";

export function ChatUnreadBadge({
  pusherKey,
  pusherCluster,
  userId,
}: {
  pusherKey?: string | null;
  pusherCluster?: string | null;
  userId: string;
}) {
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    const res = await fetch("/api/chats/unread");
    if (res.ok) {
      const data = await res.json();
      setCount(data.unreadTotal ?? 0);
    }
  }, []);

  useAsyncEffect(load, [load]);

  useEffect(() => {
    if (!isPusherClientConfigured(pusherKey, pusherCluster)) {
      const t = setInterval(load, 60_000);
      return () => clearInterval(t);
    }

    const pusher = createPusherClient(pusherKey!, pusherCluster ?? "");
    if (!pusher) {
      const t = setInterval(load, 60_000);
      return () => clearInterval(t);
    }
    const channel = pusher.subscribe(`private-user-${userId}`);
    channel.bind("chat-inbox", () => {
      load();
    });
    channel.bind("notification", () => {
      load();
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`private-user-${userId}`);
      pusher.disconnect();
    };
  }, [pusherKey, pusherCluster, userId, load]);

  if (count <= 0) return null;

  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-bc-caramel px-1 text-[10px] font-bold text-white">
      {count > 9 ? "9+" : count}
    </span>
  );
}
