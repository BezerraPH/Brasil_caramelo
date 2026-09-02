"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useNostrAuth } from "@/lib/nostr/auth-context";
import { getNostrPool } from "@/lib/nostr/relays";
import {
  decryptNip04,
  publishEncryptedDirectMessage,
} from "@/lib/nostr/events";
import { decodeNostrKey, pubkeyToNpub, shortenNpub } from "@/lib/nostr/keys";
import type { NostrEvent, NostrProfileMetadata } from "@/lib/nostr/types";

type DecryptedMessage = {
  id: string;
  senderPubkey: string;
  recipientPubkey: string;
  content: string;
  createdAt: number;
  isMine: boolean;
};

export function NostrDirectMessages() {
  const { identity, relays } = useNostrAuth();
  const [activeContactPubkey, setActiveContactPubkey] = useState<string>("");
  const [recipientInput, setRecipientInput] = useState<string>("");
  const [messages, setMessages] = useState<DecryptedMessage[]>([]);
  const [messageInput, setMessageInput] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [contactProfile, setContactProfile] = useState<NostrProfileMetadata | null>(null);

  const rawEventsRef = useRef<NostrEvent[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll automático para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Carregar perfil do contato ativo
  useEffect(() => {
    if (!activeContactPubkey) return;
    const pool = getNostrPool();
    pool
      .get(relays, { kinds: [0], authors: [activeContactPubkey] })
      .then((ev) => {
        if (ev?.content) {
          try {
            setContactProfile(JSON.parse(ev.content));
          } catch {
            setContactProfile(null);
          }
        }
      })
      .catch(() => setContactProfile(null));
  }, [activeContactPubkey, relays]);

  useEffect(() => {
    if (!identity?.pubkey || !activeContactPubkey) {
      return;
    }

    let active = true;
    const pool = getNostrPool();
    rawEventsRef.current = [];

    const sub = pool.subscribeMany(
      relays,
      {
        kinds: [4],
        authors: [identity.pubkey, activeContactPubkey],
        "#p": [identity.pubkey, activeContactPubkey],
        limit: 50,
      },
      {
        async onevent(event: NostrEvent) {
          if (!active) return;
          const isBetweenUs =
            (event.pubkey === identity.pubkey && event.tags.some((t) => t[0] === "p" && t[1] === activeContactPubkey)) ||
            (event.pubkey === activeContactPubkey && event.tags.some((t) => t[0] === "p" && t[1] === identity.pubkey));

          if (isBetweenUs && !rawEventsRef.current.some((e) => e.id === event.id)) {
            rawEventsRef.current.push(event);
            rawEventsRef.current.sort((a, b) => a.created_at - b.created_at);

            const isMine = event.pubkey === identity.pubkey;
            const peerPubkey = isMine ? activeContactPubkey : event.pubkey;

            try {
              const decrypted = await decryptNip04({
                senderPubkey: peerPubkey,
                ciphertext: event.content,
                identity,
              });

              if (!active) return;
              setMessages((prev) => {
                if (prev.some((m) => m.id === event.id)) return prev;
                const newMsg: DecryptedMessage = {
                  id: event.id,
                  senderPubkey: event.pubkey,
                  recipientPubkey: peerPubkey,
                  content: decrypted,
                  createdAt: event.created_at * 1000,
                  isMine,
                };
                return [...prev, newMsg].sort((a, b) => a.createdAt - b.createdAt);
              });
            } catch {
              // Caso não consiga descriptografar
            }
          }
        },
        oneose() {
          if (active) setLoadingHistory(false);
        },
      },
    );

    const timer = setTimeout(() => {
      if (active) setLoadingHistory(false);
    }, 3500);

    return () => {
      active = false;
      clearTimeout(timer);
      sub.close();
    };
  }, [identity, activeContactPubkey, relays]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!messageInput.trim() || !identity || !activeContactPubkey || sending) return;

    setSending(true);
    try {
      const sentEvent = await publishEncryptedDirectMessage({
        recipientPubkey: activeContactPubkey,
        message: messageInput.trim(),
        identity,
        relays,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: sentEvent.id,
          senderPubkey: identity.pubkey,
          recipientPubkey: activeContactPubkey,
          content: messageInput.trim(),
          createdAt: Date.now(),
          isMine: true,
        },
      ]);
      setMessageInput("");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao enviar mensagem criptografada.");
    } finally {
      setSending(false);
    }
  }

  function handleStartChatWithInput() {
    if (!recipientInput.trim()) return;
    try {
      const decoded = decodeNostrKey(recipientInput.trim());
      if (decoded.hexPubkey) {
        setActiveContactPubkey(decoded.hexPubkey);
        setRecipientInput("");
      } else {
        setActiveContactPubkey(recipientInput.trim());
        setRecipientInput("");
      }
    } catch {
      setActiveContactPubkey(recipientInput.trim());
      setRecipientInput("");
    }
  }

  if (!identity) {
    return (
      <div className="bc-card rounded-3xl border border-bc-caramel/20 bg-bc-white p-8 text-center shadow-xs">
        <p className="text-3xl">🔒</p>
        <p className="mt-2 text-sm font-bold text-bc-blue">
          Conecte sua identidade Nostr para usar Mensagens Criptografadas Ponta-a-Ponta.
        </p>
        <p className="mt-1 text-xs text-bc-brown/70">
          Suas mensagens diretas (NIP-04) são criptografadas matematicamente com chaves Schnorr.
        </p>
      </div>
    );
  }

  const contactName =
    contactProfile?.name ||
    contactProfile?.display_name ||
    (activeContactPubkey ? shortenNpub(pubkeyToNpub(activeContactPubkey), 8) : "");

  return (
    <div className="space-y-4">
      {/* Seletor de Contato / Iniciar Conversa */}
      <div className="bc-card rounded-2xl border border-bc-caramel/15 bg-bc-white/95 p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-bc-caramel/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔒</span>
            <h2 className="text-xs font-bold text-bc-blue uppercase tracking-wider">
              Chat Privado Criptografado (NIP-04)
            </h2>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
            E2E Schnorr Ativo
          </span>
        </div>

        <div className="mt-3 flex gap-2">
          <input
            type="text"
            placeholder="Cole o npub1... ou chave do destinatário para conversar"
            value={recipientInput}
            onChange={(e) => setRecipientInput(e.target.value)}
            className="bc-input flex-1 text-xs"
          />
          <button
            type="button"
            onClick={handleStartChatWithInput}
            className="bc-btn-primary px-4 py-1.5 text-xs font-bold"
          >
            Abrir Chat 💬
          </button>
        </div>
      </div>

      {/* Janela de Mensagens */}
      {activeContactPubkey ? (
        <div className="bc-card rounded-3xl border border-bc-caramel/20 bg-bc-white/95 shadow-sm overflow-hidden flex flex-col h-[480px]">
          {/* Topo do Chat */}
          <div className="flex items-center justify-between border-b border-bc-caramel/15 bg-bc-cream/30 p-3.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-bc-caramel/30 to-bc-green/20 border border-bc-caramel/20">
                {contactProfile?.picture ? (
                  <Image
                    src={contactProfile.picture}
                    alt={contactName}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm">🐕</div>
                )}
              </div>
              <div className="min-w-0">
                <Link
                  href={`/nostr/p/${pubkeyToNpub(activeContactPubkey)}`}
                  className="font-bold text-xs text-bc-blue hover:underline block truncate"
                >
                  {contactName}
                </Link>
                <p className="font-mono text-[10px] text-bc-brown/60 truncate">
                  {shortenNpub(pubkeyToNpub(activeContactPubkey), 8)}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveContactPubkey("")}
              className="text-xs text-bc-brown/60 hover:text-bc-brown p-1"
              title="Fechar conversa"
            >
              ✕
            </button>
          </div>

          {/* Histórico de Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-transparent to-bc-sand/10">
            {loadingHistory && messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-bc-brown/60">
                <span className="animate-spin mr-2">⚙️</span> Carregando e descriptografando mensagens...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center p-4">
                <p className="text-2xl">🔒</p>
                <p className="text-xs font-bold text-bc-blue mt-1">Início da conversa criptografada</p>
                <p className="text-[11px] text-bc-brown/60 max-w-xs mt-0.5">
                  Nenhum intermediário ou relay tem acesso ao conteúdo das mensagens trocadas aqui.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const formattedTime = new Intl.DateTimeFormat("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(msg.createdAt));

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.isMine ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs shadow-2xs leading-relaxed ${
                        msg.isMine
                          ? "bg-bc-blue text-white rounded-br-xs"
                          : "bg-bc-white border border-bc-caramel/20 text-bc-brown rounded-bl-xs"
                      }`}
                    >
                      <p className="whitespace-pre-line break-words">{msg.content}</p>
                      <span
                        className={`block text-[9px] mt-1 text-right ${
                          msg.isMine ? "text-white/70" : "text-bc-brown/50"
                        }`}
                      >
                        {formattedTime} 🔒
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Campo de Envio */}
          <form onSubmit={handleSendMessage} className="border-t border-bc-caramel/15 p-3 bg-bc-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Escreva uma mensagem segura..."
                className="bc-input flex-1 text-xs"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !messageInput.trim()}
                className="bc-btn-primary px-4 py-2 text-xs font-bold shadow-xs"
              >
                {sending ? "..." : "Enviar 🔒"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bc-card rounded-3xl border border-bc-caramel/15 bg-bc-white/95 p-6 text-center shadow-xs">
          <p className="text-3xl">🐾</p>
          <p className="mt-2 text-sm font-bold text-bc-blue">Nenhuma conversa selecionada</p>
          <p className="mt-1 text-xs text-bc-brown/70 max-w-sm mx-auto">
            Insira o npub de outro caramelo acima ou clique no botão de mensagem privada no perfil de qualquer usuário para conversar!
          </p>
        </div>
      )}
    </div>
  );
}
