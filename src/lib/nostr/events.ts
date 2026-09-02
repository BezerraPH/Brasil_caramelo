import { finalizeEvent, verifyEvent, type EventTemplate } from "nostr-tools";
import { decodeNostrKey, pubkeyToNpub } from "./keys";
import { getNostrPool, getSavedRelays } from "./relays";
import {
  NOSTR_KINDS,
  type NostrEvent,
  type NostrExtension,
  type NostrIdentity,
  type NostrPost,
  type NostrProfileMetadata,
} from "./types";

/**
 * Assina um evento Nostr usando secretKey local ou extensão NIP-07 (window.nostr).
 */
export async function signNostrEvent(
  template: EventTemplate,
  identity: NostrIdentity,
): Promise<NostrEvent> {
  // Se estiver usando extensão NIP-07
  if (typeof window !== "undefined" && identity.mode === "extension") {
    const nostrExt = (window as unknown as { nostr?: NostrExtension }).nostr;
    if (nostrExt?.signEvent) {
      return await nostrExt.signEvent(template);
    }
  }

  // Se tiver nsec / chave privada
  if (identity.nsec) {
    const decoded = decodeNostrKey(identity.nsec);
    if (decoded.secretKeyBytes) {
      return finalizeEvent(template, decoded.secretKeyBytes);
    }
  }

  throw new Error("Não foi possível assinar o evento. Chave privada ou extensão ausente.");
}

/**
 * Publica um evento assinado em todos os relays configurados.
 */
export async function broadcastNostrEvent(
  event: NostrEvent,
  relays: string[] = getSavedRelays(),
): Promise<void> {
  if (!verifyEvent(event)) {
    throw new Error("Evento inválido ou assinatura incorreta.");
  }

  const pool = getNostrPool();
  await Promise.allSettled(pool.publish(relays, event));
}

/**
 * Publica uma nova nota no Feed (Kind 1) com hashtags da matilha.
 */
export async function publishNostrNote({
  content,
  identity,
  replyToEventId,
  replyToPubkey,
  tags = [],
  relays,
}: {
  content: string;
  identity: NostrIdentity;
  replyToEventId?: string;
  replyToPubkey?: string;
  tags?: string[][];
  relays?: string[];
}): Promise<NostrEvent> {
  const eventTags: string[][] = [
    ["t", "brasilcaramelo"],
    ["client", "Brasil Caramelo Nostr"],
    ...tags,
  ];

  if (replyToEventId) {
    eventTags.push(["e", replyToEventId, "", "reply"]);
  }
  if (replyToPubkey) {
    eventTags.push(["p", replyToPubkey]);
  }

  const template: EventTemplate = {
    kind: NOSTR_KINDS.TEXT_NOTE,
    created_at: Math.floor(Date.now() / 1000),
    tags: eventTags,
    content: content.trim(),
  };

  const signed = await signNostrEvent(template, identity);
  await broadcastNostrEvent(signed, relays);
  return signed;
}

/**
 * Publica uma reação / biscoito (Kind 7) para um evento.
 */
export async function publishNostrReaction({
  targetEventId,
  targetPubkey,
  emoji = "🐾",
  identity,
  relays,
}: {
  targetEventId: string;
  targetPubkey: string;
  emoji?: string;
  identity: NostrIdentity;
  relays?: string[];
}): Promise<NostrEvent> {
  const template: EventTemplate = {
    kind: NOSTR_KINDS.REACTION,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ["e", targetEventId],
      ["p", targetPubkey],
    ],
    content: emoji,
  };

  const signed = await signNostrEvent(template, identity);
  await broadcastNostrEvent(signed, relays);
  return signed;
}

/**
 * Publica metadados do perfil canino (Kind 0).
 */
export async function publishNostrProfile({
  metadata,
  identity,
  relays,
}: {
  metadata: NostrProfileMetadata;
  identity: NostrIdentity;
  relays?: string[];
}): Promise<NostrEvent> {
  const template: EventTemplate = {
    kind: NOSTR_KINDS.METADATA,
    created_at: Math.floor(Date.now() / 1000),
    tags: [],
    content: JSON.stringify(metadata),
  };

  const signed = await signNostrEvent(template, identity);
  await broadcastNostrEvent(signed, relays);
  return signed;
}

/**
 * Converte um evento bruto Kind 1 em um objeto NostrPost formatado para a UI.
 */
export function formatNostrPost(
  event: NostrEvent,
  profilesMap: Map<string, NostrProfileMetadata> = new Map(),
  reactionsMap: Map<string, number> = new Map(),
): NostrPost {
  const npub = pubkeyToNpub(event.pubkey);
  const profile = profilesMap.get(event.pubkey);

  // Extrair URLs de imagem/mídia do conteúdo
  const mediaUrls: string[] = [];
  const urlRegex = /(https?:\/\/[^\s]+?\.(?:png|jpg|jpeg|gif|webp|mp4|webm))/gi;
  let match: RegExpExecArray | null;
  while ((match = urlRegex.exec(event.content)) !== null) {
    mediaUrls.push(match[0]);
  }

  // Verificar se é resposta a outro post
  const replyTag = event.tags.find((t) => t[0] === "e" && (t[3] === "reply" || !t[3]));
  const replyToId = replyTag ? replyTag[1] : undefined;

  const likesCount = reactionsMap.get(event.id) ?? 0;

  return {
    id: event.id,
    pubkey: event.pubkey,
    npub,
    content: event.content,
    createdAt: event.created_at * 1000,
    tags: event.tags,
    sig: event.sig,
    profile,
    likesCount,
    repostsCount: 0,
    repliesCount: 0,
    mediaUrls,
    replyToId,
  };
}
