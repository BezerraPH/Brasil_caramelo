"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";
import { useCall } from "@/components/CallProvider";
import {
  useRealtimeChat,
  type RealtimeMessagePayload,
} from "@/hooks/use-realtime-chat";
import type { TypingPayload } from "@/lib/chat-constants";
import { ChatComposer } from "./ChatComposer";
import {
  ChatMessageBubble,
  type ChatBubbleMessage,
} from "./ChatMessageBubble";
import { TurnHintBanner } from "./TurnHintBanner";
import { UserAvatar } from "./UserAvatar";

type Peer = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
};

type ConversationItem = {
  id: string;
  peer: Peer;
  lastMessage: {
    content: string;
    createdAt: string;
    isMine: boolean;
  } | null;
  unread: number;
  lastMessageAt: string;
};

type RoomItem = {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  lastMessage: {
    content: string;
    attachmentUrl?: string | null;
    senderName: string;
    createdAt: string;
  } | null;
  lastMessageAt: string;
};

type ChatMessage = ChatBubbleMessage & {
  senderId: string;
  sender: Peer;
  readAt?: string | null;
};

type RoomMessage = ChatBubbleMessage & {
  senderId: string;
  sender: { name: string; username: string; avatarUrl?: string | null };
};

type ChatAppProps = {
  currentUser: { id: string; name: string; username: string };
  pusherKey?: string | null;
  pusherCluster?: string | null;
};

function previewText(content: string, hasAttachment?: boolean) {
  if (content.trim()) return content;
  if (hasAttachment) return "📎 Anexo";
  return "Sem mensagens";
}

