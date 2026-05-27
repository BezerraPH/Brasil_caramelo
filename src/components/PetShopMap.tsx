"use client";

import { latLngToMapPercent } from "@/lib/pet-shop-geo";

export type PetShopMapPin = {
  id: string;
  shopName: string;
  title: string;
  lat: number;
  lng: number;
  neighborhood?: string | null;
  selected?: boolean;
};

type PetShopMapProps = {
  pins: PetShopMapPin[];
  onSelect?: (id: string) => void;
  selectedId?: string | null;
};

export function PetShopMap({ pins, onSelect, selectedId }: PetShopMapProps) {
  const mappable = pins.filter((p) => p.lat != null && p.lng != null);

  return (
    <div className="bc-pet-shop-map relative overflow-hidden rounded-2xl border border-bc-green/25">
      <div className="bc-pet-shop-map__bg absolute inset-0" aria-hidden />
      <p className="relative z-10 px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-bc-green/90">
        Mapa da matilha — PE
      </p>
      <div className="relative z-10 mx-3 mb-3 aspect-[4/3] min-h-[200px] rounded-xl bg-bc-green/5">
        {mappable.length === 0 ? (
          <p className="flex h-full items-center justify-center text-xs text-bc-brown">
            Sem coordenadas para exibir no mapa.
          </p>
        ) : (
          mappable.map((pin) => {
            const pos = latLngToMapPercent(pin.lat, pin.lng);
            const active = selectedId === pin.id || pin.selected;
            return (
              <button
                key={pin.id}
                type="button"
                title={`${pin.shopName} — ${pin.title}`}
                onClick={() => onSelect?.(pin.id)}
                className={`bc-pet-shop-pin absolute -translate-x-1/2 -translate-y-full ${active ? "bc-pet-shop-pin--active" : ""}`}
                style={{ left: pos.left, top: pos.top }}
              >
                <span className="bc-pet-shop-pin__dot">🏪</span>
                {active && (
                  <span className="bc-pet-shop-pin__label">{pin.neighborhood ?? pin.shopName}</span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
