type UserAvatarProps = {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "h-10 w-10 text-sm",
  md: "h-16 w-16 text-2xl",
  lg: "h-24 w-24 text-4xl",
};

export function UserAvatar({ name, avatarUrl, size = "sm" }: UserAvatarProps) {
  const sizeClass = sizes[size];

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        className={`${sizeClass} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex items-center justify-center rounded-full bg-bc-caramel/40 font-bold text-bc-brown`}
      aria-hidden
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

