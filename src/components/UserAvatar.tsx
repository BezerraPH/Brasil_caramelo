import type { PetAvatarStatus } from "@/lib/pet";
import { BcImage } from "./BcImage";
import { PremiumBadge } from "./PremiumBadge";

type UserAvatarProps = {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
  isPremium?: boolean;
  petStatus?: PetAvatarStatus | null;
};

const sizes = {
  sm: { class: "h-10 w-10 text-sm", px: 40 },
  md: { class: "h-16 w-16 text-2xl", px: 64 },
  lg: { class: "h-24 w-24 text-4xl", px: 96 },
};

const petRings: Record<PetAvatarStatus, string> = {
  happy: "ring-2 ring-bc-green/50 ring-offset-1",
  ok: "",
  hungry: "ring-2 ring-orange-400 ring-offset-1",
  starving: "ring-2 ring-red-500 ring-offset-1",
};

export function UserAvatar({
  name,
  avatarUrl,
  size = "sm",
  isPremium,
  petStatus,
}: UserAvatarProps) {
  const { class: sizeClass, px } = sizes[size];
  const ring = isPremium
    ? "ring-2 ring-bc-gold ring-offset-1"
    : petStatus
      ? petRings[petStatus]
      : "";

  const inner = avatarUrl ? (
    <div className={`relative ${sizeClass} overflow-hidden rounded-full`}>
      <BcImage
        src={avatarUrl}
        alt={name}
        fill
        sizes={`${px}px`}
        className="object-cover"
      />
    </div>
  ) : (
    <div
      className={`${sizeClass} flex items-center justify-center rounded-full bg-bc-caramel/40 font-bold text-bc-brown`}
      aria-hidden
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );

  return (
    <div className={`relative shrink-0 rounded-full ${ring}`}>
      {inner}
      {petStatus === "starving" && (
        <span
          className="absolute -left-0.5 -top-0.5 text-xs"
          title="Pet com fome — visite o quintal!"
          aria-hidden
        >
          🦴
        </span>
      )}
      {petStatus === "hungry" && (
        <span
          className="absolute -right-0.5 -top-0.5 text-[10px]"
          title="Pet precisando de carinho"
          aria-hidden
        >
          🍖
        </span>
      )}
      {isPremium && (
        <span className="absolute -bottom-0.5 -right-0.5">
          <PremiumBadge compact />
        </span>
      )}
    </div>
  );
}
