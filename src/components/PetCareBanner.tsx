import Link from "next/link";
import type { PetAvatarStatus } from "@/lib/pet";

type PetCareBannerProps = {
  status: PetAvatarStatus;
};

export function PetCareBanner({ status }: PetCareBannerProps) {
  if (status !== "hungry" && status !== "starving") return null;

  const urgent = status === "starving";

  return (
    <Link
      href="/cachorro"
      className={`bc-animate-in mb-4 flex items-center gap-3 rounded-2xl border-2 px-4 py-3 transition hover:scale-[1.01] ${
        urgent
          ? "border-red-400/60 bg-red-50/90 dark:bg-red-950/30"
          : "border-bc-caramel/50 bg-bc-caramel/15"
      }`}
    >
      <span className="text-2xl">{urgent ? "🆘" : "🦴"}</span>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-bc-blue">
          {urgent ? "Seu cachorro está faminto!" : "Hora de cuidar do pet"}
        </p>
        <p className="text-xs text-bc-brown">
          {urgent
            ? "Abra o jogo e dê comida agora — os status caem a cada 4h."
            : "Visite /cachorro para alimentar, brincar ou descansar."}
        </p>
      </div>
      <span className="shrink-0 text-sm font-semibold text-bc-green">Ir →</span>
    </Link>
  );
}
