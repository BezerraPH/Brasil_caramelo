import { BcImage } from "./BcImage";
import { PremiumBadge } from "./PremiumBadge";

type UserAvatarProps = {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
  isPremium?: boolean;
};

const sizes = {
  sm: { class: "h-10 w-10 text-sm", px: 40 },
  md: { class: "h-16 w-16 text-2xl", px: 64 },
  lg: { class: "h-24 w-24 text-4xl", px: 96 },
};

export function UserAvatar({
  name,
  avatarUrl,
  size = "sm",
  isPremium,
}: UserAvatarProps) {
  const { class: sizeClass, px } = sizes[size];
  const ring = isPremium ? "ring-2 ring-bc-gold ring-offset-1" : "";

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
      {isPremium && (
        <span className="absolute -bottom-0.5 -right-0.5">
          <PremiumBadge compact />
        </span>
      )}
    </div>
  );
}
