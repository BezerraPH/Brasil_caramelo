"use client";

import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";

/** Badge na nav mobile quando há notificações não lidas. */
export function NotificationUnreadDot() {
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    const res = await fetch("/api/notifications");
    if (res.ok) {
      const data = await res.json();
      setCount(data.unreadCount ?? 0);
    }
  }, []);

  useAsyncEffect(load, [load]);

  if (count <= 0) return null;

  return (
    <span
      className="absolute -right-1 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-bc-caramel px-0.5 text-[9px] font-bold text-white"
      aria-label={`${count} notificações não lidas`}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}
