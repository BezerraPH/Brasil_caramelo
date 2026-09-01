import { generateSecretKey, getPublicKey, nip19 } from "nostr-tools";
import type { NostrIdentity } from "./types";

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/[^0-9a-fA-F]/g, "");
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Gera um novo par de chaves Nostr (secp256k1) e retorna a identidade completa.
 */
export function generateNewNostrIdentity(): NostrIdentity {
  const sk = generateSecretKey();
  const pk = getPublicKey(sk);
  const npub = nip19.npubEncode(pk);
  const nsec = nip19.nsecEncode(sk);

  return {
    pubkey: pk,
    npub,
    nsec,
    mode: "nsec",
  };
}

/**
 * Converte chave pública hex para bech32 npub1...
 */
export function pubkeyToNpub(pubkeyHex: string): string {
  try {
    return nip19.npubEncode(pubkeyHex);
  } catch {
    return pubkeyHex;
  }
}

/**
 * Converte chave privada hex para bech32 nsec1...
 */
export function secretKeyToNsec(secretKeyHex: string): string {
  try {
    const bytes = hexToBytes(secretKeyHex);
    return nip19.nsecEncode(bytes);
  } catch {
    return secretKeyHex;
  }
}

/**
 * Decodifica qualquer string Nostr (npub, nsec, hex, etc.) retornando os dados decodificados.
 */
export function decodeNostrKey(input: string): {
  type: "npub" | "nsec" | "hex" | "invalid";
  hexPubkey?: string;
  secretKeyBytes?: Uint8Array;
} {
  const trimmed = input.trim();
  if (!trimmed) return { type: "invalid" };

  // Se já for hex de 64 caracteres
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return { type: "hex", hexPubkey: trimmed.toLowerCase() };
  }

  try {
    const decoded = nip19.decode(trimmed);
    if (decoded.type === "npub") {
      return { type: "npub", hexPubkey: decoded.data as string };
    }
    if (decoded.type === "nsec") {
      const bytes = decoded.data as Uint8Array;
      const hexPub = getPublicKey(bytes);
      return { type: "nsec", hexPubkey: hexPub, secretKeyBytes: bytes };
    }
  } catch {
    // decode falhou
  }

  return { type: "invalid" };
}

/**
 * Encurta npub para exibição amigável na interface (ex.: npub1swjg...36as).
 */
export function shortenNpub(npub: string, chars = 6): string {
  if (!npub || npub.length <= chars * 2 + 5) return npub;
  return `${npub.slice(0, chars + 5)}…${npub.slice(-chars)}`;
}
