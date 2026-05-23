"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

type BcVideoProps = Omit<
  React.VideoHTMLAttributes<HTMLVideoElement>,
  "src"
> & {
  /** URL MP4/WebM de fallback */
  src: string;
  /** Playlist HLS quando disponível */
  hlsSrc?: string | null;
};

function isHlsUrl(url: string): boolean {
  return url.includes(".m3u8") || url.includes("_hls/");
}

export const BcVideo = forwardRef<HTMLVideoElement, BcVideoProps>(
  function BcVideo({ src, hlsSrc, className, ...rest }, forwardedRef) {
    const innerRef = useRef<HTMLVideoElement>(null);
    const streamSrc = hlsSrc?.trim() || src;

    useImperativeHandle(forwardedRef, () => innerRef.current as HTMLVideoElement);

    useEffect(() => {
      const video = innerRef.current;
      if (!video) return;

      if (!isHlsUrl(streamSrc)) {
        video.src = streamSrc;
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamSrc;
        return;
      }

      let destroyed = false;
      let instance: { destroy: () => void } | null = null;

      void import("hls.js").then(({ default: Hls }) => {
        if (destroyed || !innerRef.current) return;
        if (Hls.isSupported()) {
          const hls = new Hls({ enableWorker: true });
          hls.loadSource(streamSrc);
          hls.attachMedia(innerRef.current);
          instance = hls;
        } else {
          innerRef.current.src = src;
        }
      });

      return () => {
        destroyed = true;
        instance?.destroy();
      };
    }, [streamSrc, src]);

    return <video ref={innerRef} className={className} {...rest} />;
  },
);
