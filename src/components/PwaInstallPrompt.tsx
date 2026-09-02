"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
  });

  useEffect(() => {
    if (isStandalone) return;

    // Check if dismissed recently
    const dismissed = localStorage.getItem("bc_pwa_dismissed");
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Register service worker if supported
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Service worker registration error ignored in unsupported environments
      });
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isStandalone]);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    setShowPrompt(false);
    localStorage.setItem("bc_pwa_dismissed", String(Date.now()));
  }

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md animate-fade-in-up rounded-2xl border border-bc-caramel/30 bg-bc-white p-4 shadow-2xl md:bottom-6 md:right-6 md:left-auto">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-bc-green to-bc-caramel text-2xl shadow-sm">
          🐕
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-black text-bc-blue">
            Instalar Brasil Caramelo no Celular
          </h3>
          <p className="mt-0.5 text-xs font-semibold text-bc-brown">
            Acesse direto da sua tela inicial como um app nativo, com resposta rápida e modo offline!
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleInstall}
              className="rounded-xl bg-gradient-to-r from-bc-green to-bc-caramel px-4 py-1.5 text-xs font-black text-white shadow-xs hover:opacity-95 transition"
            >
              📲 Instalar App Grátis
            </button>
            <button
              onClick={handleDismiss}
              className="rounded-xl border border-bc-caramel/30 bg-bc-sand/20 px-3 py-1.5 text-xs font-bold text-bc-brown hover:bg-bc-sand/40 transition"
            >
              Agora não
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-bc-brown/60 hover:text-bc-brown text-sm font-bold"
          aria-label="Fechar"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
