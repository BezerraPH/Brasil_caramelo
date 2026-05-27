"use client";

import { useEffect } from "react";
import type { ViewMode } from "@/generated/prisma/enums";

type ModeShellProps = {
  viewMode: ViewMode;
  children: React.ReactNode;
};

/** Transição suave entre modos — mesma DB, casca diferente. */
export function ModeShell({ viewMode, children }: ModeShellProps) {
  useEffect(() => {
    const body = document.body;
    body.classList.remove("bc-mode-feed", "bc-mode-insta", "bc-mode-reels", "bc-mode-switching");
    body.classList.add("bc-mode-switching");
    const modeClass =
      viewMode === "INSTA"
        ? "bc-mode-insta"
        : viewMode === "REELS"
          ? "bc-mode-reels"
          : "bc-mode-feed";
    body.classList.add(modeClass);
    const t = setTimeout(() => body.classList.remove("bc-mode-switching"), 400);
    return () => clearTimeout(t);
  }, [viewMode]);

  return <div className="bc-mode-shell">{children}</div>;
}
