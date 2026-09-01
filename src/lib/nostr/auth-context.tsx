"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { decodeNostrKey, generateNewNostrIdentity, pubkeyToNpub } from "./keys";
import { getSavedRelays, saveRelays, DEFAULT_NOSTR_RELAYS, getNostrPool } from "./relays";
import { publishNostrProfile } from "./events";
import type { NostrExtension, NostrIdentity, NostrProfileMetadata } from "./types";

const LOCAL_STORAGE_IDENTITY_KEY = "bc_nostr_identity";

type NostrContextType = {
  identity: NostrIdentity | null;
  loading: boolean;
  relays: string[];
  setRelays: (relays: string[]) => void;
  loginWithExtension: () => Promise<boolean>;
  loginWithKey: (keyInput: string) => Promise<boolean>;
  createGuestOrNewAccount: () => NostrIdentity;
  logout: () => void;
  updateProfile: (meta: NostrProfileMetadata) => Promise<boolean>;
};

const NostrContext = createContext<NostrContextType | null>(null);

export function NostrAuthProvider({ children }: { children: React.ReactNode }) {
  const [identity, setIdentity] = useState<NostrIdentity | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_IDENTITY_KEY);
      return saved ? (JSON.parse(saved) as NostrIdentity) : null;
    } catch {
      return null;
    }
  });
  const loading = false;
  const [relays, setRelaysState] = useState<string[]>(() => {
    if (typeof window === "undefined") return DEFAULT_NOSTR_RELAYS;
    return getSavedRelays();
  });

  const setRelays = useCallback((newRelays: string[]) => {
    setRelaysState(newRelays);
    saveRelays(newRelays);
  }, []);

  // Buscar metadados do perfil nos relays em background caso exista identidade
  useEffect(() => {
    if (!identity?.pubkey) return;

    let active = true;
    const pool = getNostrPool();
    const activeRelays = getSavedRelays();

    pool
      .get(activeRelays, { kinds: [0], authors: [identity.pubkey] })
      .then((ev) => {
        if (active && ev?.content) {
          try {
            const profile = JSON.parse(ev.content) as NostrProfileMetadata;
            setIdentity((curr) => (curr ? { ...curr, profile } : null));
          } catch {
            // ignore
          }
        }
      })
      .catch(() => null);

    return () => {
      active = false;
    };
  }, [identity?.pubkey]);

  const persistIdentity = useCallback((id: NostrIdentity | null) => {
    setIdentity(id);
    if (typeof window === "undefined") return;
    if (id) {
      localStorage.setItem(LOCAL_STORAGE_IDENTITY_KEY, JSON.stringify(id));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_IDENTITY_KEY);
    }
  }, []);

  // Login via Extensão NIP-07 (Alby, nos2x, etc.)
  const loginWithExtension = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined") return false;
    const nostrExt = (window as unknown as { nostr?: NostrExtension }).nostr;
    if (!nostrExt?.getPublicKey) return false;

    try {
      const pubkey = await nostrExt.getPublicKey();
      if (!pubkey) return false;

      const npub = pubkeyToNpub(pubkey);
      const newIdentity: NostrIdentity = {
        pubkey,
        npub,
        mode: "extension",
      };
      persistIdentity(newIdentity);
      return true;
    } catch {
      return false;
    }
  }, [persistIdentity]);

  // Login com chave privada (nsec1... ou hex)
  const loginWithKey = useCallback(
    async (keyInput: string): Promise<boolean> => {
      const decoded = decodeNostrKey(keyInput);
      if (decoded.type === "nsec" && decoded.hexPubkey) {
        const npub = pubkeyToNpub(decoded.hexPubkey);
        const newIdentity: NostrIdentity = {
          pubkey: decoded.hexPubkey,
          npub,
          nsec: keyInput.trim(),
          mode: "nsec",
        };
        persistIdentity(newIdentity);
        return true;
      }
      if (decoded.type === "npub" && decoded.hexPubkey) {
        // Read-only login via npub
        const newIdentity: NostrIdentity = {
          pubkey: decoded.hexPubkey,
          npub: keyInput.trim(),
          mode: "guest",
        };
        persistIdentity(newIdentity);
        return true;
      }
      return false;
    },
    [persistIdentity],
  );

  // Criar nova conta instantânea com par de chaves
  const createGuestOrNewAccount = useCallback((): NostrIdentity => {
    const newId = generateNewNostrIdentity();
    persistIdentity(newId);
    return newId;
  }, [persistIdentity]);

  // Logout
  const logout = useCallback(() => {
    persistIdentity(null);
  }, [persistIdentity]);

  // Atualizar perfil
  const updateProfile = useCallback(
    async (meta: NostrProfileMetadata): Promise<boolean> => {
      if (!identity) return false;
      try {
        await publishNostrProfile({ metadata: meta, identity, relays });
        const updated = { ...identity, profile: meta };
        persistIdentity(updated);
        return true;
      } catch {
        return false;
      }
    },
    [identity, relays, persistIdentity],
  );

  return (
    <NostrContext.Provider
      value={{
        identity,
        loading,
        relays,
        setRelays,
        loginWithExtension,
        loginWithKey,
        createGuestOrNewAccount,
        logout,
        updateProfile,
      }}
    >
      {children}
    </NostrContext.Provider>
  );
}

export function useNostrAuth() {
  const ctx = useContext(NostrContext);
  if (!ctx) {
    throw new Error("useNostrAuth deve ser usado dentro de um NostrAuthProvider.");
  }
  return ctx;
}
