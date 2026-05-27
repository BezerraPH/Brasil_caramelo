"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function PushNotificationPanel() {
  const [enabled, setEnabled] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    void fetch("/api/push/vapid")
      .then((r) => r.json())
      .then((d: { enabled?: boolean; publicKey?: string }) => {
        setEnabled(Boolean(d.enabled && d.publicKey));
        setPublicKey(d.publicKey ?? null);
      })
      .catch(() => setEnabled(false));
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    void navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(Boolean(sub));
    });
  }, []);

  if (!enabled || !publicKey) {
    return (
      <section className="bc-card bc-push-panel mb-6 p-5">
        <h2 className="font-bold text-bc-blue">🔔 Push na matilha</h2>
        <p className="mt-2 text-xs text-bc-brown">
          Configure <code className="text-[10px]">VAPID_PRIVATE_KEY</code> e{" "}
          <code className="text-[10px]">NEXT_PUBLIC_VAPID_PUBLIC_KEY</code> no
          servidor (ideal na tailnet). Veja CONFIGURACAO.md.
        </p>
      </section>
    );
  }

  async function subscribe() {
    if (!publicKey) return;
    setBusy(true);
    setStatus(null);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setStatus("Permissão de notificação negada.");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
        });
      }
      const json = sub.toJSON();
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: json.keys,
        }),
      });
      if (!res.ok) {
        setStatus("Não foi possível registrar o dispositivo.");
        return;
      }
      setSubscribed(true);
      setStatus("Push ativo — você recebe alertas mesmo com o app fechado (na tailnet).");
    } catch {
      setStatus("Erro ao ativar push. Use HTTPS ou PWA instalado.");
    } finally {
      setBusy(false);
    }
  }

  async function unsubscribe() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setSubscribed(false);
      setStatus("Push desativado neste aparelho.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="bc-card bc-push-panel bc-animate-in mb-6 border-bc-blue/20 p-5">
      <h2 className="font-bold text-bc-blue">🔔 Push na matilha</h2>
      <p className="mt-2 text-xs text-bc-brown">
        Notificações do sistema na tailnet — amizades, curtidas, enquetes e eventos.
        Complementa o sino ao vivo (Pusher).
      </p>
      {status && <p className="mt-2 text-xs text-bc-green">{status}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        {!subscribed ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void subscribe()}
            className="bc-btn-primary text-sm"
          >
            {busy ? "Ativando…" : "Ativar push"}
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => void unsubscribe()}
            className="bc-btn-secondary text-sm"
          >
            Desativar neste aparelho
          </button>
        )}
      </div>
    </section>
  );
}
