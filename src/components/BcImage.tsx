import Image from "next/image";

type BcImageProps = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

function isLocalMedia(src: string) {
  return src.startsWith("/api/media/");
}

export function BcImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  sizes,
  priority,
}: BcImageProps) {
  const altText = alt ?? "";

  if (isLocalMedia(src)) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={altText}
          className={`absolute inset-0 h-full w-full object-cover ${className ?? ""}`}
        />
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={altText}
        width={width ?? 600}
        height={height ?? 600}
        className={className}
      />
    );
  }

  const sizeHint = sizes ?? "(max-width: 768px) 100vw, 50vw";

  if (fill) {
    return (
      <Image
        src={src}
        alt={altText}
        fill
        sizes={sizeHint}
        priority={priority}
        className={`object-cover ${className ?? ""}`}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={altText}
      width={width ?? 600}
      height={height ?? 600}
      sizes={sizeHint}
      priority={priority}
      className={className}
    />
  );
}
