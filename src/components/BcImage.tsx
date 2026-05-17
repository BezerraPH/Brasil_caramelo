import Image from "next/image";

type BcImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

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
  const shared = {
    src,
    alt,
    className,
    sizes: sizes ?? "(max-width: 768px) 100vw, 50vw",
    priority,
  };

  if (fill) {
    return (
      <Image
        {...shared}
        fill
        className={`object-cover ${className ?? ""}`}
      />
    );
  }

  return (
    <Image
      {...shared}
      width={width ?? 600}
      height={height ?? 600}
      className={className}
    />
  );
}
