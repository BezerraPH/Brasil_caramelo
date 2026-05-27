"use client";

type PetMascotBurstProps = {
  petName: string;
  petColor: string;
  show: boolean;
};

/** Diário de Bordo do Pet — reação no Cinelar ao curtir. */
export function PetMascotBurst({ petName, petColor, show }: PetMascotBurstProps) {
  if (!show) return null;

  return (
    <div className="bc-pet-mascot-burst pointer-events-none absolute bottom-24 left-4 z-10 flex items-end gap-2">
      <div
        className="bc-pet-mascot-pop flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-white/30 text-2xl shadow-lg"
        style={{ backgroundColor: petColor }}
        title={petName}
      >
        🐕
      </div>
      <span className="bc-pet-mascot-bark rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white">
        Au au! — {petName}
      </span>
    </div>
  );
}
