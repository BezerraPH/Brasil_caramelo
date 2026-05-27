"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useAsyncEffect } from "@/hooks/use-async-effect";
import { PetShopMap, type PetShopMapPin } from "@/components/PetShopMap";

type Partner = {
  id: string;
  shopName: string;
  title: string;
  coinCost: number;
  city: string | null;
  neighborhood: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  partnerUrl: string | null;
  distanceKm: number | null;
};

type PetShopExplorerProps = {
  defaultRegion?: string | null;
};

export function PetShopExplorer({ defaultRegion }: PetShopExplorerProps) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [region, setRegion] = useState(defaultRegion ?? "");
  const [city, setCity] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [radar, setRadar] = useState<{ city: string | null; area: string | null } | null>(
    null,
  );

  const load = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams();
    if (region.trim()) q.set("region", region.trim());
    if (city.trim()) q.set("city", city.trim());
    const res = await fetch(`/api/pet-shop/partners?${q.toString()}`);
    const data = await res.json();
    if (res.ok) {
      setPartners(data.partners ?? []);
      setRadar(data.userRadar ?? null);
      if (!city && data.filterCity) setCity(data.filterCity);
    }
    setLoading(false);
  }, [region, city]);

  useAsyncEffect(() => {
    void load();
  }, [load]);

  const pins: PetShopMapPin[] = partners
    .filter((p) => p.lat != null && p.lng != null)
    .map((p) => ({
      id: p.id,
      shopName: p.shopName,
      title: p.title,
      lat: p.lat!,
      lng: p.lng!,
      neighborhood: p.neighborhood,
      selected: p.id === selectedId,
    }));

  const selected = partners.find((p) => p.id === selectedId);

  return (
    <div className="space-y-6">
      <div className="bc-card flex flex-wrap gap-2 p-4">
        <input
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="Região (ex: Recife)"
          className="bc-input min-w-[120px] flex-1 text-sm"
        />
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Cidade"
          className="bc-input min-w-[120px] flex-1 text-sm"
        />
        <button type="button" onClick={() => void load()} className="bc-btn-primary text-sm">
          Filtrar
        </button>
      </div>

      {radar?.city && (
        <p className="text-xs text-bc-brown">
          📍 Seu radar: {radar.city}
          {radar.area ? ` · ${radar.area}` : ""} —{" "}
          <Link href="/configuracoes" className="text-bc-blue hover:underline">
            ajustar
          </Link>
        </p>
      )}

      <PetShopMap
        pins={pins}
        selectedId={selectedId}
        onSelect={(id) => setSelectedId(id)}
      />

      {selected && (
        <div className="bc-card bc-animate-in border-bc-caramel/30 p-4">
          <p className="font-bold text-bc-blue">{selected.shopName}</p>
          <p className="text-sm text-bc-brown">{selected.title}</p>
          {selected.address && (
            <p className="mt-1 text-xs text-bc-brown">📍 {selected.address}</p>
          )}
          {selected.distanceKm != null && (
            <p className="text-xs text-bc-green">~{selected.distanceKm} km do centro</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {selected.partnerUrl && (
              <a
                href={selected.partnerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bc-btn-secondary text-xs"
              >
                Abrir no mapa
              </a>
            )}
            <Link href="/premium" className="bc-btn-gold text-xs">
              Resgatar cupom →
            </Link>
          </div>
        </div>
      )}

      {loading ? (
        <p className="animate-pulse text-sm text-bc-brown">Carregando parceiros…</p>
      ) : partners.length === 0 ? (
        <p className="text-sm text-bc-brown">
          Nenhum pet shop nesta região. Tente Recife ou Caruaru.
        </p>
      ) : (
        <ul className="space-y-3">
          {partners.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setSelectedId(p.id)}
                className={`bc-pet-shop-list-item bc-animate-in-up w-full rounded-xl border p-4 text-left transition ${selectedId === p.id ? "border-bc-caramel bg-bc-caramel/10" : "border-bc-green/20 bg-bc-white/80"}`}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <p className="text-xs font-semibold text-bc-green">{p.shopName}</p>
                <p className="font-medium text-bc-blue">{p.title}</p>
                <p className="mt-1 text-xs text-bc-brown">
                  {p.neighborhood && `${p.neighborhood} · `}
                  {p.coinCost} 🪙
                  {p.distanceKm != null && ` · ~${p.distanceKm} km`}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