export function ChatApp({
  currentUser,
  pusherKey,
  pusherCluster,
}: ChatAppProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeConvId = searchParams.get("c");
  const roomSlug = searchParams.get("room");
  const withUsername = searchParams.get("with");
  const mode =
    roomSlug || searchParams.get("tab") === "rooms" ? "rooms" : "dm";

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomMessages, setRoomMessages] = useState<RoomMessage[]>([]);
  const [activeRoom, setActiveRoom] = useState<{
    id: string;
    slug: string;
    name: string;
    emoji: string;
  } | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [newChatUser, setNewChatUser] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [typingLabel, setTypingLabel] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const panelOpen = mode === "dm" ? Boolean(activeConvId) : Boolean(roomSlug);

  const { startCall } = useCall();

  const loadList = useCallback(async () => {
    const res = await fetch("/api/chats");
    const data = await res.json();
    if (res.ok) {
      setConversations(data.conversations ?? []);
    }
    setLoadingList(false);
  }, []);

  const loadRooms = useCallback(async () => {
    const res = await fetch("/api/rooms");
    const data = await res.json();
    if (res.ok) {
      setRooms(data.rooms ?? []);
    }
  }, []);

  const loadMessages = useCallback(
    async (conversationId: string) => {
      setTypingLabel(null);
      setLoadingChat(true);
      const res = await fetch(`/api/chats/${conversationId}/messages`);
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages ?? []);
        await fetch(`/api/chats/${conversationId}/read`, { method: "PATCH" });
        loadList();
      }
      setLoadingChat(false);
    },
    [loadList],
  );

  const loadRoomMessages = useCallback(
    async (slug: string) => {
      setTypingLabel(null);
      setLoadingChat(true);
      const res = await fetch(`/api/rooms/${slug}/messages`);
      const data = await res.json();
      if (res.ok) {
        setActiveRoom(data.room);
        setRoomMessages(data.messages ?? []);
        loadRooms();
      } else {
        setError(data.error ?? "Sala não encontrada.");
      }
      setLoadingChat(false);
    },
    [loadRooms],
  );

  useAsyncEffect(async () => {
    await loadList();
    await loadRooms();
  }, [loadList, loadRooms]);

  useEffect(() => {
    if (!withUsername || activeConvId) return;
    void (async () => {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: withUsername }),
      });
      const data = await res.json();
      if (res.ok) {
        router.replace(`/mensagens?c=${data.conversation.id}`);
        loadList();
      } else {
        setError(data.error);
      }
    })();
  }, [withUsername, activeConvId, router, loadList]);

  useAsyncEffect(async () => {
    if (mode === "dm" && activeConvId) {
      await loadMessages(activeConvId);
    } else if (mode !== "dm") {
      setMessages([]);
    }
  }, [mode, activeConvId, loadMessages]);

  useAsyncEffect(async () => {
    if (mode === "rooms" && roomSlug) {
      await loadRoomMessages(roomSlug);
    } else if (mode === "rooms") {
      setRoomMessages([]);
      setActiveRoom(null);
    }
  }, [mode, roomSlug, loadRoomMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, roomMessages]);

  const handleTyping = useCallback((data: TypingPayload) => {
    if (data.userId === currentUser.id) return;
    if (data.isTyping) {
      setTypingLabel(data.userName);
      if (typingClearRef.current) clearTimeout(typingClearRef.current);
      typingClearRef.current = setTimeout(() => setTypingLabel(null), 3000);
    } else {
      setTypingLabel(null);
    }
  }, [currentUser.id]);

  const mapRealtimeDm = useCallback(
    (payload: RealtimeMessagePayload): ChatMessage | null => {
      const peer = activeConv?.peer;
      if (!peer) return null;
      return {
        id: payload.id,
        content: payload.content,
        attachmentUrl: payload.attachmentUrl,
        attachmentMime: payload.attachmentMime,
        senderId: payload.senderId,
        sender: peer,
        createdAt: payload.createdAt,
        isMine: false,
        readAt: null,
      };
    },
    [activeConv?.peer],
  );

  const onDmMessage = useCallback(
    (payload: RealtimeMessagePayload) => {
      if (payload.senderId === currentUser.id) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === payload.id)) return prev;
        const msg = mapRealtimeDm(payload);
        return msg ? [...prev, msg] : prev;
      });
      if (activeConvId) {
        void fetch(`/api/chats/${activeConvId}/read`, { method: "PATCH" });
      }
      loadList();
    },
    [activeConvId, currentUser.id, loadList, mapRealtimeDm],
  );

  const onRoomMessage = useCallback(
    (payload: RealtimeMessagePayload) => {
      if (payload.senderId === currentUser.id) return;
      setRoomMessages((prev) => {
        if (prev.some((m) => m.id === payload.id)) return prev;
        return [
          ...prev,
          {
            id: payload.id,
            content: payload.content,
            attachmentUrl: payload.attachmentUrl,
            attachmentMime: payload.attachmentMime,
            senderId: payload.senderId,
            sender: {
              name: payload.senderName ?? "Alguém",
              username: payload.senderUsername ?? "",
            },
            createdAt: payload.createdAt,
            isMine: false,
            showSender: true,
          },
        ];
      });
      loadRooms();
    },
    [currentUser.id, loadRooms],
  );

  useRealtimeChat({
    userId: currentUser.id,
    conversationId: mode === "dm" ? activeConvId : null,
    roomId: mode === "rooms" ? activeRoom?.id ?? null : null,
    pusherKey,
    pusherCluster,
    onDmMessage: mode === "dm" ? onDmMessage : undefined,
    onRoomMessage: mode === "rooms" ? onRoomMessage : undefined,
    onInboxUpdate: loadList,
    onTyping: handleTyping,
  });

  async function startChat(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: newChatUser.replace(/^@/, "") }),
    });
    const data = await res.json();
    if (res.ok) {
      setNewChatUser("");
      router.push(`/mensagens?c=${data.conversation.id}`);
      loadList();
    } else {
      setError(data.error);
    }
  }

  async function sendDm(
    content: string,
    attachment?: { url: string; mime: string },
  ) {
    if (!activeConvId) return;
    if (!content.trim() && !attachment) return;
    setSending(true);
    setError(null);
    const res = await fetch(`/api/chats/${activeConvId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: content.trim(),
        attachmentUrl: attachment?.url,
        attachmentMime: attachment?.mime,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessages((prev) => [...prev, data.message]);
      loadList();
    } else {
      setError(data.error ?? "Falha ao enviar.");
    }
    setSending(false);
  }

  async function sendRoom(
    content: string,
    attachment?: { url: string; mime: string },
  ) {
    if (!roomSlug) return;
    if (!content.trim() && !attachment) return;
    setSending(true);
    setError(null);
    const res = await fetch(`/api/rooms/${roomSlug}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: content.trim(),
        attachmentUrl: attachment?.url,
        attachmentMime: attachment?.mime,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setRoomMessages((prev) => [
        ...prev,
        { ...data.message, showSender: false },
      ]);
      loadRooms();
    } else {
      setError(data.error ?? "Falha ao enviar.");
    }
    setSending(false);
  }

  function postTyping(isTyping: boolean) {
    if (mode === "dm" && activeConvId) {
      void fetch(`/api/chats/${activeConvId}/typing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTyping }),
      });
    } else if (mode === "rooms" && roomSlug) {
      void fetch(`/api/rooms/${roomSlug}/typing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTyping }),
      });
    }
  }

  const listBackHref = mode === "rooms" ? "/mensagens?tab=rooms" : "/mensagens";

  return (
    <div className="bc-chat-layout bc-animate-in">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-bc-blue">Mensagens</h1>
        <p className="text-sm text-bc-brown">
          Privado com amigos ou salas da casinha
          {pusherKey && (
            <span className="ml-2 text-bc-green">● ao vivo</span>
          )}
        </p>
      </header>

      <TurnHintBanner />

      <div className="bc-chat-tabs mb-4 flex gap-2">
        <Link
          href="/mensagens"
          className={`bc-chat-tab ${mode === "dm" ? "bc-chat-tab--active" : ""}`}
        >
          💬 Privado
        </Link>
        <Link
          href="/mensagens?tab=rooms"
          className={`bc-chat-tab ${mode === "rooms" ? "bc-chat-tab--active" : ""}`}
        >
          🏠 Salas
        </Link>
      </div>

      {mode === "dm" && (
        <form onSubmit={startChat} className="bc-card mb-4 flex gap-2 p-3">
          <input
            value={newChatUser}
            onChange={(e) => setNewChatUser(e.target.value)}
            placeholder="@usuário do amigo"
            className="bc-input flex-1"
          />
          <button type="submit" className="bc-btn-primary shrink-0">
            Nova conversa
          </button>
        </form>
      )}

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="bc-chat-grid">
        <aside
          className={`bc-card bc-chat-list overflow-hidden ${panelOpen ? "hidden md:flex md:flex-col" : "flex flex-col"}`}
        >
          {mode === "dm" ? (
            loadingList ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bc-skeleton h-14 rounded-xl" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <p className="p-6 text-center text-sm text-bc-brown">
                Nenhuma conversa ainda. Adicione amigos e comece a latir! 🐕
              </p>
            ) : (
              <ul className="flex-1 overflow-y-auto">
                {conversations.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/mensagens?c=${c.id}`}
                      className={`bc-chat-list-item flex gap-3 px-3 py-3 transition ${
                        activeConvId === c.id ? "bc-chat-list-item--active" : ""
                      }`}
                    >
                      <UserAvatar
                        name={c.peer.name}
                        avatarUrl={c.peer.avatarUrl}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-semibold text-bc-blue">
                            {c.peer.name}
                          </span>
                          {c.unread > 0 && (
                            <span className="shrink-0 rounded-full bg-bc-caramel px-1.5 text-[10px] font-bold text-white">
                              {c.unread}
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-bc-brown">
                          {c.lastMessage
                            ? `${c.lastMessage.isMine ? "Você: " : ""}${previewText(c.lastMessage.content)}`
                            : "Sem mensagens"}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )
          ) : rooms.length === 0 ? (
            <p className="p-6 text-center text-sm text-bc-brown">
              Carregando salas…
            </p>
          ) : (
            <ul className="flex-1 overflow-y-auto">
              {rooms.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/mensagens?tab=rooms&room=${r.slug}`}
                    className={`bc-chat-list-item flex gap-3 px-3 py-3 transition ${
                      roomSlug === r.slug ? "bc-chat-list-item--active" : ""
                    }`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bc-green/15 text-xl">
                      {r.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="truncate font-semibold text-bc-blue">
                        {r.name}
                      </span>
                      <p className="truncate text-xs text-bc-brown">
                        {r.lastMessage
                          ? `${r.lastMessage.senderName}: ${previewText(
                              r.lastMessage.content,
                              Boolean(r.lastMessage.attachmentUrl),
                            )}`
                          : "Entre na toca!"}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section
          className={`bc-card bc-chat-panel flex flex-col overflow-hidden ${
            panelOpen ? "flex" : "hidden md:flex"
          }`}
        >
          {mode === "dm" && !activeConvId ? (
            <EmptyPanel
              icon="💬"
              title="Selecione uma conversa"
              subtitle="Ou inicie com o @ de um amigo"
            />
          ) : mode === "rooms" && !roomSlug ? (
            <EmptyPanel
              icon="🏠"
              title="Escolha uma sala"
              subtitle="Uma sala por casinha da matilha"
            />
          ) : mode === "dm" ? (
            <DmPanel
              activeConv={activeConv}
              listBackHref={listBackHref}
              messages={messages}
              loadingChat={loadingChat}
              typingLabel={typingLabel}
              bottomRef={bottomRef}
              onCall={
                activeConv?.peer
                  ? () =>
                      void startCall({
                        id: activeConv.peer.id,
                        name: activeConv.peer.name,
                      })
                  : undefined
              }
              onSend={sendDm}
              onTyping={postTyping}
              sending={sending}
            />
          ) : (
            <RoomPanel
              activeRoom={activeRoom}
              listBackHref={listBackHref}
              messages={roomMessages}
              loadingChat={loadingChat}
              typingLabel={typingLabel}
              bottomRef={bottomRef}
              onSend={sendRoom}
              onTyping={postTyping}
              sending={sending}
            />
          )}
        </section>
      </div>
    </div>
  );
}

function EmptyPanel({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
      <span className="text-5xl">{icon}</span>
      <p className="mt-4 font-medium text-bc-blue">{title}</p>
      <p className="mt-1 text-sm text-bc-brown">{subtitle}</p>
    </div>
  );
}

function DmPanel({
  activeConv,
  listBackHref,
  messages,
  loadingChat,
  typingLabel,
  bottomRef,
  onCall,
  onSend,
  onTyping,
  sending,
}: {
  activeConv: ConversationItem | undefined;
  listBackHref: string;
  messages: ChatMessage[];
  loadingChat: boolean;
  typingLabel: string | null;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  onCall?: () => void;
  onSend: (content: string, attachment?: { url: string; mime: string }) => void;
  onTyping: (isTyping: boolean) => void;
  sending: boolean;
}) {
  return (
    <>
      <header className="bc-chat-header flex items-center gap-3 border-b border-bc-blue/10 px-4 py-3">
        <Link
          href={listBackHref}
          className="text-bc-blue md:hidden"
          aria-label="Voltar"
        >
          ←
        </Link>
        {activeConv && (
          <>
            <UserAvatar
              name={activeConv.peer.name}
              avatarUrl={activeConv.peer.avatarUrl}
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-bc-blue">{activeConv.peer.name}</p>
              <Link
                href={`/perfil/${activeConv.peer.username}`}
                className="text-xs text-bc-brown hover:underline"
              >
                @{activeConv.peer.username}
              </Link>
            </div>
            {onCall && (
              <button
                type="button"
                onClick={onCall}
                className="bc-btn-ghost shrink-0 px-2 text-lg"
                title="Chamada de vídeo"
              >
                📹
              </button>
            )}
          </>
        )}
      </header>

      {typingLabel && (
        <p className="bc-typing-indicator border-b border-bc-blue/8 px-4 py-1.5 text-xs text-bc-brown">
          <span className="bc-typing-dots">{typingLabel} está digitando</span>
        </p>
      )}

      <MessageList
        loading={loadingChat}
        messages={messages}
        bottomRef={bottomRef}
      />

      <ChatComposer
        disabled={!activeConv}
        sending={sending}
        onSend={onSend}
        onTyping={onTyping}
      />
    </>
  );
}

function RoomPanel({
  activeRoom,
  listBackHref,
  messages,
  loadingChat,
  typingLabel,
  bottomRef,
  onSend,
  onTyping,
  sending,
}: {
  activeRoom: { slug: string; name: string; emoji: string } | null;
  listBackHref: string;
  messages: RoomMessage[];
  loadingChat: boolean;
  typingLabel: string | null;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  onSend: (content: string, attachment?: { url: string; mime: string }) => void;
  onTyping: (isTyping: boolean) => void;
  sending: boolean;
}) {
  return (
    <>
      <header className="bc-chat-header flex items-center gap-3 border-b border-bc-blue/10 px-4 py-3">
        <Link
          href={listBackHref}
          className="text-bc-blue md:hidden"
          aria-label="Voltar"
        >
          ←
        </Link>
        {activeRoom && (
          <>
            <span className="text-2xl">{activeRoom.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-bc-blue">{activeRoom.name}</p>
              <Link
                href={`/casinha/${activeRoom.slug}`}
                className="text-xs text-bc-brown hover:underline"
              >
                Ver feed da casinha
              </Link>
            </div>
          </>
        )}
      </header>

      {typingLabel && (
        <p className="bc-typing-indicator border-b border-bc-blue/8 px-4 py-1.5 text-xs text-bc-brown">
          <span className="bc-typing-dots">{typingLabel} está digitando</span>
        </p>
      )}

      <MessageList
        loading={loadingChat}
        messages={messages.map((m) => ({
          ...m,
          showSender: !m.isMine,
        }))}
        bottomRef={bottomRef}
      />

      <ChatComposer
        disabled={!activeRoom}
        sending={sending}
        onSend={onSend}
        onTyping={onTyping}
      />
    </>
  );
}

function MessageList({
  loading,
  messages,
  bottomRef,
}: {
  loading: boolean;
  messages: ChatBubbleMessage[];
  bottomRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="bc-chat-messages flex-1 space-y-2 overflow-y-auto p-4">
      {loading ? (
        <p className="text-center text-sm text-bc-brown">Carregando…</p>
      ) : (
        messages.map((m, i) => (
          <div
            key={m.id}
            className={`bc-chat-bubble-wrap flex ${
              m.isMine ? "justify-end" : "justify-start"
            } ${i < 4 ? `bc-stagger-${i + 1}` : ""}`}
          >
            <ChatMessageBubble message={m} />
          </div>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
}
