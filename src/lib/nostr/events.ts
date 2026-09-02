import { finalizeEvent, nip04, nip44, verifyEvent, type EventTemplate } from "nostr-tools";
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
 * Publica a lista de contatos/seguidos (Kind 3).
 */
export async function publishNostrFollowList({
  followingPubkeys,
  identity,
  relays,
}: {
  followingPubkeys: string[];
  identity: NostrIdentity;
  relays?: string[];
}): Promise<NostrEvent> {
  const tags: string[][] = followingPubkeys.map((pk) => ["p", pk]);

  const template: EventTemplate = {
    kind: NOSTR_KINDS.CONTACT_LIST,
    created_at: Math.floor(Date.now() / 1000),
    tags,
    content: "",
  };

  const signed = await signNostrEvent(template, identity);
  await broadcastNostrEvent(signed, relays);
  return signed;
}

/**
 * Criptografa uma mensagem direta (NIP-04).
/**
 * Criptografa uma mensagem direta com NIP-44 v2 (ChaCha20-Poly1305 + HKDF).
 */
export async function encryptNip44({
  recipientPubkey,
  content,
  identity,
}: {
  recipientPubkey: string;
  content: string;
  identity: NostrIdentity;
}): Promise<string> {
  if (typeof window !== "undefined" && identity.mode === "extension") {
    const nostrExt = (window as unknown as { nostr?: NostrExtension & { nip44?: { encrypt: (pk: string, msg: string) => Promise<string> } } }).nostr;
    if (nostrExt?.nip44?.encrypt) {
      return await nostrExt.nip44.encrypt(recipientPubkey, content);
    }
    // Fallback para nip04 na extensão se nip44 não estiver disponível
    if (nostrExt?.nip04?.encrypt) {
      return await nostrExt.nip04.encrypt(recipientPubkey, content);
    }
  }

  if (identity.nsec) {
    const decoded = decodeNostrKey(identity.nsec);
    if (decoded.secretKeyBytes) {
      const convKey = nip44.v2.utils.getConversationKey(decoded.secretKeyBytes, recipientPubkey);
      return nip44.v2.encrypt(content, convKey);
    }
  }

  throw new Error("Não foi possível criptografar a mensagem (chave/extensão ausente).");
}

/**
 * Criptografa uma mensagem direta (NIP-04 clássico).
 */
export async function encryptNip04({
  recipientPubkey,
  content,
  identity,
}: {
  recipientPubkey: string;
  content: string;
  identity: NostrIdentity;
}): Promise<string> {
  if (typeof window !== "undefined" && identity.mode === "extension") {
    const nostrExt = (window as unknown as { nostr?: NostrExtension }).nostr;
    if (nostrExt?.nip04?.encrypt) {
      return await nostrExt.nip04.encrypt(recipientPubkey, content);
    }
  }

  if (identity.nsec) {
    const decoded = decodeNostrKey(identity.nsec);
    if (decoded.secretKeyBytes) {
      return await nip04.encrypt(decoded.secretKeyBytes, recipientPubkey, content);
    }
  }

  throw new Error("Não foi possível criptografar a mensagem (chave/extensão ausente).");
}

/**
 * Descriptografa uma mensagem direta (Tenta NIP-44 primeiro e faz fallback para NIP-04).
 */
export async function decryptDirectMessage({
  senderPubkey,
  ciphertext,
  identity,
}: {
  senderPubkey: string;
  ciphertext: string;
  identity: NostrIdentity;
}): Promise<string> {
  // Se for extensão NIP-07
  if (typeof window !== "undefined" && identity.mode === "extension") {
    const nostrExt = (window as unknown as {
      nostr?: NostrExtension & { nip44?: { decrypt: (pk: string, msg: string) => Promise<string> } };
    }).nostr;
    if (nostrExt?.nip44?.decrypt) {
      try {
        return await nostrExt.nip44.decrypt(senderPubkey, ciphertext);
      } catch {
        // tenta nip04
      }
    }
    if (nostrExt?.nip04?.decrypt) {
      return await nostrExt.nip04.decrypt(senderPubkey, ciphertext);
    }
  }

  if (identity.nsec) {
    const decoded = decodeNostrKey(identity.nsec);
    if (decoded.secretKeyBytes) {
      // Tentar NIP-44
      try {
        const convKey = nip44.v2.utils.getConversationKey(decoded.secretKeyBytes, senderPubkey);
        return nip44.v2.decrypt(ciphertext, convKey);
      } catch {
        // Fallback NIP-04
        return await nip04.decrypt(decoded.secretKeyBytes, senderPubkey, ciphertext);
      }
    }
  }

  throw new Error("Não foi possível descriptografar a mensagem.");
}

/**
 * Descriptografa uma mensagem direta (NIP-04 legada).
 */
export async function decryptNip04({
  senderPubkey,
  ciphertext,
  identity,
}: {
  senderPubkey: string;
  ciphertext: string;
  identity: NostrIdentity;
}): Promise<string> {
  return decryptDirectMessage({ senderPubkey, ciphertext, identity });
}

/**
 * Publica uma Mensagem Direta Criptografada Ponta-a-Ponta (Kind 4 com suporte NIP-44 / NIP-04).
 */
export async function publishEncryptedDirectMessage({
  recipientPubkey,
  message,
  identity,
  relays,
}: {
  recipientPubkey: string;
  message: string;
  identity: NostrIdentity;
  relays?: string[];
}): Promise<NostrEvent> {
  let ciphertext: string;
  try {
    ciphertext = await encryptNip44({
      recipientPubkey,
      content: message,
      identity,
    });
  } catch {
    ciphertext = await encryptNip04({
      recipientPubkey,
      content: message,
      identity,
    });
  }

  const template: EventTemplate = {
    kind: NOSTR_KINDS.ENCRYPTED_DIRECT_MESSAGE,
    created_at: Math.floor(Date.now() / 1000),
    tags: [["p", recipientPubkey]],
    content: ciphertext,
  };

  const signed = await signNostrEvent(template, identity);
  await broadcastNostrEvent(signed, relays);
  return signed;
}

/**
 * Publica um Artigo Long-Form / Manual Canino (NIP-23 Kind 30023).
 */
export async function publishNostrArticle({
  title,
  summary,
  image,
  content,
  tags = [],
  identity,
  relays,
}: {
  title: string;
  summary?: string;
  image?: string;
  content: string;
  tags?: string[][];
  identity: NostrIdentity;
  relays?: string[];
}): Promise<NostrEvent> {
  const dTag = `artigo-${Date.now()}`;
  const eventTags: string[][] = [
    ["d", dTag],
    ["title", title],
    ["t", "brasilcaramelo"],
    ["client", "Brasil Caramelo Nostr"],
    ...tags,
  ];

  if (summary) {
    eventTags.push(["summary", summary]);
  }
  if (image) {
    eventTags.push(["image", image]);
  }

  const template: EventTemplate = {
    kind: NOSTR_KINDS.LONG_FORM_CONTENT,
    created_at: Math.floor(Date.now() / 1000),
    tags: eventTags,
    content: content.trim(),
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
