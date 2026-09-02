"use client";

import { useState } from "react";
import Image from "next/image";
import { useNostrAuth } from "@/lib/nostr/auth-context";
import { publishNostrProfile } from "@/lib/nostr/events";
import { shortenNpub } from "@/lib/nostr/keys";
import type { NostrProfileMetadata } from "@/lib/nostr/types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  currentProfile?: NostrProfileMetadata;
  onProfileUpdated?: (updated: NostrProfileMetadata) => void;
};

const DOG_BREEDS = [
  "Vira-lata Caramelo",
  "Poodle",
  "Pitbull",
  "Salsicha (Dachshund)",
  "Pastor Alemão",
  "Labrador",
  "Golden Retriever",
  "Pinscher Furioso",
  "Husky Siberiano",
  "Buldogue Francês",
];

export function NostrProfileModal({
  isOpen,
  onClose,
  currentProfile,
  onProfileUpdated,
}: Props) {
  const { identity, relays } = useNostrAuth();

  const [name, setName] = useState(currentProfile?.name || "");
  const [displayName, setDisplayName] = useState(currentProfile?.display_name || "");
  const [about, setAbout] = useState(currentProfile?.about || "");
  const [picture, setPicture] = useState(currentProfile?.picture || "");
  const [banner, setBanner] = useState(currentProfile?.banner || "");
  const [dogBreed, setDogBreed] = useState(currentProfile?.dog_breed || "Vira-lata Caramelo");
  const [nip05, setNip05] = useState(currentProfile?.nip05 || "");
  const [lud16, setLud16] = useState(currentProfile?.lud16 || "");
  const [website, setWebsite] = useState(currentProfile?.website || "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!identity) {
      setError("Você precisa estar autenticado no Nostr para salvar seu perfil.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const metadata: NostrProfileMetadata = {
        name: name.trim() || undefined,
        display_name: displayName.trim() || name.trim() || undefined,
        about: about.trim() || undefined,
        picture: picture.trim() || undefined,
        banner: banner.trim() || undefined,
        dog_breed: dogBreed || undefined,
        nip05: nip05.trim() || undefined,
        lud16: lud16.trim() || undefined,
        website: website.trim() || undefined,
      };

      await publishNostrProfile({
        metadata,
        identity,
        relays,
      });

      setSuccess(true);
      onProfileUpdated?.(metadata);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao propagar perfil nos relays Nostr.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="bc-card relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-bc-caramel/30 bg-bc-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-bc-brown/60 hover:bg-black/5 hover:text-bc-brown"
          title="Fechar"
        >
          ✕
        </button>

        <div className="flex items-center gap-3">
          <span className="text-3xl">🐾</span>
          <div>
            <h2 className="text-xl font-black text-bc-blue">Editar Perfil Nostr</h2>
            <p className="text-xs text-bc-brown/70">
              {identity ? shortenNpub(identity.npub, 8) : "Identidade Descentralizada"}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-500/10 p-3 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-xl bg-bc-green/15 p-3 text-xs font-semibold text-bc-green">
            ✓ Perfil assinado com Schnorr e propagado para os relays!
          </div>
        )}

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {/* Avatar Preview */}
          <div className="flex items-center gap-4 rounded-2xl bg-bc-cream/50 p-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-bc-caramel/30 bg-gradient-to-br from-bc-caramel/40 to-bc-green/30">
              {picture ? (
                <Image
                  src={picture}
                  alt="Avatar Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl">🐕</div>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-bc-brown">URL da Foto de Perfil</label>
              <input
                type="url"
                value={picture}
                onChange={(e) => setPicture(e.target.value)}
                placeholder="https://exemplo.com/foto-do-pet.jpg"
                className="mt-1 w-full rounded-xl border border-bc-caramel/30 bg-bc-white px-3 py-1.5 text-xs text-bc-brown focus:border-bc-blue focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-bc-brown">Nome de Exibição</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Caramelo Campeão"
                className="mt-1 w-full rounded-xl border border-bc-caramel/30 bg-bc-white px-3 py-2 text-xs text-bc-brown focus:border-bc-blue focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-bc-brown">Apelido (Display Name)</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Mestrinho"
                className="mt-1 w-full rounded-xl border border-bc-caramel/30 bg-bc-white px-3 py-2 text-xs text-bc-brown focus:border-bc-blue focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-bc-brown">Raça / Arquétipo</label>
              <select
                value={dogBreed}
                onChange={(e) => setDogBreed(e.target.value)}
                className="mt-1 w-full rounded-xl border border-bc-caramel/30 bg-bc-white px-3 py-2 text-xs text-bc-brown focus:border-bc-blue focus:outline-none"
              >
                {DOG_BREEDS.map((breed) => (
                  <option key={breed} value={breed}>
                    {breed}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-bc-brown">Website / Link</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://meucao.com"
                className="mt-1 w-full rounded-xl border border-bc-caramel/30 bg-bc-white px-3 py-2 text-xs text-bc-brown focus:border-bc-blue focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-bc-brown">Bio / Sobre o Pet</label>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={2}
              placeholder="O cão mais veloz do bairro, caçador de chinelos e amante de petiscos..."
              className="mt-1 w-full rounded-xl border border-bc-caramel/30 bg-bc-white px-3 py-2 text-xs text-bc-brown focus:border-bc-blue focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-bc-brown">
                ⚡ Lightning Address (Zaps)
              </label>
              <input
                type="text"
                value={lud16}
                onChange={(e) => setLud16(e.target.value)}
                placeholder="pet@getalby.com ou sats@wallet"
                className="mt-1 w-full rounded-xl border border-bc-caramel/30 bg-bc-white px-3 py-2 text-xs text-bc-brown focus:border-bc-blue focus:outline-none"
              />
              <p className="mt-0.5 text-[10px] text-bc-brown/60">Para receber gorjetas em sats.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-bc-brown">
                🛡️ NIP-05 (Identidade)
              </label>
              <input
                type="text"
                value={nip05}
                onChange={(e) => setNip05(e.target.value)}
                placeholder="caramelo@brasilcaramelo.app"
                className="mt-1 w-full rounded-xl border border-bc-caramel/30 bg-bc-white px-3 py-2 text-xs text-bc-brown focus:border-bc-blue focus:outline-none"
              />
              <p className="mt-0.5 text-[10px] text-bc-brown/60">Selo verificado via DNS.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-bc-brown">URL do Banner</label>
            <input
              type="url"
              value={banner}
              onChange={(e) => setBanner(e.target.value)}
              placeholder="https://exemplo.com/banner.jpg"
              className="mt-1 w-full rounded-xl border border-bc-caramel/30 bg-bc-white px-3 py-2 text-xs text-bc-brown focus:border-bc-blue focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-bc-caramel/30 px-4 py-2 text-xs font-bold text-bc-brown hover:bg-bc-cream"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-bc-green px-5 py-2 text-xs font-bold text-bc-white shadow-md hover:bg-bc-green-dark disabled:opacity-50"
            >
              {saving ? "Propagando..." : "Salvar no Nostr"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
