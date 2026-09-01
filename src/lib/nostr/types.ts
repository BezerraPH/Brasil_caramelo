import type { Event as NostrEvent, EventTemplate, Filter } from "nostr-tools";

export type { NostrEvent, EventTemplate, Filter };

export const NOSTR_KINDS = {
  METADATA: 0,
  TEXT_NOTE: 1,
  RECOMMEND_SERVER: 2,
  CONTACT_LIST: 3,
  ENCRYPTED_DIRECT_MESSAGE: 4,
  EVENT_DELETION: 5,
  REPOST: 6,
  REACTION: 7,
  BADGE_AWARD: 8,
  CHANNEL_CREATION: 40,
  CHANNEL_METADATA: 41,
  CHANNEL_MESSAGE: 42,
  ZAP_GOAL: 9041,
  ZAP_REQUEST: 9734,
  ZAP_RECEIPT: 9735,
  HIGHLIGHT: 9802,
  MUTED_USERS: 10000,
  PINNED_NOTES: 10001,
  RELAY_LIST_METADATA: 10002,
  LONG_FORM_CONTENT: 30023,
  COMMUNITY_DEFINITION: 34550,
} as const;

export type NostrProfileMetadata = {
  name?: string;
  display_name?: string;
  about?: string;
  picture?: string;
  banner?: string;
  nip05?: string;
  lud16?: string; // Lightning Address / Pix zap
  website?: string;
  // Campos temáticos Brasil Caramelo
  dog_breed?: string;
  dog_vibe?: string;
  reputation_title?: string;
};

export type NostrAuthMode = "extension" | "nsec" | "guest" | "none";

export type NostrIdentity = {
  pubkey: string; // hex
  npub: string;   // bech32 (npub1...)
  nsec?: string;  // bech32 (nsec1...)
  mode: NostrAuthMode;
  profile?: NostrProfileMetadata;
};

export type RelayConnectionState = "connected" | "connecting" | "disconnected" | "error";

export type RelayInfo = {
  url: string;
  read: boolean;
  write: boolean;
  state: RelayConnectionState;
  latencyMs?: number;
};

export type NostrExtension = {
  getPublicKey: () => Promise<string>;
  signEvent: (template: EventTemplate) => Promise<NostrEvent>;
  nip04?: {
    encrypt: (pubkey: string, plaintext: string) => Promise<string>;
    decrypt: (pubkey: string, ciphertext: string) => Promise<string>;
  };
  nip44?: {
    encrypt: (pubkey: string, plaintext: string) => Promise<string>;
    decrypt: (pubkey: string, ciphertext: string) => Promise<string>;
  };
};

export type NostrPost = {
  id: string;
  pubkey: string;
  npub: string;
  content: string;
  createdAt: number;
  tags: string[][];
  sig: string;
  profile?: NostrProfileMetadata;
  likesCount: number;
  repostsCount: number;
  repliesCount: number;
  isLiked?: boolean;
  isReposted?: boolean;
  mediaUrls: string[];
  replyToId?: string;
};
