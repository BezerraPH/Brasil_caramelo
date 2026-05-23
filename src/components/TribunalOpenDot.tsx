"use client";

import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";

export function TribunalOpenDot() {
  const [open, setOpen] = useState(false);

  const check = useCallback(async () => {
    const res = await fetch("/api/tribunal?tab=open");
    if (!res.ok) return;
    const data = await res.json();
    setOpen((data.cases?.length ?? 0) > 0);
  }, []);

  useAsyncEffect(check, [check]);

  if (!open) return null;

  return (
    <span
      className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-bc-blue ring-2 ring-bc-white bc-animate-pulse"
      aria-hidden
    />
  );
}
