import { BcImage } from "./BcImage";

type UserAvatarProps = {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: { class: "h-10 w-10 text-sm", px: 40 },
  md: { class: "h-16 w-16 text-2xl", px: 64 },
  lg: { class: "h-24 w-24 text-4xl", px: 96 },
};

export function UserAvatar({ name, avatarUrl, size = "sm" }: UserAvatarProps) {
  const { class: sizeClass, px } = sizes[size];

  if (avatarUrl) {
    return (
      <div
        className={`relative ${sizeClass} shrink-0 overflow-hidden rounded-full`}
      >
        <BcImage
          src={avatarUrl}
          alt={name}
          fill
          sizes={`${px}px`}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-bc-caramel/40 font-bold text-bc-brown`}
      aria-hidden
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
