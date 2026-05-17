"use client";

import Pusher from "pusher-js";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { GLOBAL_CHANNEL } from "@/lib/pusher-constants";

type GlobalLiveListenerProps = {
  pusherKey?: string | null;
  pusherCluster?: string | null;
};

export function GlobalLiveListener({
  pusherKey,
  pusherCluster,
}: GlobalLiveListenerProps) {
  const router = useRouter();

  useEffect(() => {
    if (!pusherKey || !pusherCluster) return;

    const pusher = new Pusher(pusherKey, { cluster: pusherCluster });
    const channel = pusher.subscribe(GLOBAL_CHANNEL);

    channel.bind("flash-event", () => router.refresh());
    channel.bind("battle-update", () => router.refresh());
    channel.bind("battle-new", () => router.refresh());
    channel.bind("story-new", () => router.refresh());

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(GLOBAL_CHANNEL);
      pusher.disconnect();
    };
  }, [pusherKey, pusherCluster, router]);

  return null;
}
