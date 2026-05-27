type ProfilePetHighlightProps = {
  petName: string;
  petColor: string;
  level: number;
};

/** Destaque estilo Insta Stories — carinha do pet. */
export function ProfilePetHighlight({ petName, petColor, level }: ProfilePetHighlightProps) {
  return (
    <div className="mb-4 flex items-center gap-3 rounded-xl border-2 border-bc-caramel/40 bg-bc-caramel/5 p-3">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full text-2xl ring-2 ring-bc-caramel ring-offset-2"
        style={{ backgroundColor: `${petColor}33`, borderColor: petColor }}
      >
        🐕
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-bc-caramel">Highlight</p>
        <p className="font-bold text-bc-blue">{petName}</p>
        <p className="text-[10px] text-bc-brown">Nv. {level} · Pet da matilha</p>
      </div>
    </div>
  );
}
