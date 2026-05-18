"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

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
  const [loaded, setLoaded] = useState(false);
  const [blurBg, setBlurBg] = useState<string | null>(null);
  const local = isLocalMedia(src);

  useEffect(() => {
    if (!local) return;
    let cancelled = false;
    void fetch(`${src}?blur=1`)
      .then((r) => (r.ok ? r.text() : null))
      .then((data) => {
        if (cancelled || !data?.startsWith("data:")) return;
        setBlurBg(`url("${data}")`);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [src, local]);

  const imgClass = [
    className,
    local ? "bc-image-fade" : "",
    local && loaded ? "bc-image-fade--loaded" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (local) {
    const placeholder = (
      <>
        {blurBg && (
          <span
            className="bc-image-blur absolute inset-0 scale-110 bg-cover bg-center"
            style={{ backgroundImage: blurBg }}
            aria-hidden
          />
        )}
        {!loaded && (
          <span className="bc-skeleton absolute inset-0 rounded-none" aria-hidden />
        )}
      </>
    );

    if (fill) {
      return (
        <span className="bc-image-wrap relative block h-full w-full overflow-hidden">
          {placeholder}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={altText}
            className={`absolute inset-0 h-full w-full object-cover ${imgClass}`}
            onLoad={() => setLoaded(true)}
          />
        </span>
      );
    }
    return (
      <span
        className="bc-image-wrap relative inline-block overflow-hidden"
        style={{ width: width ?? 600, height: height ?? 600 }}
      >
        {placeholder}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={altText}
          width={width ?? 600}
          height={height ?? 600}
          className={imgClass}
          onLoad={() => setLoaded(true)}
        />
      </span>
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
