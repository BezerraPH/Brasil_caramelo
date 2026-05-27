"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

export function PwaInstallBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }
    if (localStorage.getItem("bc_pwa_install_dismiss") === "1") {
      setDismissed(true);
    }

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  if (installed || dismissed || !deferred) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    setDeferred(null);
    setInstalled(true);
  }

  function dismiss() {
    localStorage.setItem("bc_pwa_install_dismiss", "1");
    setDismissed(true);
  }

  return (
    <div className="bc-pwa-install-banner bc-animate-in-up mx-auto mb-4 max-w-6xl px-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-bc-green/30 bg-gradient-to-r from-bc-green/15 to-bc-caramel/10 px-4 py-3 shadow-sm">
        <div>
          <p className="text-sm font-bold text-bc-green">📱 Instalar Brasil Caramelo</p>
          <p className="text-xs text-bc-brown">
            Atalho na tela inicial — feed, Cinelar e Matilhas offline-ready.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => void install()} className="bc-btn-primary text-xs">
            Instalar
          </button>
          <button type="button" onClick={dismiss} className="bc-btn-ghost text-xs">
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
}
