"use client";

import { useEffect, useState } from "react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Voltar ao topo"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="bc-scroll-top bc-animate-pop fixed bottom-20 left-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-bc-caramel text-lg text-white shadow-lg shadow-bc-caramel/30 transition hover:scale-105 md:bottom-8 md:left-auto md:right-24"
    >
      ↑
    </button>
  );
}
